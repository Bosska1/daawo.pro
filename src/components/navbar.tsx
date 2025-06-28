
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, PlayCircle, Tv, Heart } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine the active tab based on the current path
  const getActiveTab = () => {
    if (currentPath === '/live') return '/live';
    if (currentPath === '/tv') return '/tv';
    if (currentPath === '/favorites') return '/favorites';
    if (currentPath === '/matches') return '/matches';
    return '/';
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 p-2 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
      <Tabs defaultValue={getActiveTab()} value={getActiveTab()} className="w-full relative z-10">
        <TabsList className="w-full bg-gray-900 grid grid-cols-4 h-auto p-1 rounded-xl">
          <TabsTrigger 
            value="/" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)] rounded-lg"
          >
            <Link to="/" className="flex flex-col items-center py-1.5">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="/live" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)] rounded-lg"
          >
            <Link to="/live" className="flex flex-col items-center py-1.5">
              <PlayCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Live</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="/tv" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)] rounded-lg"
          >
            <Link to="/tv" className="flex flex-col items-center py-1.5">
              <Tv className="h-5 w-5" />
              <span className="text-xs mt-1">TV</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="/favorites" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)] rounded-lg"
          >
            <Link to="/favorites" className="flex flex-col items-center py-1.5">
              <Heart className="h-5 w-5" />
              <span className="text-xs mt-1">Favs</span>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}