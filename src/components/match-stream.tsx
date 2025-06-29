
import React, { useEffect, useState, useRef } from 'react';
import { Match } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Minimize, RefreshCw, Volume2, VolumeX } from 'lucide-react';

interface MatchStreamProps {
  match: Match;
  onBack: () => void;
}

export function MatchStream({ match, onBack }: MatchStreamProps) {
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
        
        // Show PWA prompt for iOS users if there's an error and not already installed
        if (isIOS && !isRunningAsPWA && !localStorage.getItem('pwa_prompt_dismissed')) {
          setShowPWAPrompt(true);
        }
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
    if (!match.stream_url) {
      return `/stream-player.html?_t=${Date.now()}`;
    }
    
    const timestamp = new Date().getTime();
    let streamUrl = match.stream_url;
    
    // Special handling for Asal drama streams
    if (streamUrl.includes('yow.riix.link/asal/musalsal/') || streamUrl.includes('asal/drama')) {
      // Make sure we're using the correct format
      streamUrl = streamUrl.replace('yow.riix.link/asal/musalsal/', 'yow.riix.link/asal/drama/');
    }
    
    // Create URL for our custom stream player with team info
    return `/stream-player.html?url=${encodeURIComponent(streamUrl)}&teamA=${encodeURIComponent(match.team_a?.name || '')}&teamB=${encodeURIComponent(match.team_b?.name || '')}&teamAFlag=${encodeURIComponent(match.team_a?.flag || '')}&teamBFlag=${encodeURIComponent(match.team_b?.flag || '')}&scoreA=${match.score_team_a || 0}&scoreB=${match.score_team_b || 0}&_t=${timestamp}`;
  };
  
  // Handle PWA prompt actions
  const handlePWALater = () => {
    setShowPWAPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed_temp', 'true');
  };
  
  const handlePWAGotIt = () => {
    setShowPWAPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
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
      
      {/* iOS PWA Install Prompt */}
      {showPWAPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-blue-600 to-green-500 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
            <button 
              className="absolute top-3 right-3 text-white bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
              onClick={handlePWALater}
            >
              ✕
            </button>
            
            <div className="text-center mb-4 text-white text-4xl">📱</div>
            <h3 className="text-xl font-bold mb-4 text-center text-white">Install StreamGoal App</h3>
            <p className="text-white/90 mb-6 text-center">
              Install our app to watch streams without interruptions!
            </p>
            
            <div className="bg-white/20 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">1</div>
                <div className="text-white">Tap the Share button</div>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">2</div>
                <div className="text-white">Scroll and tap "Add to Home Screen"</div>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">3</div>
                <div className="text-white">Tap "Add" to install</div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                className="bg-white/20 text-white hover:bg-white/30 border-none"
                onClick={handlePWALater}
              >
                Later
              </Button>
              <Button 
                className="bg-white text-blue-600 hover:bg-white/90"
                onClick={handlePWAGotIt}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}