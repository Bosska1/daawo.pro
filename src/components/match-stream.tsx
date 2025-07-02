import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchStreamProps {
  match: {
    id: string;
    title: string;
    streamUrl: string;
    category: string;
    country: string;
    isLive: boolean;
    teamA?: string;
    teamB?: string;
    teamAFlag?: string;
    teamBFlag?: string;
    scoreA?: string;
    scoreB?: string;
  };
}

interface Suggestion {
  id: string;
  title: string;
  category: string;
  isLive: boolean;
}

const MatchStream: React.FC<MatchStreamProps> = ({ match }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [currentSource, setCurrentSource] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Alternative sources
  const sources = [
    match.streamUrl,
    `${match.streamUrl}?source=2`,
    `${match.streamUrl}?source=3`,
    `${match.streamUrl}?source=4`
  ];

  // Suggested content
  const suggestions: Suggestion[] = [
    { id: '1', title: 'Sports Channel', category: 'Sports', isLive: true },
    { id: '2', title: 'News Network', category: 'News', isLive: true },
    { id: '3', title: 'Movie Channel', category: 'Movies', isLive: true },
    { id: '4', title: 'Entertainment TV', category: 'Entertainment', isLive: true }
  ];

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
      const hasShownPwaPrompt = localStorage.getItem('hasShownPwaPrompt');
      if (!hasShownPwaPrompt) {
        setShowPwaPrompt(true);
        localStorage.setItem('hasShownPwaPrompt', 'true');
      }
    }
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'videoPlaying') {
        setIsLoading(false);
        setError(null);
        
        setTimeout(() => {
          setShowSuggestions(true);
          setTimeout(() => setShowSuggestions(false), 10000);
        }, 30000);
      } else if (event.data === 'videoError') {
        setIsLoading(false);
        setError('Stream error. Please try again.');
        if (isIOSDevice && !isInStandaloneMode) setShowPwaPrompt(true);
      } else if (event.data?.type === 'sourceChange') {
        setCurrentSource(event.data.index);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  const handleBack = () => navigate(-1);
  
  const handleRefresh = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage('retry', '*');
    }
  };
  
  const handleFullscreen = async () => {
    try {
      await iframeRef.current?.requestFullscreen();
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err);
    }
  };
  
  const handleClosePwaPrompt = () => setShowPwaPrompt(false);

  const handleSourceChange = (index: number) => {
    setCurrentSource(index);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'sourceChange', index }, '*');
    }
  };

  const handleSuggestionClick = (id: string) => {
    setShowSuggestions(false);
  };

  if (isIOS && !isPWA) {
    return (
      <div className="match-stream-container">
        {/* iOS PWA prompt content remains the same */}
        {/* ... */}
      </div>
    );
  }

  return (
    <div className="match-stream-container">
      {/* Header and controls */}
      <div className="stream-header">
        <button className="back-button" onClick={handleBack}>
          <span>←</span> Back
        </button>
        <div className="stream-title">
          {match.title}
          <div className="stream-subtitle">
            {match.category} • {match.country}
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
      
      {/* Stream player */}
      <div className="stream-player-wrapper">
        <iframe
          ref={iframeRef}
          src={`/direct-player.html?url=${encodeURIComponent(sources[currentSource])}&teamA=${encodeURIComponent(match.teamA || '')}&teamB=${encodeURIComponent(match.teamB || '')}&teamAFlag=${encodeURIComponent(match.teamAFlag || '')}&teamBFlag=${encodeURIComponent(match.teamBFlag || '')}&scoreA=${encodeURIComponent(match.scoreA || '0')}&scoreB=${encodeURIComponent(match.scoreB || '0')}`}
          allowFullScreen
          className="stream-player-iframe"
          title={`Stream of ${match.title}`}
        />
        
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

        {/* Source selector */}
        <div className="source-selector">
          {sources.map((_, index) => (
            <button
              key={`source-${index}`}
              className={`source-button ${currentSource === index ? 'active' : ''}`}
              onClick={() => handleSourceChange(index)}
            >
              Source {index + 1}
            </button>
          ))}
        </div>

        {/* Suggestions overlay */}
        {showSuggestions && (
          <div className="suggestions-overlay">
            <h3 className="suggestions-title">You might also like:</h3>
            <div className="suggestions-container">
              {suggestions.map(suggestion => (
                <div
                  key={`suggestion-${suggestion.id}`}
                  className="suggestion-item glass-card"
                  onClick={() => handleSuggestionClick(suggestion.id)}
                >
                  <h4 className="suggestion-title">{suggestion.title}</h4>
                  <p className="suggestion-category">
                    {suggestion.category} • {suggestion.isLive ? 'Live' : 'On Demand'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Live indicator and info */}
      {match.isLive && (
        <div className="live-indicator">
          <span className="live-dot"></span> Live Now!
        </div>
      )}
      
      <div className="stream-info">
        <p>If stream doesn't load, try another source or refresh</p>
      </div>
      
      {/* PWA prompt */}
      {showPwaPrompt && (
        <div className="pwa-prompt-overlay">
          {/* PWA prompt content remains the same */}
          {/* ... */}
        </div>
      )}
    </div>
  );
};

export default MatchStream;
