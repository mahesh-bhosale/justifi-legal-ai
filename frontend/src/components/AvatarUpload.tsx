'use client';

import { useState, useRef } from 'react';
import { lawyerProfileApi } from '@/lib/lawyer-profiles';
import Button from './Button';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onSuccess?: (newUrl: string) => void;
  userName?: string;
  size?: number;
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  onSuccess, 
  userName = 'Member', 
  size = 80 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (PNG, JPG, WebP)');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await lawyerProfileApi.uploadAvatar(formData);
      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data.avatarUrl);
        }
      } else {
        setError(response.message || 'Failed to upload avatar');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarSrc = previewUrl || currentAvatarUrl;

  // Force image refresh by adding timestamp to current avatar URL
  const getAvatarWithCacheBusting = (url: string | null | undefined) => {
    if (!url) return null;
    // If URL already has cache-busting parameter, return as is
    if (url.includes('?t=')) return url;
    // Add timestamp for cache busting
    return `${url}?t=${Date.now()}`;
  };

  const displayAvatarSrc = previewUrl || getAvatarWithCacheBusting(currentAvatarUrl);

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative group cursor-pointer overflow-hidden rounded-full border-4 border-amber-500/20 hover:border-amber-500 transition-all shadow-lg"
        style={{ width: size, height: size }}
        onClick={triggerFileInput}
      >
        {displayAvatarSrc ? (
          <img 
            src={displayAvatarSrc} 
            alt="Profile Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-400 font-bold text-2xl">
            {getInitials(userName)}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <svg className="animate-spin h-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500 font-bold uppercase tracking-tight text-center max-w-[150px]">
          {error}
        </p>
      )}

      {!uploading && !error && (
        <button 
          onClick={triggerFileInput}
          className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest hover:underline"
        >
          {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
        </button>
      )}
    </div>
  );
}
