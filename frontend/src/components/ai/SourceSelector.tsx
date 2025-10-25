'use client';

import { useState } from 'react';

interface SourceSelectorProps {
  onTextChange: (text: string) => void;
  onFileChange: (file: File | null) => void;
  textValue: string;
  selectedFile: File | null;
  disabled?: boolean;
}

export type SourceType = 'text' | 'pdf';

export default function SourceSelector({
  onTextChange,
  onFileChange,
  textValue,
  selectedFile,
  disabled = false,
}: SourceSelectorProps) {
  const [activeTab, setActiveTab] = useState<SourceType>('text');

  const handleTabChange = (tab: SourceType) => {
    setActiveTab(tab);
    // Clear the other input when switching tabs
    if (tab === 'text') {
      onFileChange(null);
    } else {
      onTextChange('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      alert('Please select a PDF file only.');
      e.target.value = '';
      return;
    }
    onFileChange(file);
  };

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          type="button"
          onClick={() => handleTabChange('text')}
          disabled={disabled}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'text'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Text Input
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('pdf')}
          disabled={disabled}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'pdf'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          PDF Upload
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'text' && (
          <div className="space-y-2">
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700">
              Enter your text to summarize
            </label>
            <textarea
              id="text-input"
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              disabled={disabled}
              placeholder="Paste your legal document, contract, or any text you want to summarize and analyze..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              {textValue.length} characters
            </p>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="space-y-4">
            <label htmlFor="pdf-input" className="block text-sm font-medium text-gray-700">
              Upload a PDF document
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="pdf-input"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only (MAX. 10MB)</p>
                </div>
                <input
                  id="pdf-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={disabled}
                  className="hidden"
                />
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                  <p className="text-xs text-blue-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  disabled={disabled}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
