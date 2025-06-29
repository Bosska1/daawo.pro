
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Check if it's iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Check if running as standalone PWA
  const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
  
  useEffect(() => {
    // Only show for iOS devices that aren't already using the PWA
    if (isIOS && !isRunningAsPWA) {
      // Check if we've shown the prompt before
      const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
      const lastPromptTime = localStorage.getItem('pwa_prompt_time');
      
      // If never shown before or it's been more than 3 days since last shown
      if (!hasSeenPrompt || (lastPromptTime && Date.now() - parseInt(lastPromptTime) > 3 * 24 * 60 * 60 * 1000)) {
        // Show the prompt after a short delay
        const timer = setTimeout(() => {
          setShowPrompt(true);
          // Update the last shown time
          localStorage.setItem('pwa_prompt_time', Date.now().toString());
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isIOS, isRunningAsPWA]);
  
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_seen', 'true');
  };
  
  if (!showPrompt) return null;
  
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-blue-600 to-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom duration-300 max-w-md mx-auto">
      <button 
        className="absolute top-2 right-2 text-white/80 hover:text-white"
        onClick={handleDismiss}
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex items-start">
        <div className="text-3xl mr-3">📱</div>
        <div>
          <h3 className="font-bold text-lg mb-1">Install StreamGoal App</h3>
          <p className="text-sm text-white/90 mb-3">
            Install our app for the best streaming experience!
          </p>
          <Button 
            onClick={handleDismiss}
            className="bg-white text-blue-600 hover:bg-white/90 w-full"
          >
            Learn How
          </Button>
        </div>
      </div>
    </div>
  );
}