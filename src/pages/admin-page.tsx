
import React, { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AdminLogin } from '@/components/admin/admin-login';
import { MatchForm } from '@/components/admin/match-form';
import { MatchList } from '@/components/admin/match-list';
import { useToast } from '@/components/ui/use-toast';
import { Plus, LogOut } from 'lucide-react';

export function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const { toast } = useToast();
  
  useEffect(() => {
    checkAdminSession();
  }, []);
  
  useEffect(() => {
    if (isLoggedIn) {
      fetchMatches();
    }
  }, [isLoggedIn, activeTab]);
  
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
      
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
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
  
  const handleAddMatch = () => {
    setSelectedMatch(null);
    setShowForm(true);
  };
  
  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowForm(true);
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
  
  const handleFormSuccess = () => {
    setShowForm(false);
    fetchMatches();
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
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
      
      {showForm ? (
        <MatchForm 
          match={selectedMatch || undefined} 
          onSuccess={handleFormSuccess} 
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(value) => setActiveTab(value as any)}
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
    </div>
  );
}