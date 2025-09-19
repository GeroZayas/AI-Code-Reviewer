
import { GoogleGenAI, Type } from "@google/genai";
import { ReviewIssue } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The responseSchema defines the exact JSON structure the AI must return.
const reviewSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            line: {
                type: Type.STRING,
                description: "The line number(s) where the issue occurs (e.g., '15' or '20-25'). Can be a string to represent a range.",
            },
            severity: {
                type: Type.STRING,
                description: "The severity of the issue. Must be one of: 'Critical', 'Major', 'Minor', 'Info'.",
            },
            description: {
                type: Type.STRING,
                description: "A clear and concise explanation of the code issue.",
            },
            suggestion: {
                type: Type.STRING,
                description: "A concrete suggestion on how to fix the issue, including code snippets if applicable.",
            },
        },
        // All properties are required for each review issue.
        required: ["line", "severity", "description", "suggestion"],
    },
};

export const reviewCode = async (code: string, language: string): Promise<ReviewIssue[]> => {
    // The system instruction sets the context and goal for the AI.
    // This is more effective than putting all instructions in the main prompt.
    const systemInstruction = `You are an expert AI code reviewer. Your task is to analyze the provided code snippet for issues related to quality, performance, and correctness.
For each issue you identify, you must provide feedback in the specified JSON format according to the schema.
- 'line': The line number or range where the issue is.
- 'severity': Classify the issue as 'Critical', 'Major', 'Minor', or 'Info'.
- 'description': Briefly explain the problem.
- 'suggestion': Provide a clear, actionable way to fix it.
If the code is perfect and has no issues, you must return an empty array.`;

    // The user's content is the code to be reviewed.
    const prompt = `Please review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: reviewSchema,
                temperature: 0.2, // Lower temperature for more deterministic, factual reviews.
            },
        });

        const textResponse = response.text?.trim();

        // If the response is empty or just whitespace, assume no issues were found,
        // which fixes the "Received an empty response" error.
        if (!textResponse) {
            console.log("Received an empty response from AI, assuming no issues.");
            return [];
        }

        // With `responseSchema`, the output should be a valid JSON string.
        // We parse it directly, which is simpler and more reliable.
        try {
            const parsedData = JSON.parse(textResponse);
            if (Array.isArray(parsedData)) {
                return parsedData as ReviewIssue[];
            } else {
                throw new Error("Response was valid JSON but not an array as expected.");
            }
        } catch (e) {
            console.error("Failed to parse JSON response from AI. Raw response:", textResponse, e);
            throw new Error("The AI returned a malformed response. Please try again.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Error communicating with the AI service: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI service.");
    }
};
