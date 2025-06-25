
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to a search results page
      // For now, we'll just close the search
      setIsSearchOpen(false);
      setSearchQuery('');
      // Example: navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`sticky top-0 z-20 w-full transition-all duration-300 ${
      isScrolled ? 'bg-gray-950/90 backdrop-blur-md shadow-md' : 'bg-gray-950'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
              StreamGoal
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <div className="text-sm text-gray-400">
              Watch Live Football — Free & Fast!
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Link to="/tv">
                <Button variant="outline" size="sm">
                  Live TV
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex md:hidden items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-3 border-t border-gray-800">
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="text"
                placeholder="Search matches, teams, competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border-gray-700"
                autoFocus
              />
              <Button type="submit" className="ml-2">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-800">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="px-3 py-2 rounded-md hover:bg-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/live" 
                className="px-3 py-2 rounded-md hover:bg-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Live Matches
              </Link>
              <Link 
                to="/upcoming" 
                className="px-3 py-2 rounded-md hover:bg-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Upcoming Matches
              </Link>
              <Link 
                to="/finished" 
                className="px-3 py-2 rounded-md hover:bg-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Finished Matches
              </Link>
              <Link 
                to="/tv" 
                className="px-3 py-2 rounded-md hover:bg-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Live TV
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}