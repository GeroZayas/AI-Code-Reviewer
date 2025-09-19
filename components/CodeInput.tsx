import React, { useRef } from 'react';
import { SUPPORTED_LANGUAGES, LANGUAGE_BY_EXTENSION } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';
import { Loader } from './Loader';
import { TrashIcon } from './icons/TrashIcon';
import { UploadIcon } from './icons/UploadIcon';


interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  onSubmit,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setCode('');
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);

      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && LANGUAGE_BY_EXTENSION[extension]) {
        const detectedLang = LANGUAGE_BY_EXTENSION[extension];
        if (SUPPORTED_LANGUAGES.includes(detectedLang)) {
            setLanguage(detectedLang);
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };


  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg flex flex-col h-[75vh]">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-200">Your Code</h2>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={Object.keys(LANGUAGE_BY_EXTENSION).map(ext => `.${ext}`).join(',')}
            />
            <button
                onClick={handleFileSelect}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Upload file"
                title="Upload file"
            >
                <UploadIcon className="h-5 w-5" />
            </button>
            <button
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Clear code"
                title="Clear code"
            >
                <TrashIcon className="h-5 w-5" />
            </button>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Select programming language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow p-1">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`Paste your ${language} code here, or upload a file...`}
          className="w-full h-full p-3 bg-transparent text-gray-200 font-fira-code resize-none focus:outline-none placeholder-gray-500"
          spellCheck="false"
        />
      </div>
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onSubmit}
          disabled={isLoading || !code.trim()}
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Review Code
            </>
          )}
        </button>
      </div>
    </div>
  );
};
