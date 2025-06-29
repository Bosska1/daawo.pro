
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Team {
  id?: string;
  name: string;
  country: string;
  flag: string;
  logo?: string;
}

interface TeamFormProps {
  team?: Team;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TeamForm({ team, onSuccess, onCancel }: TeamFormProps) {
  const [name, setName] = useState(team?.name || '');
  const [country, setCountry] = useState(team?.country || '');
  const [flag, setFlag] = useState(team?.flag || '');
  const [logo, setLogo] = useState(team?.logo || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Common country flags
  const commonFlags = [
    { country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { country: 'Spain', flag: '🇪🇸' },
    { country: 'Germany', flag: '🇩🇪' },
    { country: 'Italy', flag: '🇮🇹' },
    { country: 'France', flag: '🇫🇷' },
    { country: 'Brazil', flag: '🇧🇷' },
    { country: 'Argentina', flag: '🇦🇷' },
    { country: 'Portugal', flag: '🇵🇹' },
    { country: 'Netherlands', flag: '🇳🇱' },
    { country: 'Belgium', flag: '🇧🇪' },
    { country: 'USA', flag: '🇺🇸' },
    { country: 'Mexico', flag: '🇲🇽' },
    { country: 'Japan', flag: '🇯🇵' },
    { country: 'South Korea', flag: '🇰🇷' },
    { country: 'Australia', flag: '🇦🇺' },
    { country: 'Saudi Arabia', flag: '🇸🇦' },
    { country: 'Qatar', flag: '🇶🇦' },
    { country: 'UAE', flag: '🇦🇪' },
    { country: 'Somalia', flag: '🇸🇴' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const teamData = {
        name,
        country,
        flag,
        logo: logo || null,
      };
      
      if (team?.id) {
        // Update existing team
        const { error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', team.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        // Create new team
        const { error } = await supabase
          .from('teams')
          .insert(teamData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Error",
        description: "Failed to save team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFlagSelect = (selectedFlag: string, selectedCountry: string) => {
    setFlag(selectedFlag);
    if (!country) {
      setCountry(selectedCountry);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 shadow-xl">
      <h2 className="text-xl font-bold mb-6 gradient-text">
        {team?.id ? 'Edit Team' : 'Add New Team'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-name" className="text-gray-200">Team Name</Label>
          <Input
            id="team-name"
            type="text"
            placeholder="Real Madrid"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-gray-800/80 border-gray-700 focus:border-primary/50 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="team-country" className="text-gray-200">Country</Label>
          <Input
            id="team-country"
            type="text"
            placeholder="Spain"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="bg-gray-800/80 border-gray-700 focus:border-primary/50 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="team-flag" className="text-gray-200">Flag Emoji</Label>
          <div className="flex items-center">
            <Input
              id="team-flag"
              type="text"
              placeholder="🇪🇸"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              required
              className="bg-gray-800/80 border-gray-700 focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
            <div className="ml-2 text-2xl">{flag}</div>
          </div>
          
          <div className="mt-2">
            <Label className="text-sm text-gray-400 mb-2 block">Common Flags</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {commonFlags.map((item) => (
                <button
                  key={item.country}
                  type="button"
                  onClick={() => handleFlagSelect(item.flag, item.country)}
                  className="w-10 h-10 flex items-center justify-center text-xl bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                  title={item.country}
                >
                  {item.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="team-logo" className="text-gray-200">Logo URL (optional)</Label>
          <Input
            id="team-logo"
            type="url"
            placeholder="https://example.com/logo.svg"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="bg-gray-800/80 border-gray-700 focus:border-primary/50 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-700 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 transition-all shadow-lg hover:shadow-primary/20"
          >
            {loading ? "Saving..." : team?.id ? "Update Team" : "Add Team"}
          </Button>
        </div>
      </form>
    </div>
  );
}