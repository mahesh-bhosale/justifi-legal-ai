'use client';

import { useState } from 'react';
import SourceSelector, { type SourceType } from '@/components/ai/SourceSelector';
import SummaryOptions, { type SummaryLevel } from '@/components/ai/SummaryOptions';
import SummaryResult from '@/components/ai/SummaryResult';
import ChatBox from '@/components/ai/ChatBox';
import {
  summarizeText,
  summarizePDF,
  askAboutText,
  askAboutPDF,
  type SummaryResponse,
} from '@/lib/ai';

interface SummarizeState {
  textInput: string;
  selectedFile: File | null;
  sourceType: SourceType;
  summary: SummaryResponse | null;
  isLoading: boolean;
  error: string | null;
  isChatLoading: boolean;
  chatError: string | null;
}

export default function SummarizePage() {
  const [state, setState] = useState<SummarizeState>({
    textInput: '',
    selectedFile: null,
    sourceType: 'text',
    summary: null,
    isLoading: false,
    error: null,
    isChatLoading: false,
    chatError: null,
  });

  const [showChat, setShowChat] = useState(true); // Show chat by default

  const handleTextChange = (text: string) => {
    setState(prev => ({ ...prev, textInput: text, sourceType: 'text' }));
  };

  const handleFileChange = (file: File | null) => {
    setState(prev => ({ ...prev, selectedFile: file, sourceType: 'pdf' }));
  };

  const handleSummarize = async (level: SummaryLevel) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let summaryResponse: SummaryResponse;

      if (state.sourceType === 'text' && state.textInput.trim()) {
        summaryResponse = await summarizeText({
          text: state.textInput,
          level,
        });
      } else if (state.sourceType === 'pdf' && state.selectedFile) {
        summaryResponse = await summarizePDF(state.selectedFile, level);
      } else {
        throw new Error('Please provide text input or upload a PDF file.');
      }

      // Store the summary and enable chat
      setState(prev => ({
        ...prev,
        summary: summaryResponse,
        isLoading: false,
        error: null
      }));
      
      // Show the chat interface after successful summarization
      setShowChat(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  const handleChatMessage = async (message: string, context?: string | File): Promise<string> => {
    try {
      // If we have a summary context, use that for the question
      if (state.summary?.summary) {
        const response = await askAboutText({
          question: message,
          context: state.summary.summary,
        });
        return response.answer;
      } else if (context instanceof File) {
        // If it's a PDF file, use the PDF-specific endpoint
        const response = await askAboutPDF(context, message);
        return response.answer;
      } else if (context) {
        // If it's a string context, use the text endpoint
        const response = await askAboutText({
          question: message,
          context: context,
        });
        return response.answer;
      }
      
      // For text input without context, use the text input as context
      const response = await askAboutText({ 
        question: message, 
        context: state.textInput 
      });
      return response.answer;
    } catch (error) {
      console.error('Error in handleChatMessage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your question';
      setState(prev => ({ ...prev, chatError: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isChatLoading: false }));
    }
  };

  const handleStartChat = () => {
    setShowChat(true);
  };

  const canSummarize = () => {
    return (state.textInput.trim() || state.selectedFile) && !state.isLoading;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Summarizer & Assistant</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload a document or paste text to get AI-powered summaries and ask questions.
          </p>
        </div>

        <div className="space-y-8">
          {/* Source Input Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Input</h2>
            <SourceSelector
              onTextChange={handleTextChange}
              onFileChange={handleFileChange}
              textValue={state.textInput}
              selectedFile={state.selectedFile}
              disabled={state.isLoading}
            />
          </div>

          {/* Summary Options Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary Settings</h2>
            <SummaryOptions
              onSummarize={handleSummarize}
              disabled={!canSummarize()}
              loading={state.isLoading}
            />
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{state.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Result Section */}
          {state.summary && (
            <div>
              <SummaryResult
                summary={state.summary.summary}
                level={state.summary.level}
                onStartChat={handleStartChat}
              />
            </div>
          )}

          {/* Rate Limit Info */}
          {state.summary?.rateLimit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-400 mr-3"
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
                  <h3 className="text-sm font-medium text-blue-800">Usage Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {state.summary.rateLimit.remaining} of {state.summary.rateLimit.limit} requests remaining today
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Section - Always visible */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ask Questions</h2>
              {!showChat && (
                <button
                  onClick={() => setShowChat(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Show Chat
                </button>
              )}
            </div>
            
            {showChat && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <ChatBox
                  onSendMessage={handleChatMessage}
                  documentContext={state.sourceType === 'pdf' && state.selectedFile ? state.selectedFile : state.textInput}
                  disabled={state.isChatLoading || state.isLoading}
                  placeholder={
                    state.isLoading 
                      ? 'Please wait while we process your document...' 
                      : `Ask questions about your ${state.sourceType === 'pdf' ? 'PDF document' : 'text'}...`
                  }
                  isPdfMode={state.sourceType === 'pdf'}
                  onError={(error) => {
                    console.error('Chat error:', error);
                    setState(prev => ({ ...prev, error: error.message }));
                  }}
                />
                {state.chatError && (
                  <div className="mt-2 text-sm text-red-600">
                    {state.chatError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How to Use</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📝 Text Input</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Paste any legal document or text</li>
                  <li>• Choose your preferred summary length</li>
                  <li>• Get instant AI-powered summaries</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📄 PDF Upload</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Upload PDF documents (max 10MB)</li>
                  <li>• AI extracts and summarizes content</li>
                  <li>• Ask specific questions about the document</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">💬 AI Chat</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ask follow-up questions after summarizing</li>
                  <li>• Get detailed explanations</li>
                  <li>• Clarify specific terms or concepts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📋 Export Options</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Copy summaries to clipboard</li>
                  <li>• Download as text files</li>
                  <li>• Share with colleagues or clients</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}