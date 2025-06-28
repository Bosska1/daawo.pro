
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Tv, Heart, Search, X } from 'lucide-react';

interface WelcomePageProps {
  onClose: () => void;
}

export function WelcomePage({ onClose }: WelcomePageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to StreamGoal!",
      description: "Watch live football matches for free, no login required.",
      icon: <div className="text-6xl mb-4">⚽</div>,
      color: "from-blue-600 to-green-500"
    },
    {
      title: "Watch Live Matches",
      description: "Stream live football matches from around the world with just one click.",
      icon: <PlayCircle className="w-16 h-16 mb-4 text-red-500" />,
      color: "from-red-600 to-red-400"
    },
    {
      title: "Live TV Channels",
      description: "Access sports, news, and entertainment channels from various countries.",
      icon: <Tv className="w-16 h-16 mb-4 text-blue-500" />,
      color: "from-blue-600 to-blue-400"
    },
    {
      title: "Save Your Favorites",
      description: "Bookmark your favorite matches to easily find them later.",
      icon: <Heart className="w-16 h-16 mb-4 text-pink-500" />,
      color: "from-pink-600 to-pink-400"
    },
    {
      title: "Search & Filter",
      description: "Easily find matches by team, competition, or status.",
      icon: <Search className="w-16 h-16 mb-4 text-purple-500" />,
      color: "from-purple-600 to-purple-400"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  const handleSkip = () => {
    onClose();
  };
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="absolute top-4 right-4">
        <button 
          onClick={handleSkip}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className={`bg-gradient-to-r ${currentStepData.color} p-8 flex flex-col items-center justify-center text-white`}>
          {currentStepData.icon}
          <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-center text-white/90">{currentStepData.description}</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-6">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleSkip}
            >
              Skip
            </Button>
            
            <Button 
              variant="glow"
              onClick={handleNext}
            >
              {currentStep < steps.length - 1 ? "Next" : "Get Started"}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-gray-400">
          Install StreamGoal on your device for the best experience
        </p>
      </div>
    </div>
  );
}