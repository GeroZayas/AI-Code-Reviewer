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
                description: "The line number(s) where the issue occurs (e.g., '15' or '20-25'). Can be a string to represent a range. IMPORTANT: Do not group thousands of unrelated lines into one issue; create separate issues for distinct problems.",
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


export const reviewCode = async (code: string, language: string, isDodOptimized: boolean): Promise<ReviewIssue[]> => {
    let systemInstruction = `You are an expert code reviewer. Analyze the following ${language} code and provide feedback. Identify issues related to code quality, bugs, performance, and best practices. Your response must be in JSON format, adhering to the provided schema. For each issue, provide the line number, severity, a description of the issue, and a concrete suggestion for improvement.`;
    
    if (isDodOptimized) {
        systemInstruction += `
        \n**SPECIAL INSTRUCTION: Activate Review Optimization with a very strong Focus on Procedural Programming and Data-Oriented Design (DOD).**
        - **Data Focus:** Prioritize efficient data layout and transformation.
        - **Data Layout:** Look for opportunities to organize data into contiguous memory blocks (e.g., structs of arrays vs. arrays of structs) to improve sequential processing.
        - **CPU Cache Optimization:** Identify patterns that cause cache misses (e.g., scattered data access) and suggest alternatives that improve cache utilization.
        - **Transformations:** Analyze the code in terms of data transformations from input to output, rather than abstract objects. Suggest simplifying logic by focusing on these transformations.
        - **Separation of Data:** Recommend separating data based on usage patterns rather than bundling it into large, general-purpose objects.
        - **Performance:** Provide suggestions that can lead to significant speedups, especially in data-intensive parts of the code.
        - **Simplicity:** Favor simpler, more focused logic over complex object hierarchies.`;
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: code,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: reviewSchema,
                // The effective token limit for the response is `maxOutputTokens` minus the `thinkingBudget`.
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 1024 },
            },
        });

        const jsonString = response.text.trim();
        const review = JSON.parse(jsonString) as ReviewIssue[];
        return review;

    } catch (e) {
        if (e instanceof SyntaxError) {
             console.error("Failed to parse JSON response from AI. Raw response text:", (e as any).text);
             throw new Error("The AI returned a malformed response. Please try again.");
        }
        console.error("Error calling Gemini API:", e);
        throw new Error("An error occurred while communicating with the AI service.");
    }
};
