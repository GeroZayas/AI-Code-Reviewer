
import React, { useMemo, useCallback } from 'react';
import { ReviewIssue, Severity } from '../types';
import { Loader } from './Loader';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from './icons/SeverityIcons';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { generateMarkdownReport } from '../utils/markdownGenerator';

interface ReviewOutputProps {
  review: ReviewIssue[] | null;
  error: string | null;
  isLoading: boolean;
  onToggleDone: (index: number) => void;
  severityFilter: Severity | 'All';
  onFilterChange: (filter: Severity | 'All') => void;
}

const severityConfig: Record<Severity, { icon: React.ReactNode, color: string, title: string }> = {
  [Severity.Critical]: {
    icon: <XCircleIcon className="h-6 w-6" />,
    color: 'border-red-500/50 bg-red-900/20 text-red-300',
    title: 'Critical Issue'
  },
  [Severity.Major]: {
    icon: <AlertTriangleIcon className="h-6 w-6" />,
    color: 'border-orange-500/50 bg-orange-900/20 text-orange-300',
    title: 'Major Issue'
  },
  [Severity.Minor]: {
    icon: <InfoIcon className="h-6 w-6" />,
    color: 'border-yellow-500/50 bg-yellow-900/20 text-yellow-300',
    title: 'Minor Issue'
  },
  [Severity.Info]: {
    icon: <CheckCircleIcon className="h-6 w-6" />,
    color: 'border-blue-500/50 bg-blue-900/20 text-blue-300',
    title: 'Information'
  },
};

const filterOptions: (Severity | 'All')[] = ['All', Severity.Critical, Severity.Major, Severity.Minor, Severity.Info];

const ReviewCard: React.FC<{ issue: ReviewIssue; onToggleDone: () => void; }> = ({ issue, onToggleDone }) => {
    const config = severityConfig[issue.severity] || severityConfig[Severity.Info];
    const isDone = !!issue.done;

    return (
        <div className={`rounded-lg border p-4 shadow-md transition-all duration-300 ${config.color} ${isDone ? 'opacity-60 bg-gray-800/30' : ''}`}>
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 pt-0.5">{config.icon}</div>
                <div className="flex-grow">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                            <h3 className={`font-semibold text-lg ${isDone ? 'line-through' : ''}`}>{config.title}</h3>
                            <span className="text-sm font-mono bg-gray-700/50 px-2 py-0.5 rounded">Line: {issue.line}</span>
                        </div>
                        <button
                            onClick={onToggleDone}
                            title={isDone ? 'Mark as not done' : 'Mark as done'}
                            className={`flex-shrink-0 flex items-center space-x-2 text-sm px-3 py-1 rounded-md transition-colors ${
                                isDone
                                ? 'bg-green-600/30 text-green-300 hover:bg-green-600/50'
                                : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'
                            }`}
                        >
                            <CheckIcon className="h-4 w-4" />
                            <span>{isDone ? 'Done' : 'Mark Done'}</span>
                        </button>
                    </div>
                    <p className={`mt-2 text-gray-300 ${isDone ? 'line-through' : ''}`}>{issue.description}</p>
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <h4 className="font-semibold text-gray-200">Suggestion:</h4>
                        <div className={`mt-1 prose prose-sm prose-invert prose-pre:bg-gray-800/70 prose-pre:p-3 prose-pre:rounded-md max-w-none ${isDone ? 'line-through' : ''}`}>
                            <pre className="font-fira-code text-sm whitespace-pre-wrap">{issue.suggestion}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, error, isLoading, onToggleDone, severityFilter, onFilterChange }) => {
  const counts = useMemo(() => {
    if (!review) {
        return { All: 0 };
    }
    const severityCounts = review.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        ...severityCounts,
        All: review.length,
    };
  }, [review]);

  const filteredReview = useMemo(() => {
    if (!review) return null;
    if (severityFilter === 'All') return review;
    return review.filter(issue => issue.severity === severityFilter);
  }, [review, severityFilter]);
    
  const handleDownload = useCallback(() => {
    if (!review) return;

    const markdownContent = generateMarkdownReport(review);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'code-review-report.md');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [review]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Loader className="h-12 w-12 mb-4" />
          <p className="text-lg">AI is analyzing your code...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400">
          <XCircleIcon className="h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Error</p>
          <p className="text-center mt-2">{error}</p>
        </div>
      );
    }
    
    if (review && review.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-green-400">
                <CheckCircleIcon className="h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">No issues found!</p>
                <p className="text-center mt-2 text-gray-400">The AI reviewer didn't find any issues in your code. Great job!</p>
            </div>
        )
    }

    if (review && review.length > 0 && filteredReview && filteredReview.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                    <h3 className="text-xl font-semibold text-gray-300">No Matching Issues</h3>
                    <p className="mt-2 text-gray-400">Change the filter to see issues of a different severity.</p>
                </div>
            </div>
        );
    }

    if (filteredReview && filteredReview.length > 0) {
      return (
        <div className="space-y-4">
          {filteredReview.map((issue) => {
            const originalIndex = review?.findIndex(originalIssue => originalIssue === issue) ?? -1;
            return <ReviewCard key={originalIndex} issue={issue} onToggleDone={() => onToggleDone(originalIndex)} />
          })}
        </div>
      );
    }

    // Initial state before any review
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                 <h3 className="mt-4 text-xl font-semibold text-gray-300">Awaiting Your Code</h3>
                 <p className="mt-2 text-gray-400">Your code review results will appear here.</p>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg flex flex-col h-[75vh]">
      <div className="flex items-center justify-between p-3 border-b border-gray-700 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-200">Review Feedback</h2>
        <div className="flex items-center gap-2">
            {!isLoading && review && review.length > 0 && (
                <div className="flex items-center space-x-1 bg-gray-900/50 p-1 rounded-lg">
                    {filterOptions.map(option => (
                        (counts[option] > 0 || option === 'All') && <button
                            key={option}
                            onClick={() => onFilterChange(option)}
                            title={`Filter by ${option}`}
                            className={`flex items-center space-x-2 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                severityFilter === option
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-gray-700/60 hover:text-gray-200'
                            }`}
                        >
                            <span>{option}</span>
                            <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${
                                severityFilter === option ? 'bg-blue-500' : 'bg-gray-700 text-gray-300'
                            }`}>{counts[option] || 0}</span>
                        </button>
                    ))}
                </div>
            )}
            {!isLoading && review && review.length > 0 && (
                <button
                    onClick={handleDownload}
                    title="Download Report"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/60 rounded-lg transition-colors"
                    aria-label="Download review report as Markdown"
                >
                    <DownloadIcon className="h-5 w-5" />
                </button>
            )}
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};