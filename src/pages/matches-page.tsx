
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase, Match } from '@/lib/supabase';
import { MatchCard } from '@/components/match-card';
import { MatchStream } from '@/components/match-stream';
import { StickyAd } from '@/components/sticky-ad';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, PlayCircle, Clock, CheckCircle, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MatchesPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    // Set active tab based on URL path
    if (location.pathname === '/live') {
      setActiveTab('live');
    } else if (location.pathname === '/upcoming') {
      setActiveTab('upcoming');
    } else if (location.pathname === '/finished') {
      setActiveTab('finished');
    } else {
      setActiveTab('all');
    }
    
    fetchMatches();
  }, [location.pathname]);
  
  useEffect(() => {
    applyFilters();
  }, [matches, activeTab, searchQuery, selectedCompetition]);
  
  const fetchMatches = async () => {
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
        .order('kickoff_time', { ascending: true });
      
      if (error) throw error;
      
      setMatches(data as Match[]);
      
      // Extract unique competitions
      const uniqueCompetitions = Array.from(
        new Set(data.map((match: Match) => match.competition?.name))
      ).filter(Boolean) as string[];
      
      setCompetitions(uniqueCompetitions);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...matches];
    
    // Filter by tab/status
    if (activeTab !== 'all') {
      filtered = filtered.filter(match => match.status === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(match => 
        match.team_a?.name.toLowerCase().includes(query) ||
        match.team_b?.name.toLowerCase().includes(query) ||
        match.competition?.name.toLowerCase().includes(query)
      );
    }
    
    // Filter by competition
    if (selectedCompetition !== 'all') {
      filtered = filtered.filter(match => 
        match.competition?.name === selectedCompetition
      );
    }
    
    // Sort matches appropriately
    filtered.sort((a, b) => {
      // Live matches first
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      
      // Then upcoming matches by kickoff time
      if (a.status === 'upcoming' && b.status === 'upcoming') {
        return new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime();
      }
      
      // Then finished matches by most recent
      if (a.status === 'finished' && b.status === 'finished') {
        return new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime();
      }
      
      // Default sort by kickoff time
      return new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime();
    });
    
    setFilteredMatches(filtered);
  };
  
  const handleWatchClick = (match: Match) => {
    setSelectedMatch(match);
    window.scrollTo(0, 0);
  };
  
  const handleBackClick = () => {
    setSelectedMatch(null);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <PlayCircle className="h-5 w-5 text-red-500" />;
      case 'upcoming':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'finished':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-primary" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live':
        return 'Live Matches';
      case 'upcoming':
        return 'Upcoming Matches';
      case 'finished':
        return 'Finished Matches';
      default:
        return 'All Matches';
    }
  };

  if (selectedMatch) {
    return <MatchStream match={selectedMatch} onBack={handleBackClick} />;
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            {getStatusIcon(activeTab)}
            <span className="ml-2">{getStatusLabel(activeTab)}</span>
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-900 border-gray-700"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/20' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'all' | 'live' | 'upcoming' | 'finished')}
          className="w-full mb-6"
        >
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
              <Calendar className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
              <PlayCircle className="h-4 w-4 mr-2" />
              Live
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
              <Clock className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="finished" className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
              <CheckCircle className="h-4 w-4 mr-2" />
              Finished
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <h3 className="text-sm font-medium mb-3">Filter by Competition</h3>
            <Select 
              value={selectedCompetition} 
              onValueChange={setSelectedCompetition}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="All Competitions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competitions</SelectItem>
                {competitions.map(competition => (
                  <SelectItem key={competition} value={competition}>
                    {competition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onWatchClick={match.status === 'live' ? handleWatchClick : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800">
            <div className="text-primary text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchQuery ? 
                `No matches match your search for "${searchQuery}". Try a different search term.` :
                "There are no matches available with the selected filters."
              }
            </p>
          </div>
        )}
      </div>
      
      <StickyAd />
    </div>
  );
}