
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/header';
import Navbar from './components/navbar';
import HomePage from './pages/home-page';
import LivePage from './pages/live-page';
import FavoritesPage from './pages/favorites-page';
import PWAInstallPrompt from './components/pwa-install-prompt';
import './App.css';

function App() {
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
    
    // Check if user is on iOS and not in PWA mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;
    
    if (isIOS && !isInStandaloneMode) {
      // Check if we've shown the prompt before
      const hasShownPwaPrompt = localStorage.getItem('hasShownPwaPrompt');
      if (!hasShownPwaPrompt) {
        // Show the prompt after a delay
        setTimeout(() => {
          setShowPwaPrompt(true);
        }, 3000);
      }
    }
  }, []);
  
  const handleClosePwaPrompt = () => {
    setShowPwaPrompt(false);
    localStorage.setItem('hasShownPwaPrompt', 'true');
  };

  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/upcoming" element={<Navigate to="/live" replace />} />
            <Route path="/finished" element={<Navigate to="/live" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Navbar />
        
        {showPwaPrompt && (
          <PWAInstallPrompt onClose={handleClosePwaPrompt} />
        )}
        
        {isFirstVisit && (
          <div className="welcome-overlay">
            <div className="welcome-content glass-card">
              <h1 className="welcome-title gradient-text">Welcome to StreamGoal!</h1>
              <p className="welcome-message">
                Your ultimate destination for live sports, TV channels, and entertainment.
              </p>
              
              <div className="welcome-features">
                <div className="feature-item">
                  <div className="feature-icon">🏆</div>
                  <div className="feature-text">
                    <h3>Live Sports</h3>
                    <p>Watch your favorite teams compete in real-time</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">📺</div>
                  <div className="feature-text">
                    <h3>TV Channels</h3>
                    <p>Stream popular TV channels from around the world</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">❤️</div>
                  <div className="feature-text">
                    <h3>Favorites</h3>
                    <p>Save your favorite content for quick access</p>
                  </div>
                </div>
              </div>
              
              <button 
                className="welcome-button"
                onClick={() => setIsFirstVisit(false)}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;