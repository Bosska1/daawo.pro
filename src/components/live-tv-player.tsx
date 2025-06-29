
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
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Check if it's iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Check if running as standalone PWA
  const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
  
  useEffect(() => {
    // If it's iOS and not running as PWA, show the PWA prompt
    if (isIOS && !isRunningAsPWA) {
      setShowPWAPrompt(true);
    }
    
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
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('message', handleMessage);
    };
  }, [isIOS, isRunningAsPWA]);

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
    let streamUrl = tv.stream_url;
    
    // Create URL for our custom stream player with channel info
    return `/stream-player.html?url=${encodeURIComponent(streamUrl)}&teamA=${encodeURIComponent(tv.name)}&_t=${timestamp}`;
  };

  // If iOS and not running as PWA, show the PWA prompt
  if (showPWAPrompt) {
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
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-6xl mb-6">📱</div>
          <h2 className="text-2xl font-bold mb-4 gradient-text">Install StreamGoal App</h2>
          <p className="text-gray-300 mb-8 max-w-md">
            To watch streams on iOS, please install our app on your device.
          </p>
          
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-4">1</div>
              <div className="text-white">Tap the Share button</div>
            </div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-4">2</div>
              <div className="text-white">Scroll and tap "Add to Home Screen"</div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-4">3</div>
              <div className="text-white">Tap "Add" to install</div>
            </div>
          </div>
          
          <Button 
            variant="glow" 
            onClick={onBack}
            className="animate-pulse-glow"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

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
        ></iframe>
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin animation-delay-500"></div>
            </div>
            <div className="mt-4 text-lg font-semibold gradient-text">Loading stream...</div>
            <div className="mt-2 text-sm text-gray-400">This may take a moment</div>
          </div>
        )}
        
        {streamError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <div className="text-xl font-semibold mb-4">Stream error</div>
            <div className="text-gray-400 mb-6 text-center max-w-md">
              Unable to load the stream. The source may be unavailable.
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-gray-700 hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="glow"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
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
          </div>
          <div className="text-sm text-gray-400">
            If stream doesn't load, try refreshing
          </div>
        </div>
      </div>
    </div>
  );
}