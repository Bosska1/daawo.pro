
import React, { useEffect, useState, useRef } from 'react';
import { LiveTV } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Minimize, RefreshCw, Volume2, VolumeX, PlayCircle } from 'lucide-react';

interface LiveTVPlayerProps {
  tv: LiveTV;
  onBack: () => void;
}

export function LiveTVPlayer({ tv, onBack }: LiveTVPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamSources, setStreamSources] = useState<string[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with the primary stream URL and add fallback URLs if needed
    const sources = [tv.stream_url];
    // Add fallback streams (in a real app, these would come from the database)
    if (tv.stream_url) {
      // These are example fallbacks - in a real app you'd have actual alternative sources
      const alternativeStreams = [
        tv.stream_url.replace('beIN_Sports1_HD-ar', 'beIN_Sports2_HD-ar'),
        tv.stream_url.replace('beIN_Sports1_HD-ar', 'beIN_Sports3_HD-ar')
      ];
      setStreamSources([...sources, ...alternativeStreams]);
    } else {
      setStreamSources(sources);
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Set loading timeout - shorter for TV streams as they're usually faster
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [tv.stream_url]);

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
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setStreamError(false);
    
    // Force iframe reload with a more efficient approach
    if (iframeRef.current && streamSources[currentSourceIndex]) {
      const iframe = iframeRef.current;
      iframe.src = 'about:blank';
      
      // Use a shorter timeout for faster reload
      setTimeout(() => {
        iframe.src = streamSources[currentSourceIndex];
        // Set a backup timer in case onLoad doesn't fire
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = setTimeout(() => setIsLoading(false), 1000);
      }, 50);
    }
  };

  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamSources.length;
    setCurrentSourceIndex(nextIndex);
    setIsLoading(true);
    setStreamError(false);
    
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = 'about:blank';
      
      setTimeout(() => {
        iframe.src = streamSources[nextIndex];
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = setTimeout(() => setIsLoading(false), 1000);
      }, 50);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const handleIframeError = () => {
    setStreamError(true);
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800">
        <Button variant="outline" size="sm" onClick={onBack} className="hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-lg font-semibold">
            {tv.name}
          </h2>
          <p className="text-sm text-gray-400">{tv.category} • {tv.language || tv.country || ''}</p>
        </div>
        <div className="flex gap-2">
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
        id="tv-stream-container" 
        className="relative w-full flex-1 bg-black"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-l-transparent border-r-transparent border-b-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-gray-400 mt-4">Loading channel...</p>
            </div>
          </div>
        )}
        
        {streamError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center text-center p-6 max-w-md bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Stream Error</h3>
              <p className="text-gray-400 mb-4">Unable to load the channel. The source may be unavailable.</p>
              <div className="flex gap-3">
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={switchSource} variant="default">
                  Try Another Source
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {streamSources[currentSourceIndex] ? (
          <iframe 
            ref={iframeRef}
            id="tv-stream-iframe"
            src={streamSources[currentSourceIndex]}
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms"
            loading="eager"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400">Stream not available</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-200">
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