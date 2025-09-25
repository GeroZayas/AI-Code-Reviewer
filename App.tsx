import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { ReviewOutput } from './components/ReviewOutput';
import { reviewCode } from './services/geminiService';
import { ReviewIssue, Severity } from './types';
import { SUPPORTED_LANGUAGES } from './constants';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]);
  const [review, setReview] = useState<ReviewIssue[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [isDodOptimized, setIsDodOptimized] = useState<boolean>(false);

  const handleReview = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to review.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReview(null);
    setSeverityFilter('All'); // Reset filter on new review

    try {
      const result = await reviewCode(code, language, isDodOptimized);
      setReview(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get review. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, isDodOptimized]);

  const handleToggleDone = useCallback((issueIndex: number) => {
    setReview(prevReview => {
        if (!prevReview) return null;
        return prevReview.map((issue, index) =>
            index === issueIndex ? { ...issue, done: !issue.done } : issue
        );
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <CodeInput
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          onSubmit={handleReview}
          isLoading={isLoading}
          isDodOptimized={isDodOptimized}
          setIsDodOptimized={setIsDodOptimized}
        />
        <ReviewOutput
          review={review}
          error={error}
          isLoading={isLoading}
          onToggleDone={handleToggleDone}
          severityFilter={severityFilter}
          onFilterChange={setSeverityFilter}
        />
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini. For educational and demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;