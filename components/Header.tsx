
import React from 'react';
import { CodeIcon } from './icons/CodeIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <CodeIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-50">
              AI Code Reviewer
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};
