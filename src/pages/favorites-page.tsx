
import React, { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';
import { MatchCard } from '@/components/match-card';
import { MatchStream } from '@/components/match-stream';
import { StickyAd } from '@/components/sticky-ad';
import { Heart } from 'lucide-react';

export function FavoritesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  useEffect(() => {
    fetchFavoriteMatches();
  }, []);
  
  const fetchFavoriteMatches = async () => {
    setLoading(true);
    
    try {
      // Get favorite match IDs from localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('streamgoal_favorites') || '[]');
      
      if (favoriteIds.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }
      
      // Fetch matches that are in favorites
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:team_a_id(id, name, country, flag, logo),
          team_b:team_b_id(id, name, country, flag, logo),
          competition:competition_id(id, name, logo)
        `)
        .in('id', favoriteIds)
        .order('kickoff_time', { ascending: false });
      
      if (error) throw error;
      
      setMatches(data as Match[]);
    } catch (error) {
      console.error('Error fetching favorite matches:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleWatchClick = (match: Match) => {
    setSelectedMatch(match);
    window.scrollTo(0, 0);
  };
  
  const handleBackClick = () => {
    setSelectedMatch(null);
  };

  if (selectedMatch) {
    return <MatchStream match={selectedMatch} onBack={handleBackClick} />;
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          Your Favorites
        </h1>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onWatchClick={match.status === 'live' ? handleWatchClick : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800">
            <div className="text-red-500 text-5xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              You haven't added any matches to your favorites yet. Click the heart icon on any match to add it to your favorites.
            </p>
          </div>
        )}
      </div>
      
      <StickyAd />
    </div>
  );
}