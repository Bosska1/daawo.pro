
import React, { useEffect, useState, useRef } from 'react';
import { LiveTV } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Minimize, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface LiveTVPlayerProps {
  tv: LiveTV;
  onBack: () => void;
}

export function LiveTVPlayer({ tv, onBack }: LiveTVPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'videoPlaying') {
        setIsLoading(false);
        setStreamError(false);
      } else if (event.data === 'videoError') {
        setStreamError(true);
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Preload the stream player
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = '/stream-player.html';
    preloadLink.as = 'document';
    document.head.appendChild(preloadLink);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('message', handleMessage);
      if (preloadLink.parentNode) {
        document.head.removeChild(preloadLink);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Send message to iframe to toggle mute
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage('toggleMute', '*');
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      // Add timestamp to force reload
      const timestamp = new Date().getTime();
      const currentSrc = iframeRef.current.src;
      const newSrc = currentSrc.includes('?') 
        ? `${currentSrc}&_t=${timestamp}` 
        : `${currentSrc}?_t=${timestamp}`;
      
      iframeRef.current.src = newSrc;
      setIsLoading(true);
      setStreamError(false);
    }
  };

  // Create stream URL with timestamp to prevent caching
  const getStreamUrl = () => {
    if (!tv.stream_url) {
      return `/stream-player.html?_t=${Date.now()}`;
    }
    
    const timestamp = new Date().getTime();
    const streamUrl = tv.stream_url;
    
    // Create URL for our custom stream player
    return `/stream-player.html?url=${encodeURIComponent(streamUrl)}&_t=${timestamp}`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800 relative">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
        <Button variant="outline" size="sm" onClick={onBack} className="hover:bg-gray-700 z-10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center flex-1 z-10">
          <h2 className="text-lg font-semibold gradient-text">
            {tv.name}
          </h2>
          <p className="text-sm text-gray-400">{tv.category} • {tv.language || tv.country || ''}</p>
        </div>
        <div className="flex gap-2 z-10">
          <Button variant="outline" size="sm" onClick={toggleMute} className="hover:bg-gray-700">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="hover:bg-gray-700">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="hover:bg-gray-700">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full flex-1 bg-black flex items-center justify-center overflow-hidden"
      >
        <iframe
          ref={iframeRef}
          src={getStreamUrl()}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="eager"
          sandbox="allow-same-origin allow-scripts allow-forms"
          style={{ aspectRatio: '16/9', maxHeight: '100%', maxWidth: '100%' }}
        ></iframe>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-800 relative">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900/60 text-red-200 animate-pulse-glow shadow-lg">
              <span className="w-2 h-2 mr-2 bg-red-500 rounded-full animate-pulse"></span>
              Live Now!
            </span>
          </div>
          <div className="text-sm text-gray-400">
            If stream doesn't load, try refreshing
          </div>
        </div>
      </div>
    </div>
  );
}