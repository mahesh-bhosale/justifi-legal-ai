'use client';

import { useState, useEffect } from 'react';
import { getUserRole } from '../../lib/auth';
import Button from '../../components/Button';

export default function SummarizePage() {
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [summaryLevel, setSummaryLevel] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUserRole(getUserRole());
  }, []);

  const isLoggedIn = !!userRole;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleSubmit = () => {
    // This will be implemented when AI integration is ready
    console.log('Submit functionality coming soon');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-blue-600 text-white py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Preview Mode</span>
          </div>
          <a 
            href="/demo" 
            className="text-sm underline hover:no-underline transition-all"
          >
            Try Interactive Demo →
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Legal Document Summarizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant, accurate summaries of legal documents with our AI-powered tool. 
            Choose your preferred level of detail and let our system do the work.
          </p>
        </div>

        {/* Logged in user note */}
        {isClient && isLoggedIn && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">
                Your account is ready; backend integration pending.
              </span>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('text')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'text'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Paste Text</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pdf'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Upload PDF</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === 'text' ? (
              <div>
                <label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your legal document text here
                </label>
                <textarea
                  id="text-content"
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste your legal document content here... (e.g., contracts, agreements, legal notices, etc.)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF Document
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {selectedFile ? selectedFile.name : 'Choose a PDF file'}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF up to 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf,.PDF,application/pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Level Selection */}
          <div className="mb-6">
            <label htmlFor="summary-level" className="block text-sm font-medium text-gray-700 mb-2">
              Summary Level
            </label>
            <select
              id="summary-level"
              value={summaryLevel}
              onChange={(e) => setSummaryLevel(e.target.value as 'short' | 'medium' | 'detailed')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="short">Short Summary</option>
              <option value="medium">Medium Summary</option>
              <option value="detailed">Detailed Summary</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {summaryLevel === 'short' && 'Brief overview with key points'}
              {summaryLevel === 'medium' && 'Balanced summary with main sections'}
              {summaryLevel === 'detailed' && 'Comprehensive analysis with all details'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="relative">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={true}
              onClick={handleSubmit}
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Summary
            </Button>

            {/* Tooltip */}
            {isTooltipVisible && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                AI integration coming soon
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What you&apos;ll get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Key Points</h4>
                <p className="text-sm text-gray-600">Extract main arguments and conclusions</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Fast Processing</h4>
                <p className="text-sm text-gray-600">Get results in seconds, not hours</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Legal Accuracy</h4>
                <p className="text-sm text-gray-600">AI trained on legal documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
