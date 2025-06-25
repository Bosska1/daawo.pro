
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, PlayCircle, Clock, CheckCircle, Tv } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 p-2 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
      <Tabs defaultValue={currentPath} className="w-full">
        <TabsList className="w-full bg-gray-900 grid grid-cols-5 h-auto p-1">
          <TabsTrigger 
            value="/" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)]"
          >
            <Link to="/" className="flex flex-col items-center py-1.5">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="/live" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)]"
          >
            <Link to="/live" className="flex flex-col items-center py-1.5">
              <PlayCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Live</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="/upcoming" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)]"
          >
            <Link to="/upcoming" className="flex flex-col items-center py-1.5">
              <Clock className="h-5 w-5" />
              <span className="text-xs mt-1">Upcoming</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="/finished" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)]"
          >
            <Link to="/finished" className="flex flex-col items-center py-1.5">
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Finished</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="/tv" 
            asChild 
            className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(56,239,125,0.3)]"
          >
            <Link to="/tv" className="flex flex-col items-center py-1.5">
              <Tv className="h-5 w-5" />
              <span className="text-xs mt-1">TV</span>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}