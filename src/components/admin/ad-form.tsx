
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

interface Advertisement {
  id: string;
  name: string;
  type: 'popup' | 'banner' | 'video' | 'interstitial';
  content: string;
  target_page?: string;
  delay_seconds?: number;
  is_active: boolean;
  click_url?: string;
}

interface AdFormProps {
  ad?: Advertisement;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdForm({ ad, onSuccess, onCancel }: AdFormProps) {
  const [name, setName] = useState(ad?.name || '');
  const [type, setType] = useState<'popup' | 'banner' | 'video' | 'interstitial'>(ad?.type || 'popup');
  const [content, setContent] = useState(ad?.content || '');
  const [targetPage, setTargetPage] = useState(ad?.target_page || '');
  const [delaySeconds, setDelaySeconds] = useState(ad?.delay_seconds?.toString() || '5');
  const [isActive, setIsActive] = useState(ad?.is_active ?? true);
  const [clickUrl, setClickUrl] = useState(ad?.click_url || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const adData = {
        name,
        type,
        content,
        target_page: targetPage || null,
        delay_seconds: delaySeconds ? parseInt(delaySeconds) : 5,
        is_active: isActive,
        click_url: clickUrl || null,
      };
      
      if (ad) {
        // Update existing ad
        const { error } = await supabase
          .from('advertisements')
          .update(adData)
          .eq('id', ad.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Advertisement updated successfully",
        });
      } else {
        // Create new ad
        const { error } = await supabase
          .from('advertisements')
          .insert(adData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Advertisement created successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to save advertisement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold mb-6">
        {ad ? 'Edit Advertisement' : 'Add New Advertisement'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ad-name">Advertisement Name</Label>
          <Input
            id="ad-name"
            type="text"
            placeholder="Telegram Promotion"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ad-type">Advertisement Type</Label>
          <Select 
            value={type} 
            onValueChange={(value: 'popup' | 'banner' | 'video' | 'interstitial') => setType(value)}
            required
          >
            <SelectTrigger id="ad-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popup">Popup</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="interstitial">Interstitial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ad-content">Content (HTML/Text)</Label>
          <Textarea
            id="ad-content"
            placeholder={`<div class="ad-content">
  <h3>Join our Telegram channel!</h3>
  <p>Get notifications for new matches</p>
</div>`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] font-mono text-sm"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="click-url">Click URL (optional)</Label>
          <Input
            id="click-url"
            type="url"
            placeholder="https://t.me/streamgoal"
            value={clickUrl}
            onChange={(e) => setClickUrl(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target-page">Target Page (optional)</Label>
            <Select 
              value={targetPage} 
              onValueChange={setTargetPage}
            >
              <SelectTrigger id="target-page">
                <SelectValue placeholder="All pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All pages</SelectItem>
                <SelectItem value="/">Home Page</SelectItem>
                <SelectItem value="/live">Live Matches</SelectItem>
                <SelectItem value="/tv">Live TV</SelectItem>
                <SelectItem value="/match">Match Viewing Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="delay-seconds">Delay (seconds)</Label>
            <Input
              id="delay-seconds"
              type="number"
              min="0"
              max="60"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch 
            id="is-active" 
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : ad ? "Update Advertisement" : "Add Advertisement"}
          </Button>
        </div>
      </form>
    </div>
  );
}