
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  
  // Define multiple stream sources for better reliability
  const streamSources = [
    match.stream_url || '',
    // Alternative sources with different parameters
    match.stream_url?.replace('beIN_Sports2_HD-ar', 'beIN_Sports1_HD-ar') || '',
    match.stream_url?.replace('beIN_Sports2_HD-ar', 'beIN_Sports3_HD-ar') || '',
    // Add direct embed fallback
    `https://player.castr.com/live_${match.team_a?.name?.toLowerCase().replace(/\s+/g, '_')}_${match.team_b?.name?.toLowerCase().replace(/\s+/g, '_')}`
  ].filter(Boolean);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Start loading animation
    startLoadingAnimation();
    
    // Set a timeout to consider the stream loaded after a certain time
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(100);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }, 8000); // Longer timeout for better reliability
    
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'videoPlaying') {
        setIsLoading(false);
        setStreamError(false);
        setLoadingProgress(100);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else if (event.data === 'videoError') {
        setStreamError(true);
        setIsLoading(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('message', handleMessage);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [match.stream_url, currentSourceIndex]);

  const startLoadingAnimation = () => {
    setLoadingProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + (100 - prev) * 0.1; // Slower progress for more reliability
        return Math.min(next, 99);
      });
    }, 200);
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
    if (iframeRef.current) {
      // Try to send mute message to iframe
      try {
        iframeRef.current.contentWindow?.postMessage('toggleMute', '*');
      } catch (e) {
        console.log('Could not send mute message to iframe');
      }
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setStreamError(false);
    startLoadingAnimation();
    
    // Force iframe reload with timestamp to bypass cache
    if (iframeRef.current) {
      const timestamp = new Date().getTime();
      const currentSrc = streamSources[currentSourceIndex];
      const separator = currentSrc.includes('?') ? '&' : '?';
      const refreshedSrc = `${currentSrc}${separator}_t=${timestamp}`;
      
      // For our custom player, we need to reload the entire iframe
      const playerUrl = `/stream-player.html?url=${encodeURIComponent(refreshedSrc)}&muted=${isMuted}`;
      iframeRef.current.src = playerUrl;
      
      // Set a backup timer in case onLoad doesn't fire
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(100);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }, 8000);
    }
  };

  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamSources.length;
    setCurrentSourceIndex(nextIndex);
    setIsLoading(true);
    setStreamError(false);
    startLoadingAnimation();
  };

  const handleIframeLoad = () => {
    // We'll rely on the message event for more accurate loading state
    console.log("Iframe loaded");
  };

  const handleIframeError = () => {
    setStreamError(true);
    setIsLoading(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  // Get current stream URL
  const currentStreamUrl = streamSources[currentSourceIndex];
  
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
        id="stream-container" 
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
                <svg className="absolute inset-0" width="96" height="96" viewBox="0 0 96 96">
                  <circle
                    className="text-gray-800"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r="43"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 43}
                    strokeDashoffset={2 * Math.PI * 43 * (1 - loadingProgress / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="43"
                    cx="48"
                    cy="48"
                  />
                </svg>
              </div>
              <p className="text-gray-300 mt-4 text-lg">Loading stream...</p>
              <p className="text-gray-400 mt-1">{Math.round(loadingProgress)}%</p>
            </div>
          </div>
        )}
        
        {streamError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center text-center p-8 max-w-md glass rounded-xl animate-float shadow-lg border border-gray-800">
              <div className="text-red-500 text-6xl mb-6">⚠️</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">Stream Error</h3>
              <p className="text-gray-300 mb-6">Unable to load the stream. The source may be unavailable or your connection might be unstable.</p>
              <div className="flex gap-4">
                <Button onClick={handleRefresh} variant="outline" className="glass hover:bg-gray-800">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={switchSource} variant="glow" className="animate-pulse-glow">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Try Another Source
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {currentStreamUrl && (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <iframe
              ref={iframeRef}
              src={`/stream-player.html?url=${encodeURIComponent(currentStreamUrl)}&muted=${isMuted}`}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-forms"
            ></iframe>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-800 relative">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900/60 text-red-200 animate-pulse-glow shadow-lg">
              <span className="w-2 h-2 mr-2 bg-red-500 rounded-full animate-pulse"></span>
              Live Now!
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={switchSource}
              className="text-sm text-primary hover:text-primary/80 hover:bg-gray-800"
            >
              Switch Source ({currentSourceIndex + 1}/{streamSources.length})
            </Button>
          </div>
          <div className="text-sm text-gray-400">
            If stream doesn't load, try another source
          </div>
        </div>
      </div>
    </div>
  );
}