'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
          setHasError(true);
        });
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set a timeout to stop showing loading after 10 seconds
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      console.warn('Video loading timeout - showing video anyway');
    }, 10000);

    const handlePlay = () => {
      setIsPlaying(true);
      setShowOverlay(false);
      setIsLoading(false);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      setShowOverlay(true);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setShowOverlay(true);
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    };

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    };

    const handleCanPlayThrough = () => {
      console.log('Video can play through');
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    };

    const handleError = (e: Event) => {
      const error = video.error;
      console.error('Video error:', {
        code: error?.code,
        message: error?.message,
        event: e
      });
      setHasError(true);
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
      setIsLoading(true);
      setHasError(false);
    };

    const handleLoadedData = () => {
      console.log('Video data loaded');
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    // Check if video is already loaded
    if (video.readyState >= 2) {
      console.log('Video already loaded, readyState:', video.readyState);
      setIsLoading(false);
      clearTimeout(loadingTimeout);
    }

    // Force load the video
    video.load();

    return () => {
      clearTimeout(loadingTimeout);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  return (
    <div className={`relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-black ${className}`}>
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <video 
          ref={videoRef}
          className="w-full h-full object-contain rounded-lg" 
          controls 
          poster="/video/poster.png"
          preload="auto"
          playsInline
        >
          <source src="/video/demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Loading indicator - only shows as overlay, doesn't block video */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <div className="text-white text-sm">Loading video...</div>
            </div>
          </div>
        )}

        {/* Error message */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-20">
            <div className="text-center p-4">
              <div className="text-red-400 text-sm mb-2">Failed to load video</div>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Play button overlay - only when paused and not loading */}
        {showOverlay && !isPlaying && !isLoading && !hasError && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-opacity-40 hover:bg-opacity-30 transition-all duration-300 cursor-pointer z-10"
            onClick={handleOverlayClick}
            aria-label="Play video"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600 bg-opacity-95 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform shadow-2xl">
              <svg 
                className="w-10 h-10 md:w-12 md:h-12 text-white ml-1 md:ml-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
