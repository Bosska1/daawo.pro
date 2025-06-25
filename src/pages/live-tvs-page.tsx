
import React, { useState, useEffect } from 'react';
import { supabase, LiveTV } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StickyAd } from '@/components/sticky-ad';
import { LiveTVPlayer } from '@/components/live-tv-player';
import { Tv } from 'lucide-react';

export function LiveTVsPage() {
  const [liveTVs, setLiveTVs] = useState<LiveTV[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTV, setSelectedTV] = useState<LiveTV | null>(null);
  
  useEffect(() => {
    fetchLiveTVs();
  }, []);
  
  const fetchLiveTVs = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('live_tvs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setLiveTVs(data as LiveTV[]);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map((tv: LiveTV) => tv.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching live TVs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleWatchClick = (tv: LiveTV) => {
    setSelectedTV(tv);
    window.scrollTo(0, 0);
  };
  
  const handleBackClick = () => {
    setSelectedTV(null);
  };
  
  const filteredTVs = selectedCategory === 'all' 
    ? liveTVs 
    : liveTVs.filter(tv => tv.category === selectedCategory);

  if (selectedTV) {
    return <LiveTVPlayer tv={selectedTV} onBack={handleBackClick} />;
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Tv className="h-5 w-5 mr-2 text-primary" />
          Live TV Channels
        </h1>
        
        <Tabs 
          defaultValue={selectedCategory} 
          onValueChange={setSelectedCategory}
          className="mb-6"
        >
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all">All Channels</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-40 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : filteredTVs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTVs.map((tv) => (
              <Card key={tv.id} className="bg-gray-900 border-gray-800 hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-4 flex flex-col items-center justify-center h-32">
                  {tv.logo ? (
                    <img 
                      src={tv.logo} 
                      alt={tv.name} 
                      className="h-16 object-contain mb-2"
                    />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-800 rounded-full mb-2">
                      <Tv className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <h3 className="text-center font-medium">{tv.name}</h3>
                  <p className="text-xs text-gray-400">{tv.language || tv.country || tv.category}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="glow" 
                    className="w-full"
                    onClick={() => handleWatchClick(tv)}
                  >
                    Watch Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-2">No Channels Found</h3>
            <p className="text-gray-400">
              There are no TV channels available in this category.
            </p>
          </div>
        )}
      </div>
      
      <StickyAd />
    </div>
  );
}