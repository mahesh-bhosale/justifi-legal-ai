'use client';

import { useState } from 'react';

interface SummaryOptionsProps {
  onSummarize: (level: SummaryLevel) => void;
  disabled?: boolean;
  loading?: boolean;
}

export type SummaryLevel = 'short' | 'medium' | 'long' | 'very_long';

const summaryLevels: { value: SummaryLevel; label: string; description: string }[] = [
  {
    value: 'short',
    label: 'Short',
    description: 'Quick overview (1-2 paragraphs)',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced summary (3-4 paragraphs)',
  },
  {
    value: 'long',
    label: 'Long',
    description: 'Detailed analysis (5-6 paragraphs)',
  },
  {
    value: 'very_long',
    label: 'Very Long',
    description: 'Comprehensive breakdown (7+ paragraphs)',
  },
];

export default function SummaryOptions({
  onSummarize,
  disabled = false,
  loading = false,
}: SummaryOptionsProps) {
  const [selectedLevel, setSelectedLevel] = useState<SummaryLevel>('medium');

  const handleSummarize = () => {
    onSummarize(selectedLevel);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Length</h3>
        <div className="space-y-3">
          {summaryLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedLevel === level.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="summary-level"
                value={level.value}
                checked={selectedLevel === level.value}
                onChange={(e) => setSelectedLevel(e.target.value as SummaryLevel)}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{level.label}</span>
                  {selectedLevel === level.value && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{level.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSummarize}
          disabled={disabled || loading}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors ${
            disabled || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating Summary...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Generate Summary
            </>
          )}
        </button>
      </div>

      {/* Summary Level Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-500 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Summary Tips</h4>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• Choose &quot;Short&quot; for quick overviews and key points</li>
              <li>• Select &quot;Medium&quot; for balanced analysis with main details</li>
              <li>• Pick &quot;Long&quot; for comprehensive understanding</li>
              <li>• Use &quot;Very Long&quot; for in-depth legal analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
