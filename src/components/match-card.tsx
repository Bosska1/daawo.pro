
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Match } from '@/lib/supabase';
import { formatDate, formatTime, formatMatchTime } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface MatchCardProps {
  match: Match;
  onWatchClick?: (match: Match) => void;
}

export function MatchCard({ match, onWatchClick }: MatchCardProps) {
  const { toast } = useToast();
  const [showAd, setShowAd] = useState(false);
  
  const handleWatchClick = () => {
    if (onWatchClick) {
      onWatchClick(match);
      
      // Show ad popup after 5 seconds
      setTimeout(() => {
        setShowAd(true);
      }, 5000);
    }
  };
  
  const closeAd = () => {
    setShowAd(false);
  };
  
  const joinTelegram = () => {
    window.open('https://t.me/streamgoal', '_blank');
    closeAd();
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800 hover:border-primary/50 transition-all duration-300 overflow-hidden relative">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">{match.team_a?.name}</span>
              <span className="text-xl">{match.team_a?.flag}</span>
            </div>
            
            {match.status === 'finished' ? (
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary">{match.score_team_a}</span>
                <span className="text-gray-400">-</span>
                <span className="text-xl font-bold text-primary">{match.score_team_b}</span>
              </div>
            ) : (
              <span className="text-gray-400">vs</span>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-xl">{match.team_b?.flag}</span>
              <span className="text-lg font-semibold">{match.team_b?.name}</span>
            </div>
          </div>
          
          {/* Competition */}
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-400">
              🏆 {match.competition?.name}
            </span>
          </div>
          
          {/* Match Info */}
          <div className="flex items-center justify-center">
            {match.status === 'live' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-200">
                <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                Live Now!
              </span>
            )}
            
            {match.status === 'upcoming' && (
              <span className="text-sm text-gray-400">
                ⏳ {formatMatchTime(match.kickoff_time)}
              </span>
            )}
            
            {match.status === 'finished' && (
              <span className="text-sm text-gray-400">
                📅 Final Score: {formatDate(match.kickoff_time)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-center">
        {match.status === 'live' && (
          <Button 
            variant="glow" 
            className="w-full"
            onClick={handleWatchClick}
          >
            ▶️ Watch Live
          </Button>
        )}
        
        {match.status === 'upcoming' && (
          <Button variant="outline" className="w-full" disabled>
            ⏳ Not Started
          </Button>
        )}
        
        {match.status === 'finished' && match.highlights_url && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open(match.highlights_url, '_blank')}
          >
            🎥 Watch Highlights
          </Button>
        )}
      </CardFooter>
      
      {/* Ad Popup */}
      {showAd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full relative">
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={closeAd}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 text-center">Enjoying the Match?</h3>
            <p className="text-gray-300 mb-6 text-center">
              Follow Us on Telegram for More Free Streams!
            </p>
            <div className="flex justify-center">
              <Button 
                variant="glow" 
                className="w-full"
                onClick={joinTelegram}
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}