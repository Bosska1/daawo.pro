
import React, { useEffect, useState } from 'react';
import { Match } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MatchStreamProps {
  match: Match;
  onBack: () => void;
}

export function MatchStream({ match, onBack }: MatchStreamProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const iframe = document.getElementById('stream-iframe') as HTMLIFrameElement;
    
    if (!document.fullscreenElement) {
      iframe.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between p-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-lg font-semibold">
            {match.team_a?.name} {match.team_a?.flag} vs {match.team_b?.flag} {match.team_b?.name}
          </h2>
          <p className="text-sm text-gray-400">🏆 {match.competition?.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>
      
      <div className="relative w-full pt-[56.25%] bg-black">
        {match.stream_url ? (
          <iframe 
            id="stream-iframe"
            src={match.stream_url}
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Stream not available</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-200">
              <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
              Live Now!
            </span>
          </div>
          <div className="text-sm text-gray-400">
            If stream doesn't load, try refreshing the page
          </div>
        </div>
      </div>
    </div>
  );
}