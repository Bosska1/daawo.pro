
import React, { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';
import { MatchCard } from '@/components/match-card';
import { StickyAd } from '@/components/sticky-ad';

export function FinishedPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFinishedMatches();
  }, []);
  
  const fetchFinishedMatches = async () => {
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
        .eq('status', 'finished')
        .order('kickoff_time', { ascending: false });
      
      if (error) throw error;
      
      setMatches(data as Match[]);
    } catch (error) {
      console.error('Error fetching finished matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <span className="text-gray-400 mr-2">✅</span>
          Finished Matches
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-2">No Finished Matches</h3>
            <p className="text-gray-400">
              There are no finished matches in the database.
            </p>
          </div>
        )}
      </div>
      
      <StickyAd />
    </div>
  );
}