
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, PlayCircle, Clock, CheckCircle, Tv } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-2 z-10">
      <Tabs defaultValue={currentPath} className="w-full">
        <TabsList className="w-full bg-gray-900">
          <TabsTrigger value="/" asChild className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            <Link to="/" className="flex flex-col items-center py-1">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="/live" asChild className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            <Link to="/live" className="flex flex-col items-center py-1">
              <PlayCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Live</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="/upcoming" asChild className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            <Link to="/upcoming" className="flex flex-col items-center py-1">
              <Clock className="h-5 w-5" />
              <span className="text-xs mt-1">Upcoming</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="/finished" asChild className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            <Link to="/finished" className="flex flex-col items-center py-1">
              <CheckCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Finished</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="/tv" asChild className="flex-1 data-[state=active]:bg-gray-800 data-[state=active]:text-primary">
            <Link to="/tv" className="flex flex-col items-center py-1">
              <Tv className="h-5 w-5" />
              <span className="text-xs mt-1">TV</span>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}