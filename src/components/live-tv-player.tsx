
import React, { useEffect, useState } from 'react';
import { LiveTV } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Minimize, RefreshCw } from 'lucide-react';

interface LiveTVPlayerProps {
  tv: LiveTV;
  onBack: () => void;
}

export function LiveTVPlayer({ tv, onBack }: LiveTVPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Set loading timeout - shorter for TV streams as they're usually faster
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(loadingTimer);
    };
  }, []);

  const toggleFullscreen = () => {
    const streamContainer = document.getElementById('tv-stream-container');
    
    if (!document.fullscreenElement && streamContainer) {
      streamContainer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setStreamError(false);
    
    // Force iframe reload
    const iframe = document.getElementById('tv-stream-iframe') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
        setTimeout(() => setIsLoading(false), 1500);
      }, 100);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setStreamError(true);
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <Button variant="outline" size="sm" onClick={onBack}>
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
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div id="tv-stream-container" className="relative w-full flex-1 bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading channel...</p>
            </div>
          </div>
        )}
        
        {streamError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center text-center p-6">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Stream Error</h3>
              <p className="text-gray-400 mb-4">Unable to load the channel. The source may be unavailable.</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </div>
        )}
        
        {tv.stream_url ? (
          <iframe 
            id="tv-stream-iframe"
            src={tv.stream_url}
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
      
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-200">
              <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
              Live Now!
            </span>
          </div>
          <div className="text-sm text-gray-400">
            If stream doesn't load, click the refresh button
          </div>
        </div>
      </div>
    </div>
  );
}