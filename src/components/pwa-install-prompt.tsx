
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Share2, Plus, Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  
  // Check if it's iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Check if it's Android
  const isAndroid = /Android/.test(navigator.userAgent);
  
  // Check if running as standalone PWA
  const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
  
  useEffect(() => {
    // Only show for mobile devices that aren't already using the PWA
    if ((isIOS || isAndroid) && !isRunningAsPWA) {
      // Check if we've shown the prompt before
      const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
      const lastPromptTime = localStorage.getItem('pwa_prompt_time');
      
      // If never shown before or it's been more than 1 day since last shown
      if (!hasSeenPrompt || (lastPromptTime && Date.now() - parseInt(lastPromptTime) > 24 * 60 * 60 * 1000)) {
        // Show the prompt after a short delay
        const timer = setTimeout(() => {
          setShowPrompt(true);
          // Update the last shown time
          localStorage.setItem('pwa_prompt_time', Date.now().toString());
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isIOS, isAndroid, isRunningAsPWA]);
  
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_seen', 'true');
  };
  
  const handleShowInstructions = () => {
    setShowFullInstructions(true);
  };
  
  if (!showPrompt) return null;
  
  if (showFullInstructions) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
          <button 
            className="absolute top-3 right-3 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
            onClick={handleDismiss}
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Install StreamGoal App</h2>
            <p className="text-gray-300">Follow these steps to install our app on your device</p>
          </div>
          
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-gray-800/70 rounded-lg p-4 flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Tap the Share button</h3>
                  <p className="text-sm text-gray-400">Tap the Share icon in your browser's toolbar</p>
                  <div className="mt-2 bg-gray-900 rounded-lg p-2 inline-block">
                    <Share2 className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/70 rounded-lg p-4 flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Tap "Add to Home Screen"</h3>
                  <p className="text-sm text-gray-400">Scroll down in the share menu and tap "Add to Home Screen"</p>
                  <div className="mt-2 bg-gray-900 rounded-lg p-2 inline-block">
                    <Plus className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/70 rounded-lg p-4 flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Tap "Add"</h3>
                  <p className="text-sm text-gray-400">Confirm by tapping "Add" in the top right corner</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800/70 rounded-lg p-4 flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Tap the menu button</h3>
                  <p className="text-sm text-gray-400">Tap the three dots menu in your browser</p>
                </div>
              </div>
              
              <div className="bg-gray-800/70 rounded-lg p-4 flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Tap "Install app" or "Add to Home screen"</h3>
                  <p className="text-sm text-gray-400">Look for the install option in the menu</p>
                  <div className="mt-2 bg-gray-900 rounded-lg p-2 inline-block">
                    <Download className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/70 rounded-lg p-4 flex items-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Tap "Install"</h3>
                  <p className="text-sm text-gray-400">Confirm by tapping "Install" in the prompt</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button 
              onClick={handleDismiss}
              className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white shadow-lg hover:shadow-primary/20 transition-all"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
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
            onClick={handleShowInstructions}
            className="bg-white text-blue-600 hover:bg-white/90 w-full"
          >
            Show Me How
          </Button>
        </div>
      </div>
    </div>
  );
}