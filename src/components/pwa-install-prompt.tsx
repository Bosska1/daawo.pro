
import React, { useState, useEffect } from 'react';

interface PWAInstallPromptProps {
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user is on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  return (
    <div className="pwa-prompt-overlay">
      <div className="pwa-prompt-content glass-card">
        <div className="pwa-icon">📱</div>
        <h2 className="pwa-title gradient-text">Install StreamGoal App</h2>
        <p className="pwa-message">
          For the best streaming experience, please install our web app to your home screen.
        </p>
        
        {isIOS ? (
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
        ) : (
          <div className="pwa-steps">
            <div className="pwa-step">
              <div className="step-number">1</div>
              <div className="step-text">Tap the menu button (three dots) in your browser</div>
            </div>
            
            <div className="pwa-step">
              <div className="step-number">2</div>
              <div className="step-text">Tap "Add to Home screen" or "Install App"</div>
            </div>
            
            <div className="pwa-step">
              <div className="step-number">3</div>
              <div className="step-text">Tap "Install" in the prompt that appears</div>
            </div>
          </div>
        )}
        
        <button className="pwa-button" onClick={onClose}>
          I'll Do This Later
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;