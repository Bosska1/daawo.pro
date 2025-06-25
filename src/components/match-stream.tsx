
import React, { useEffect, useState, useRef } from 'react';
import { Match } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Minimize, RefreshCw, Volume2, VolumeX, PlayCircle, RotateCw } from 'lucide-react';

interface MatchStreamProps {
  match: Match;
  onBack: () => void;
}

export function MatchStream({ match, onBack }: MatchStreamProps) {
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
    
    // Start loading the stream
    loadStream();
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const loadStream = () => {
    setIsLoading(true);
    setStreamError(false);
    
    // Set a timeout to show error if stream doesn't load
    const timeout = setTimeout(() => {
      setStreamError(true);
      setIsLoading(false);
    }, 15000);
    
    // Listen for messages from the iframe
    window.addEventListener('message', function handleMessage(event) {
      if (event.data === 'videoPlaying') {
        clearTimeout(timeout);
        setIsLoading(false);
        setStreamError(false);
        // Remove the event listener once we've received the message
        window.removeEventListener('message', handleMessage);
      } else if (event.data === 'videoError') {
        clearTimeout(timeout);
        setStreamError(true);
        setIsLoading(false);
        // Remove the event listener once we've received the message
        window.removeEventListener('message', handleMessage);
      }
    });
  };

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
      
      // Set a timeout to show error if stream doesn't load after refresh
      setTimeout(() => {
        setStreamError(true);
        setIsLoading(false);
      }, 15000);
    }
  };

  // Create stream URL with timestamp to prevent caching
  const getStreamUrl = () => {
    if (!match.stream_url) return '';
    
    const timestamp = new Date().getTime();
    const streamUrl = match.stream_url;
    
    // Create URL for our custom stream player
    return `/stream-player.html?url=${encodeURIComponent(streamUrl)}&muted=${isMuted}&_t=${timestamp}`;
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
            {match.team_a?.name} {match.team_a?.flag} vs {match.team_b?.flag} {match.team_b?.name}
          </h2>
          <p className="text-sm text-gray-400">🏆 {match.competition?.name}</p>
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
        className="relative w-full flex-1 bg-black"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-gray-300 mt-4 text-lg">Loading stream...</p>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={getStreamUrl()}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
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