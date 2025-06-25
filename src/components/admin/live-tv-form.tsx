
import React, { useState } from 'react';
import { supabase, LiveTV } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

interface LiveTVFormProps {
  tv?: LiveTV;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LiveTVForm({ tv, onSuccess, onCancel }: LiveTVFormProps) {
  const [name, setName] = useState(tv?.name || '');
  const [category, setCategory] = useState(tv?.category || 'Sports');
  const [logo, setLogo] = useState(tv?.logo || '');
  const [streamUrl, setStreamUrl] = useState(tv?.stream_url || '');
  const [isPremium, setIsPremium] = useState(tv?.is_premium || false);
  const [country, setCountry] = useState(tv?.country || '');
  const [language, setLanguage] = useState(tv?.language || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const tvData = {
        name,
        category,
        logo: logo || null,
        stream_url: streamUrl,
        is_premium: isPremium,
        country: country || null,
        language: language || null,
      };
      
      if (tv) {
        // Update existing TV channel
        const { error } = await supabase
          .from('live_tvs')
          .update(tvData)
          .eq('id', tv.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "TV channel updated successfully",
        });
      } else {
        // Create new TV channel
        const { error } = await supabase
          .from('live_tvs')
          .insert(tvData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "TV channel created successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving TV channel:', error);
      toast({
        title: "Error",
        description: "Failed to save TV channel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold mb-6">
        {tv ? 'Edit TV Channel' : 'Add New TV Channel'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tv-name">Channel Name</Label>
          <Input
            id="tv-name"
            type="text"
            placeholder="beIN Sports 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tv-category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
              required
            >
              <SelectTrigger id="tv-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="News">News</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Movies">Movies</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Kids">Kids</SelectItem>
                <SelectItem value="Documentary">Documentary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tv-country">Country (optional)</Label>
            <Input
              id="tv-country"
              type="text"
              placeholder="USA, UK, Qatar, etc."
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tv-logo">Logo URL (optional)</Label>
          <Input
            id="tv-logo"
            type="url"
            placeholder="https://example.com/logo.png"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tv-stream">Stream URL (HLS .m3u8)</Label>
          <Input
            id="tv-stream"
            type="text"
            placeholder="http://example.com/stream.m3u8"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tv-language">Language (optional)</Label>
            <Input
              id="tv-language"
              type="text"
              placeholder="English, Arabic, etc."
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-8">
            <Switch 
              id="is-premium" 
              checked={isPremium}
              onCheckedChange={setIsPremium}
            />
            <Label htmlFor="is-premium">Premium Channel</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : tv ? "Update Channel" : "Add Channel"}
          </Button>
        </div>
      </form>
    </div>
  );
}