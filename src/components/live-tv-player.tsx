
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface LiveTVPlayerProps {
  channel: {
    id: string;
    title: string;
    streamUrl: string;
    category: string;
    country: string;
    logo?: string;
  };
}

const LiveTVPlayer: React.FC<LiveTVPlayerProps> = ({ channel }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if user is on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    
    // Check if app is in standalone mode (PWA installed)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;
    setIsPWA(isInStandaloneMode);
    
    // Show PWA prompt for iOS users who haven't installed the PWA
    if (isIOSDevice && !isInStandaloneMode) {
      // Check if we've shown the prompt before
      const hasShownPwaPrompt = localStorage.getItem('hasShownPwaPrompt');
      if (!hasShownPwaPrompt) {
        setShowPwaPrompt(true);
        localStorage.setItem('hasShownPwaPrompt', 'true');
      }
    }
    
    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'videoPlaying') {
        setIsLoading(false);
        setError(null);
      } else if (event.data === 'videoError') {
        setIsLoading(false);
        setError('Stream error. Please try again.');
        
        // Show PWA prompt for iOS users when there's an error
        if (isIOSDevice && !isInStandaloneMode) {
          setShowPwaPrompt(true);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleRefresh = () => {
    if (iframeRef.current) {
      // Send message to iframe to retry
      iframeRef.current.contentWindow?.postMessage('retry', '*');
    }
  };
  
  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  };
  
  const handleClosePwaPrompt = () => {
    setShowPwaPrompt(false);
  };

  // For iOS devices that haven't installed the PWA, show a prompt
  if (isIOS && !isPWA) {
    return (
      <div className="tv-player-container">
        <div className="stream-header">
          <button className="back-button" onClick={handleBack}>
            <span>←</span> Back
          </button>
          <div className="stream-title">
            {channel.title}
            <div className="stream-subtitle">
              {channel.category} • {channel.country}
            </div>
          </div>
          <div className="stream-controls">
            <button className="control-button" onClick={handleRefresh}>
              <span>↻</span>
            </button>
            <button className="control-button" onClick={handleFullscreen}>
              <span>⤢</span>
            </button>
          </div>
        </div>
        
        <div className="pwa-install-prompt">
          <div className="pwa-icon">📱</div>
          <h2 className="pwa-title">Install StreamGoal App</h2>
          <p className="pwa-message">
            For the best streaming experience on iPhone, please install our web app to your home screen.
          </p>
          
          <div className="pwa-steps">
            <div className="pwa-step">
              <div className="step-number">1</div>
              <div className="step-text">Tap the share button at the bottom of your screen</div>
            </div>
            
            <div className="pwa-step">
              <div className="step-number">2</div>
              <div className="step-text">Scroll down and tap "Add to Home Screen"</div>
            </div>
            
            <div className="pwa-step">
              <div className="step-number">3</div>
              <div className="step-text">Tap "Add" in the top right corner</div>
            </div>
          </div>
          
          <button className="pwa-button" onClick={handleClosePwaPrompt}>
            I'll Do This Later
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tv-player-container">
      <div className="stream-header">
        <button className="back-button" onClick={handleBack}>
          <span>←</span> Back
        </button>
        <div className="stream-title">
          {channel.title}
          <div className="stream-subtitle">
            {channel.category} • {channel.country}
          </div>
        </div>
        <div className="stream-controls">
          <button className="control-button" onClick={handleRefresh}>
            <span>↻</span>
          </button>
          <button className="control-button" onClick={handleFullscreen}>
            <span>⤢</span>
          </button>
        </div>
      </div>
      
      <div className="stream-player-wrapper">
        <iframe
          ref={iframeRef}
          src={`/direct-player.html?url=${encodeURIComponent(channel.streamUrl)}`}
          allowFullScreen
          className="stream-player-iframe"
        ></iframe>
        
        {isLoading && (
          <div className="stream-loading-overlay">
            <div className="spinner"></div>
            <div className="loading-text">Loading your stream...</div>
          </div>
        )}
        
        {error && (
          <div className="stream-error-overlay">
            <div className="error-icon">⚠️</div>
            <div className="error-message">{error}</div>
            <button className="retry-button" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        )}
      </div>
      
      <div className="live-indicator">
        <span className="live-dot"></span> Live Now!
      </div>
      
      <div className="stream-info">
        <p>If stream doesn't load, try refreshing</p>
      </div>
      
      {showPwaPrompt && (
        <div className="pwa-prompt-overlay">
          <div className="pwa-prompt-content">
            <div className="pwa-icon">📱</div>
            <h2 className="pwa-title">Install StreamGoal App</h2>
            <p className="pwa-message">
              For the best streaming experience on iPhone, please install our web app to your home screen.
            </p>
            
            <div className="pwa-steps">
              <div className="pwa-step">
                <div className="step-number">1</div>
                <div className="step-text">Tap the share button at the bottom of your screen</div>
              </div>
              
              <div className="pwa-step">
                <div className="step-number">2</div>
                <div className="step-text">Scroll down and tap "Add to Home Screen"</div>
              </div>
              
              <div className="pwa-step">
                <div className="step-number">3</div>
                <div className="step-text">Tap "Add" in the top right corner</div>
              </div>
            </div>
            
            <button className="pwa-button" onClick={handleClosePwaPrompt}>
              I'll Do This Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTVPlayer;