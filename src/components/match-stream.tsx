import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  onRefresh: () => void;
  onFullscreen: () => void;
  onSourceChange: (index: number) => void;
  currentSource: number;
  sourceCount: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onRefresh,
  onFullscreen,
  onSourceChange,
  currentSource,
  sourceCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="floating-action-button-container">
      {isOpen && (
        <div className="fab-menu">
          <button 
            className="fab-menu-item" 
            onClick={() => {
              onRefresh();
              setIsOpen(false);
            }}
            title="Refresh"
          >
            <span>↻</span>
          </button>
          <button 
            className="fab-menu-item" 
            onClick={() => {
              onFullscreen();
              setIsOpen(false);
            }}
            title="Fullscreen"
          >
            <span>⤢</span>
          </button>
          {Array.from({ length: sourceCount }).map((_, index) => (
            <button
              key={index}
              className={`fab-menu-item ${currentSource === index ? 'active' : ''}`}
              onClick={() => {
                onSourceChange(index);
                setIsOpen(false);
              }}
              title={`Source ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
      <button className="fab-main" onClick={toggleMenu}>
        {isOpen ? '✕' : '⚙️'}
      </button>
    </div>
  );
};

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
  onBack?: () => void;
}

export const MatchStream: React.FC<MatchStreamProps> = ({ match, onBack }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [currentSource, setCurrentSource] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const sources = [
    match.streamUrl,
    match.streamUrl.replace('asal/musalsal', 'asal/musalsal/index.m3u8'),
    match.streamUrl + '?source=2',
    'https://cors-anywhere.herokuapp.com/' + match.streamUrl
  ];

  const suggestions = [
    { id: '1', title: 'Sports Channel', category: 'Sports', isLive: true },
    { id: '2', title: 'News Network', category: 'News', isLive: true },
    { id: '3', title: 'Movie Channel', category: 'Movies', isLive: true },
    { id: '4', title: 'Entertainment TV', category: 'Entertainment', isLive: true }
  ];

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;
    setIsPWA(isInStandaloneMode);
    
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
        
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          const nextSource = (currentSource + 1) % sources.length;
          setCurrentSource(nextSource);
          handleSourceChange(nextSource);
        } else {
          setError('Stream error. Please try another source.');
          if (isIOSDevice && !isInStandaloneMode) {
            setShowPwaPrompt(true);
          }
        }
      } else if (event.data?.type === 'sourceChange') {
        setCurrentSource(event.data.index);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentSource, retryCount, sources.length]);
  
  const handleBack = () => {
    onBack ? onBack() : navigate(-1);
  };
  
  const handleRefresh = () => {
    iframeRef.current?.contentWindow?.postMessage('retry', '*');
  };
  
  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen().catch(console.error);
  };
  
  const handleClosePwaPrompt = () => setShowPwaPrompt(false);

  const handleSourceChange = (index: number) => {
    setCurrentSource(index);
    setRetryCount(0);
    iframeRef.current?.contentWindow?.postMessage({ type: 'sourceChange', index }, '*');
  };

  const handleSuggestionClick = () => setShowSuggestions(false);

  if (isIOS && !isPWA) {
    return (
      <div className="match-stream-container">
        {/* ... (keep existing iOS PWA prompt JSX) */}
      </div>
    );
  }

  return (
    <div className="match-stream-container">
      {/* ... (keep all existing JSX structure) */}
    </div>
  );
};

// Named export only - no default export
export { MatchStream };
