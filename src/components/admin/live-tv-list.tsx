
import React from 'react';
import { LiveTV } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Tv } from 'lucide-react';

interface LiveTVListProps {
  tvChannels: LiveTV[];
  onEdit: (tv: LiveTV) => void;
  onDelete: (tv: LiveTV) => void;
}

export function LiveTVList({ tvChannels, onEdit, onDelete }: LiveTVListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-left">
            <th className="p-3 text-sm font-medium">Channel</th>
            <th className="p-3 text-sm font-medium">Category</th>
            <th className="p-3 text-sm font-medium">Country</th>
            <th className="p-3 text-sm font-medium">Language</th>
            <th className="p-3 text-sm font-medium">Status</th>
            <th className="p-3 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tvChannels.map((tv) => (
            <tr key={tv.id} className="border-t border-gray-800 hover:bg-gray-800/50">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  {tv.logo ? (
                    <img src={tv.logo} alt={tv.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <Tv className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{tv.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">
                      {tv.stream_url}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-3 text-sm">{tv.category}</td>
              <td className="p-3 text-sm">{tv.country || '-'}</td>
              <td className="p-3 text-sm">{tv.language || '-'}</td>
              <td className="p-3">
                {tv.is_premium ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-900/40 text-purple-300">
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-300">
                    Free
                  </span>
                )}
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(tv)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(tv)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          
          {tvChannels.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-400">
                No TV channels found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}