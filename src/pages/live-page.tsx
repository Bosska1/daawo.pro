
import React, { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';
import { MatchCard } from '@/components/match-card';
import { MatchStream } from '@/components/match-stream';
import { StickyAd } from '@/components/sticky-ad';

export function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  useEffect(() => {
    fetchLiveMatches();
  }, []);
  
  const fetchLiveMatches = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:team_a_id(id, name, country, flag, logo),
          team_b:team_b_id(id, name, country, flag, logo),
          competition:competition_id(id, name, logo)
        `)
        .eq('status', 'live')
        .order('kickoff_time', { ascending: true });
      
      if (error) throw error;
      
      setMatches(data as Match[]);
    } catch (error) {
      console.error('Error fetching live matches:', error);
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
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
          Live Matches
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
                onWatchClick={handleWatchClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-2">No Live Matches</h3>
            <p className="text-gray-400">
              There are no live matches at the moment. Check back later or see upcoming matches.
            </p>
          </div>
        )}
      </div>
      
      <StickyAd />
    </div>
  );
}