
import React, { useState, useEffect } from 'react';
import { supabase, LiveTV } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StickyAd } from '@/components/sticky-ad';
import { LiveTVPlayer } from '@/components/live-tv-player';
import { Tv, Search, Globe, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function LiveTVsPage() {
  const [liveTVs, setLiveTVs] = useState<LiveTV[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTV, setSelectedTV] = useState<LiveTV | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  
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
      
      // Extract unique countries
      const uniqueCountries = Array.from(new Set(data.map((tv: LiveTV) => tv.country).filter(Boolean)));
      setCountries(uniqueCountries as string[]);
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
  
  const filteredTVs = liveTVs
    .filter(tv => selectedCategory === 'all' || tv.category === selectedCategory)
    .filter(tv => selectedCountry === 'all' || tv.country === selectedCountry)
    .filter(tv => 
      searchQuery === '' || 
      tv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tv.country && tv.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tv.language && tv.language.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (selectedTV) {
    return <LiveTVPlayer tv={selectedTV} onBack={handleBackClick} />;
  }

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Tv className="h-5 w-5 mr-2 text-primary" />
            Live TV Channels
          </h1>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-700"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-auto">
            <Tabs 
              defaultValue={selectedCategory} 
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="w-full md:w-auto flex flex-wrap bg-gray-900 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
                  All
                </TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="w-full md:w-auto">
            <Tabs 
              defaultValue={selectedCountry} 
              onValueChange={setSelectedCountry}
              className="w-full"
            >
              <TabsList className="w-full md:w-auto flex flex-wrap bg-gray-900 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  All Countries
                </TabsTrigger>
                {countries.map(country => (
                  <TabsTrigger 
                    key={country} 
                    value={country}
                    className="data-[state=active]:bg-gray-800 data-[state=active]:text-primary"
                  >
                    {country}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        ) : filteredTVs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTVs.map((tv) => (
              <Card key={tv.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden group">
                <CardContent className="p-4 flex flex-col items-center justify-center h-36">
                  {tv.logo ? (
                    <img 
                      src={tv.logo} 
                      alt={tv.name} 
                      className="h-16 object-contain mb-3 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-800 rounded-full mb-3 group-hover:scale-105 transition-transform">
                      <Tv className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <h3 className="text-center font-medium">{tv.name}</h3>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    {tv.language && (
                      <span className="flex items-center mr-2">
                        <Radio className="h-3 w-3 mr-1" />
                        {tv.language}
                      </span>
                    )}
                    {tv.country && (
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {tv.country}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="glow" 
                    className="w-full group-hover:scale-105 transition-transform"
                    onClick={() => handleWatchClick(tv)}
                  >
                    <Tv className="h-4 w-4 mr-2" />
                    Watch Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800">
            <div className="text-primary text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Channels Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchQuery ? 
                `No channels match your search for "${searchQuery}". Try a different search term.` :
                "There are no TV channels available with the selected filters."
              }
            </p>
          </div>
        )}
      </div>
      
      <StickyAd />
    </div>
  );
}