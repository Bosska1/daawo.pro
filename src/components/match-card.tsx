
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Match } from '@/lib/supabase';
import { formatDate, formatTime, formatMatchTime } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Play, Clock, Calendar, Trophy, ExternalLink } from 'lucide-react';
import { FavoritesButton } from '@/components/favorites-button';

interface MatchCardProps {
  match: Match;
  onWatchClick?: (match: Match) => void;
}

export function MatchCard({ match, onWatchClick }: MatchCardProps) {
  const { toast } = useToast();
  const [showAd, setShowAd] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
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
    <Card 
      className={`w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 hover:border-primary/50 transition-all duration-300 overflow-hidden relative group rounded-xl shadow-lg card-hover ${isHovered ? 'shadow-primary/20' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
      <CardContent className="p-5 relative z-10">
        <div className="flex flex-col space-y-4">
          {/* Competition */}
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-400 flex items-center glass px-3 py-1 rounded-full">
              <Trophy className="h-4 w-4 mr-1.5 text-primary/70" />
              {match.competition?.name}
            </span>
          </div>
          
          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center space-y-2 w-2/5">
              <span className="text-3xl animate-float">{match.team_a?.flag}</span>
              <span className="text-base font-semibold text-center">{match.team_a?.name}</span>
            </div>
            
            {match.status === 'finished' ? (
              <div className="flex flex-col items-center justify-center w-1/5">
                <div className="flex items-center justify-center glass rounded-lg px-4 py-2 shadow-inner">
                  <span className="text-xl font-bold text-primary">{match.score_team_a}</span>
                  <span className="text-gray-400 mx-2">-</span>
                  <span className="text-xl font-bold text-primary">{match.score_team_b}</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Final Score
                </span>
              </div>
            ) : match.status === 'live' ? (
              <div className="flex flex-col items-center justify-center w-1/5">
                <div className="flex items-center justify-center bg-red-900/30 backdrop-blur-sm rounded-lg px-4 py-2 shadow-inner border border-red-900/30 animate-pulse-glow">
                  <span className="text-xl font-bold text-white">{match.score_team_a || 0}</span>
                  <span className="text-gray-400 mx-2">-</span>
                  <span className="text-xl font-bold text-white">{match.score_team_b || 0}</span>
                </div>
                <span className="inline-flex items-center text-xs text-red-400 mt-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1"></span>
                  LIVE
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-1/5">
                <div className="flex items-center justify-center glass rounded-lg px-4 py-2 shadow-inner">
                  <span className="text-gray-400">VS</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(match.kickoff_time)}
                </span>
              </div>
            )}
            
            <div className="flex flex-col items-center space-y-2 w-2/5">
              <span className="text-3xl animate-float">{match.team_b?.flag}</span>
              <span className="text-base font-semibold text-center">{match.team_b?.name}</span>
            </div>
          </div>
          
          {/* Match Info */}
          <div className="flex items-center justify-center">
            {match.status === 'upcoming' && (
              <span className="text-sm text-gray-400 flex items-center glass px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-1.5 text-yellow-500/70" />
                {formatMatchTime(match.kickoff_time)}
              </span>
            )}
            
            {match.status === 'finished' && (
              <span className="text-sm text-gray-400 flex items-center glass px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4 mr-1.5 text-green-500/70" />
                {formatDate(match.kickoff_time)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 relative z-10">
        {match.status === 'live' && (
          <Button 
            variant="glow" 
            className="w-full group-hover:scale-105 transition-transform"
            onClick={handleWatchClick}
          >
            <Play className="h-4 w-4 mr-2" /> Watch Live
          </Button>
        )}
        
        {match.status === 'upcoming' && (
          <Button variant="outline" className="w-full glass" disabled>
            <Clock className="h-4 w-4 mr-2" /> Not Started
          </Button>
        )}
        
        {match.status === 'finished' && match.highlights_url && (
          <Button 
            variant="outline" 
            className="w-full hover:bg-gray-800 glass"
            onClick={() => window.open(match.highlights_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Watch Highlights
          </Button>
        )}
      </CardFooter>
      
      {/* Favorites Button */}
      <FavoritesButton match={match} />
      
      {/* Live Indicator */}
      {match.status === 'live' && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/60 backdrop-blur-sm text-red-200 shadow-lg animate-pulse-glow">
            <span className="w-1.5 h-1.5 mr-1 bg-red-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        </div>
      )}
      
      {/* Upcoming Indicator */}
      {match.status === 'upcoming' && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-900/40 backdrop-blur-sm text-yellow-200 shadow-lg">
            <Clock className="h-3 w-3 mr-1" />
            UPCOMING
          </span>
        </div>
      )}
      
      {/* Finished Indicator */}
      {match.status === 'finished' && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/40 backdrop-blur-sm text-green-200 shadow-lg">
            <Calendar className="h-3 w-3 mr-1" />
            FINISHED
          </span>
        </div>
      )}
      
      {/* Ad Popup */}
      {showAd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full relative shadow-2xl animate-float">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none rounded-xl"></div>
            <button 
              className="absolute top-3 right-3 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
              onClick={closeAd}
            >
              ✕
            </button>
            <div className="text-center mb-4 text-primary text-4xl">📱</div>
            <h3 className="text-xl font-bold mb-4 text-center gradient-text">Enjoying the Match?</h3>
            <p className="text-gray-300 mb-6 text-center">
              Follow Us on Telegram for More Free Streams and Exclusive Content!
            </p>
            <div className="flex justify-center">
              <Button 
                variant="glow" 
                className="w-full animate-pulse-glow"
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