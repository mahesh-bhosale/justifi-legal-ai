'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PredictionUploaderProps {
  onResult: (result: any) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function PredictionUploader({ onResult }: PredictionUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = (selectedFile: File): string | null => {
    if (!selectedFile) return 'Please select a PDF file.';
    if (selectedFile.type !== 'application/pdf') {
      return 'Only PDF files are allowed.';
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      return 'PDF file size must be 10MB or less.';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    const validationError = validateFile(droppedFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setError(null);
    setFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    if (!file || isLoading) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/prediction/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      const result = response.data?.data || response.data;
      onResult(result);
      setError(null);
    } catch (err: any) {
      console.error('Prediction upload error:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to get prediction. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  return (
    <Card className="w-full shadow-md border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Upload Case Document (PDF)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <p className="text-sm font-medium text-gray-800">
            Drag &amp; drop a PDF here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported format: PDF • Max size: 10MB
          </p>
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50">
            Choose File
            <Input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {file && (
            <p className="mt-2 text-xs text-gray-600">
              Selected:{' '}
              <span className="font-medium text-gray-800">
                {file.name}
              </span>
            </p>
          )}
        </div>

        {progress !== null && (
          <div className="w-full">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>Uploading &amp; processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="min-w-[140px] flex items-center justify-center gap-2"
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>{isLoading ? 'Analyzing...' : 'Predict Outcome'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PredictionUploader;

