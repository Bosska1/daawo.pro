
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Match } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface FavoritesButtonProps {
  match: Match;
}

export function FavoritesButton({ match }: FavoritesButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if this match is in favorites
    const favorites = JSON.parse(localStorage.getItem('streamgoal_favorites') || '[]');
    setIsFavorite(favorites.some((fav: string) => fav === match.id));
  }, [match.id]);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Get current favorites
    const favorites = JSON.parse(localStorage.getItem('streamgoal_favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((fav: string) => fav !== match.id);
      localStorage.setItem('streamgoal_favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      
      toast({
        title: "Removed from favorites",
        description: `${match.team_a?.name} vs ${match.team_b?.name} removed from your favorites`,
      });
    } else {
      // Add to favorites
      favorites.push(match.id);
      localStorage.setItem('streamgoal_favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      
      toast({
        title: "Added to favorites",
        description: `${match.team_a?.name} vs ${match.team_b?.name} added to your favorites`,
      });
    }
  };
  
  return (
    <button
      onClick={toggleFavorite}
      className={`absolute top-3 left-3 p-1.5 rounded-full transition-colors ${
        isFavorite 
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300'
      }`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}