
import React, { useState, useEffect } from 'react';
import { supabase, Match, Team, Competition } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface MatchFormProps {
  match?: Match;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MatchForm({ match, onSuccess, onCancel }: MatchFormProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const { toast } = useToast();
  
  // Form state
  const [teamA, setTeamA] = useState(match?.team_a_id || '');
  const [teamB, setTeamB] = useState(match?.team_b_id || '');
  const [competition, setCompetition] = useState(match?.competition_id || '');
  const [kickoffTime, setKickoffTime] = useState(
    match ? new Date(match.kickoff_time).toISOString().slice(0, 16) : ''
  );
  const [status, setStatus] = useState<'live' | 'upcoming' | 'finished'>(
    match?.status || 'upcoming'
  );
  const [scoreTeamA, setScoreTeamA] = useState(match?.score_team_a?.toString() || '');
  const [scoreTeamB, setScoreTeamB] = useState(match?.score_team_b?.toString() || '');
  const [streamUrl, setStreamUrl] = useState(match?.stream_url || '');
  const [highlightsUrl, setHighlightsUrl] = useState(match?.highlights_url || '');
  
  useEffect(() => {
    fetchFormData();
  }, []);
  
  const fetchFormData = async () => {
    setFormLoading(true);
    
    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (teamsError) throw teamsError;
      
      // Fetch competitions
      const { data: compsData, error: compsError } = await supabase
        .from('competitions')
        .select('*')
        .order('name');
      
      if (compsError) throw compsError;
      
      setTeams(teamsData as Team[]);
      setCompetitions(compsData as Competition[]);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const matchData = {
        team_a_id: teamA,
        team_b_id: teamB,
        competition_id: competition,
        kickoff_time: new Date(kickoffTime).toISOString(),
        status,
        score_team_a: scoreTeamA ? parseInt(scoreTeamA) : null,
        score_team_b: scoreTeamB ? parseInt(scoreTeamB) : null,
        stream_url: streamUrl || null,
        highlights_url: highlightsUrl || null,
      };
      
      if (match) {
        // Update existing match
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', match.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Match updated successfully",
        });
      } else {
        // Create new match
        const { error } = await supabase
          .from('matches')
          .insert(matchData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Match created successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving match:', error);
      toast({
        title: "Error",
        description: "Failed to save match",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/4"></div>
          <div className="h-10 bg-gray-800 rounded"></div>
          <div className="h-10 bg-gray-800 rounded"></div>
          <div className="h-10 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold mb-6">
        {match ? 'Edit Match' : 'Add New Match'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="team-a">Team A</Label>
            <Select 
              value={teamA} 
              onValueChange={setTeamA}
              required
            >
              <SelectTrigger id="team-a">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id || "default-value"}>
                    {team.flag} {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team-b">Team B</Label>
            <Select 
              value={teamB} 
              onValueChange={setTeamB}
              required
            >
              <SelectTrigger id="team-b">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id || "default-value"}>
                    {team.flag} {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="competition">Competition</Label>
          <Select 
            value={competition} 
            onValueChange={setCompetition}
            required
          >
            <SelectTrigger id="competition">
              <SelectValue placeholder="Select competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id || "default-value"}>
                  {comp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="kickoff-time">Kickoff Date & Time</Label>
          <Input
            id="kickoff-time"
            type="datetime-local"
            value={kickoffTime}
            onChange={(e) => setKickoffTime(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Match Status</Label>
          <Select 
            value={status} 
            onValueChange={(value: 'live' | 'upcoming' | 'finished') => setStatus(value)}
            required
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(status === 'live' || status === 'finished') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score-team-a">Team A Score</Label>
              <Input
                id="score-team-a"
                type="number"
                min="0"
                value={scoreTeamA}
                onChange={(e) => setScoreTeamA(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="score-team-b">Team B Score</Label>
              <Input
                id="score-team-b"
                type="number"
                min="0"
                value={scoreTeamB}
                onChange={(e) => setScoreTeamB(e.target.value)}
              />
            </div>
          </div>
        )}
        
        {status === 'live' && (
          <div className="space-y-2">
            <Label htmlFor="stream-url">Live Stream URL (HLS .m3u8)</Label>
            <Input
              id="stream-url"
              type="text"
              placeholder="http://example.com/stream.m3u8"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
            />
          </div>
        )}
        
        {status === 'finished' && (
          <div className="space-y-2">
            <Label htmlFor="highlights-url">Highlights Video URL</Label>
            <Input
              id="highlights-url"
              type="text"
              placeholder="https://www.youtube.com/embed/..."
              value={highlightsUrl}
              onChange={(e) => setHighlightsUrl(e.target.value)}
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : match ? "Update Match" : "Add Match"}
          </Button>
        </div>
      </form>
    </div>
  );
}