
import React, { useEffect, useState, useRef } from 'react';
import { Match } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Minimize, RefreshCw, Volume2, VolumeX, Loader2, PlayCircle, RotateCw } from 'lucide-react';

interface MatchStreamProps {
  match: Match;
  onBack: () => void;
}

export function MatchStream({ match, onBack }: MatchStreamProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamSources, setStreamSources] = useState<string[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with the primary stream URL and add fallback URLs if needed
    const sources = [match.stream_url || ''];
    // Add fallback streams (in a real app, these would come from the database)
    if (match.stream_url) {
      // These are example fallbacks - in a real app you'd have actual alternative sources
      const alternativeStreams = [
        match.stream_url.replace('beIN_Sports2_HD-ar', 'beIN_Sports1_HD-ar'),
        match.stream_url.replace('beIN_Sports2_HD-ar', 'beIN_Sports3_HD-ar')
      ];
      setStreamSources([...sources, ...alternativeStreams]);
    } else {
      setStreamSources(sources);
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Set loading timeout - shorter for faster loading perception
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    // Simulate loading progress
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + (100 - prev) * 0.1;
        return Math.min(next, 99);
      });
    }, 100);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [match.stream_url]);

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
      try {
        // Try to access iframe content to mute/unmute
        const iframeWindow = iframeRef.current.contentWindow;
        if (iframeWindow) {
          iframeWindow.postMessage({ action: isMuted ? 'unmute' : 'mute' }, '*');
        }
      } catch (e) {
        console.log('Could not control iframe audio');
      }
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setStreamError(false);
    setLoadingProgress(0);
    
    // Start progress animation again
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + (100 - prev) * 0.1;
        return Math.min(next, 99);
      });
    }, 100);
    
    // Force iframe reload with a more efficient approach
    if (iframeRef.current && streamSources[currentSourceIndex]) {
      const iframe = iframeRef.current;
      const currentSrc = streamSources[currentSourceIndex];
      
      // Add a timestamp parameter to force reload and bypass cache
      const timestamp = new Date().getTime();
      const separator = currentSrc.includes('?') ? '&' : '?';
      const refreshedSrc = `${currentSrc}${separator}_t=${timestamp}`;
      
      iframe.src = 'about:blank';
      
      // Use a shorter timeout for faster reload
      setTimeout(() => {
        iframe.src = refreshedSrc;
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
        }, 1200);
      }, 50);
    }
  };

  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamSources.length;
    setCurrentSourceIndex(nextIndex);
    setIsLoading(true);
    setStreamError(false);
    setLoadingProgress(0);
    
    // Start progress animation again
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + (100 - prev) * 0.1;
        return Math.min(next, 99);
      });
    }, 100);
    
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = 'about:blank';
      
      setTimeout(() => {
        iframe.src = streamSources[nextIndex];
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(100);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }, 1200);
      }, 50);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadingProgress(100);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleIframeError = () => {
    setStreamError(true);
    setIsLoading(false);
    setLoadingProgress(100);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  // Create a direct video player for HLS streams
  const createDirectPlayer = () => {
    const currentSource = streamSources[currentSourceIndex];
    
    // For HLS streams, we'll use a direct video element instead of an iframe
    if (currentSource && currentSource.includes('.m3u8')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <video 
            ref={(video) => {
              if (video) {
                video.src = currentSource;
                video.autoplay = true;
                video.controls = true;
                video.muted = isMuted;
                video.playsInline = true;
                video.onloadeddata = handleIframeLoad;
                video.onerror = handleIframeError;
              }
            }}
            className="w-full h-full max-h-full"
            autoPlay
            controls
            playsInline
            muted={isMuted}
            onLoadedData={handleIframeLoad}
            onError={handleIframeError}
          >
            <source src={currentSource} type="application/x-mpegURL" />
            Your browser does not support HTML5 video.
          </video>
        </div>
      );
    }
    
    // For other streams, use the iframe approach
    return (
      <iframe 
        ref={iframeRef}
        id="stream-iframe"
        src={currentSource}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-same-origin allow-scripts allow-forms"
        loading="eager"
        allow="autoplay; fullscreen"
      ></iframe>
    );
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
          <h2 className="text-lg font-semibold">
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
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <svg className="absolute inset-0" width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    className="text-gray-800"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r="35"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 35}
                    strokeDashoffset={2 * Math.PI * 35 * (1 - loadingProgress / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="35"
                    cx="40"
                    cy="40"
                  />
                </svg>
              </div>
              <p className="text-gray-400 mt-4">Loading stream... {Math.round(loadingProgress)}%</p>
            </div>
          </div>
        )}
        
        {streamError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center text-center p-6 max-w-md glass rounded-lg animate-float">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Stream Error</h3>
              <p className="text-gray-400 mb-4">Unable to load the stream. The source may be unavailable.</p>
              <div className="flex gap-3">
                <Button onClick={handleRefresh} variant="outline" className="glass">
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
        
        {streamSources[currentSourceIndex] ? (
          createDirectPlayer()
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400">Stream not available</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-800 relative">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-200 animate-pulse-glow">
              <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
              Live Now!
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={switchSource}
              className="text-xs text-primary hover:text-primary/80"
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