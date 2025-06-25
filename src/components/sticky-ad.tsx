
import React, { useState } from 'react';
import { X } from 'lucide-react';

export function StickyAd() {
  const [isDismissed, setIsDismissed] = useState(false);
  
  if (isDismissed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-r from-blue-900/90 to-green-900/90 backdrop-blur-sm text-white py-2.5 px-4 text-sm z-10 shadow-lg flex items-center justify-between">
      <div className="flex-1 text-center">
        🔥 Live Football - Free HD Streams - No Login Required!
      </div>
      <button 
        onClick={() => setIsDismissed(true)}
        className="ml-2 text-gray-300 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}