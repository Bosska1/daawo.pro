
import React, { useState, useEffect } from 'react';
import { supabase, Match, LiveTV } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AdminLogin } from '@/components/admin/admin-login';
import { MatchForm } from '@/components/admin/match-form';
import { MatchList } from '@/components/admin/match-list';
import { AdForm } from '@/components/admin/ad-form';
import { AdList } from '@/components/admin/ad-list';
import { LiveTVForm } from '@/components/admin/live-tv-form';
import { LiveTVList } from '@/components/admin/live-tv-list';
import { useToast } from '@/components/ui/use-toast';
import { Plus, LogOut, Tv, BarChart3, Calendar, PanelLeftOpen } from 'lucide-react';

interface Advertisement {
  id: string;
  name: string;
  type: 'popup' | 'banner' | 'video' | 'interstitial';
  content: string;
  target_page?: string;
  delay_seconds?: number;
  is_active: boolean;
  click_url?: string;
  impressions: number;
  clicks: number;
}

export function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'ads' | 'tv'>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [tvChannels, setTvChannels] = useState<LiveTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [showTvForm, setShowTvForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [selectedTv, setSelectedTv] = useState<LiveTV | null>(null);
  const [matchFilter, setMatchFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const { toast } = useToast();
  
  useEffect(() => {
    checkAdminSession();
  }, []);
  
  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'matches') {
        fetchMatches();
      } else if (activeTab === 'ads') {
        fetchAds();
      } else if (activeTab === 'tv') {
        fetchTvChannels();
      }
    }
  }, [isLoggedIn, activeTab, matchFilter]);
  
  const checkAdminSession = () => {
    const adminSession = localStorage.getItem('streamgoal_admin');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        if (session.loggedIn) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('streamgoal_admin');
      }
    }
  };
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('streamgoal_admin');
    setIsLoggedIn(false);
  };
  
  const fetchMatches = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          team_a:team_a_id(id, name, country, flag, logo),
          team_b:team_b_id(id, name, country, flag, logo),
          competition:competition_id(id, name, logo)
        `)
        .order('kickoff_time', { ascending: false });
      
      if (matchFilter !== 'all') {
        query = query.eq('status', matchFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setMatches(data as Match[]);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAds = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAds(data as Advertisement[]);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast({
        title: "Error",
        description: "Failed to load advertisements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTvChannels = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('live_tvs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setTvChannels(data as LiveTV[]);
    } catch (error) {
      console.error('Error fetching TV channels:', error);
      toast({
        title: "Error",
        description: "Failed to load TV channels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Match handlers
  const handleAddMatch = () => {
    setSelectedMatch(null);
    setShowMatchForm(true);
  };
  
  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowMatchForm(true);
  };
  
  const handleDeleteMatch = async (match: Match) => {
    if (!confirm(`Are you sure you want to delete the match between ${match.team_a?.name} and ${match.team_b?.name}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', match.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Match deleted successfully",
      });
      
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive",
      });
    }
  };
  
  const handleMatchFormSuccess = () => {
    setShowMatchForm(false);
    fetchMatches();
  };
  
  const handleMatchFormCancel = () => {
    setShowMatchForm(false);
  };
  
  // Ad handlers
  const handleAddAd = () => {
    setSelectedAd(null);
    setShowAdForm(true);
  };
  
  const handleEditAd = (ad: Advertisement) => {
    setSelectedAd(ad);
    setShowAdForm(true);
  };
  
  const handleDeleteAd = async (ad: Advertisement) => {
    if (!confirm(`Are you sure you want to delete the advertisement "${ad.name}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', ad.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Advertisement deleted successfully",
      });
      
      fetchAds();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to delete advertisement",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleAdActive = async (ad: Advertisement) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Advertisement ${ad.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      
      fetchAds();
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
      toast({
        title: "Error",
        description: "Failed to update advertisement status",
        variant: "destructive",
      });
    }
  };
  
  const handleAdFormSuccess = () => {
    setShowAdForm(false);
    fetchAds();
  };
  
  const handleAdFormCancel = () => {
    setShowAdForm(false);
  };
  
  // TV handlers
  const handleAddTv = () => {
    setSelectedTv(null);
    setShowTvForm(true);
  };
  
  const handleEditTv = (tv: LiveTV) => {
    setSelectedTv(tv);
    setShowTvForm(true);
  };
  
  const handleDeleteTv = async (tv: LiveTV) => {
    if (!confirm(`Are you sure you want to delete the TV channel "${tv.name}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('live_tvs')
        .delete()
        .eq('id', tv.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "TV channel deleted successfully",
      });
      
      fetchTvChannels();
    } catch (error) {
      console.error('Error deleting TV channel:', error);
      toast({
        title: "Error",
        description: "Failed to delete TV channel",
        variant: "destructive",
      });
    }
  };
  
  const handleTvFormSuccess = () => {
    setShowTvForm(false);
    fetchTvChannels();
  };
  
  const handleTvFormCancel = () => {
    setShowTvForm(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
          StreamGoal Admin
        </h1>
        
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <Tabs 
        defaultValue="matches" 
        onValueChange={(value) => setActiveTab(value as 'matches' | 'ads' | 'tv')}
        className="w-full mb-6"
      >
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="matches" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="tv" className="flex items-center">
            <Tv className="h-4 w-4 mr-2" />
            Live TV
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center">
            <PanelLeftOpen className="h-4 w-4 mr-2" />
            Advertisements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches">
          {showMatchForm ? (
            <MatchForm 
              match={selectedMatch || undefined} 
              onSuccess={handleMatchFormSuccess} 
              onCancel={handleMatchFormCancel}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <Tabs 
                  defaultValue={matchFilter} 
                  onValueChange={(value) => setMatchFilter(value as any)}
                  className="w-full max-w-md"
                >
                  <TabsList>
                    <TabsTrigger value="all">All Matches</TabsTrigger>
                    <TabsTrigger value="live">Live</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="finished">Finished</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button onClick={handleAddMatch}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Match
                </Button>
              </div>
              
              {loading ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <MatchList 
                    matches={matches} 
                    onEdit={handleEditMatch} 
                    onDelete={handleDeleteMatch}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="tv">
          {showTvForm ? (
            <LiveTVForm 
              tv={selectedTv || undefined} 
              onSuccess={handleTvFormSuccess} 
              onCancel={handleTvFormCancel}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">TV Channels</h2>
                <Button onClick={handleAddTv}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add TV Channel
                </Button>
              </div>
              
              {loading ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <LiveTVList 
                    tvChannels={tvChannels} 
                    onEdit={handleEditTv} 
                    onDelete={handleDeleteTv}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="ads">
          {showAdForm ? (
            <AdForm 
              ad={selectedAd || undefined} 
              onSuccess={handleAdFormSuccess} 
              onCancel={handleAdFormCancel}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Advertisements</h2>
                <Button onClick={handleAddAd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Advertisement
                </Button>
              </div>
              
              {loading ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                    <div className="h-10 bg-gray-800 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <AdList 
                    ads={ads} 
                    onEdit={handleEditAd} 
                    onDelete={handleDeleteAd}
                    onToggleActive={handleToggleAdActive}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}