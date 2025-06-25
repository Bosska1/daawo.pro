
import React, { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';
import { MatchCard } from '@/components/match-card';
import { MatchStream } from '@/components/match-stream';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StickyAd } from '@/components/sticky-ad';

export function HomePage() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  useEffect(() => {
    fetchMatches();
  }, []);
  
  const fetchMatches = async () => {
    setLoading(true);
    
    try {
      // Fetch live matches
      const { data: liveData, error: liveError } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:team_a_id(id, name, country, flag, logo),
          team_b:team_b_id(id, name, country, flag, logo),
          competition:competition_id(id, name, logo)
        `)
        .eq('status', 'live')
        .order('kickoff_time', { ascending: true });
      
      if (liveError) throw liveError;
      
      // Fetch upcoming matches
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:team_a_id(id, name, country, flag, logo),
          team_b:team_b_id(id, name, country, flag, logo),
          competition:competition_id(id, name, logo)
        `)
        .eq('status', 'upcoming')
        .order('kickoff_time', { ascending: true })
        .limit(5);
      
      if (upcomingError) throw upcomingError;
      
      // Fetch finished matches
      const { data: finishedData, error: finishedError } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:team_a_id(id, name, country, flag, logo),
          team_b:team_b_id(id, name, country, flag, logo),
          competition:competition_id(id, name, logo)
        `)
        .eq('status', 'finished')
        .order('kickoff_time', { ascending: false })
        .limit(5);
      
      if (finishedError) throw finishedError;
      
      setLiveMatches(liveData as Match[]);
      setUpcomingMatches(upcomingData as Match[]);
      setFinishedMatches(finishedData as Match[]);
    } catch (error) {
      console.error('Error fetching matches:', error);
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
      {/* Live Matches Section */}
      <section className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
            Live Matches
          </h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onWatchClick={handleWatchClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-400">No live matches at the moment</p>
          </div>
        )}
      </section>
      
      {/* Upcoming Matches Section */}
      <section className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-gray-400 mr-2">⏳</span>
            Upcoming Matches
          </h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-400">No upcoming matches scheduled</p>
          </div>
        )}
      </section>
      
      {/* Finished Matches Section */}
      <section className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="text-gray-400 mr-2">✅</span>
            Finished Matches
          </h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : finishedMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finishedMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-400">No finished matches</p>
          </div>
        )}
      </section>
      
      <StickyAd />
    </div>
  );
}