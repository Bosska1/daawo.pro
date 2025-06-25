
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface Advertisement {
  id: string;
  name: string;
  type: string;
  content: string;
  target_page?: string;
  delay_seconds?: number;
  is_active: boolean;
  click_url?: string;
  impressions: number;
  clicks: number;
}

interface AdListProps {
  ads: Advertisement[];
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
  onToggleActive: (ad: Advertisement) => void;
}

export function AdList({ ads, onEdit, onDelete, onToggleActive }: AdListProps) {
  const getAdTypeLabel = (type: string) => {
    switch (type) {
      case 'popup':
        return <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs">Popup</span>;
      case 'banner':
        return <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded-full text-xs">Banner</span>;
      case 'video':
        return <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded-full text-xs">Video</span>;
      case 'interstitial':
        return <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs">Interstitial</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900/50 text-gray-300 rounded-full text-xs">{type}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-left">
            <th className="p-3 text-sm font-medium">Name</th>
            <th className="p-3 text-sm font-medium">Type</th>
            <th className="p-3 text-sm font-medium">Target</th>
            <th className="p-3 text-sm font-medium">Delay</th>
            <th className="p-3 text-sm font-medium">Status</th>
            <th className="p-3 text-sm font-medium">Stats</th>
            <th className="p-3 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad.id} className="border-t border-gray-800 hover:bg-gray-800/50">
              <td className="p-3">
                <div className="font-medium">{ad.name}</div>
                <div className="text-xs text-gray-400 truncate max-w-[200px]">
                  {ad.click_url && (
                    <a href={ad.click_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {ad.click_url}
                    </a>
                  )}
                </div>
              </td>
              <td className="p-3">{getAdTypeLabel(ad.type)}</td>
              <td className="p-3 text-sm">
                {ad.target_page ? ad.target_page : <span className="text-gray-500">All pages</span>}
              </td>
              <td className="p-3 text-sm">
                {ad.delay_seconds !== undefined ? `${ad.delay_seconds}s` : '-'}
              </td>
              <td className="p-3">
                {ad.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-300">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
                    Inactive
                  </span>
                )}
              </td>
              <td className="p-3 text-sm">
                <div className="flex flex-col">
                  <span>👁️ {ad.impressions} views</span>
                  <span>👆 {ad.clicks} clicks</span>
                  {ad.impressions > 0 && (
                    <span className="text-xs text-gray-400">
                      CTR: {((ad.clicks / ad.impressions) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onToggleActive(ad)}
                    title={ad.is_active ? "Deactivate" : "Activate"}
                  >
                    {ad.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(ad)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(ad)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          
          {ads.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-400">
                No advertisements found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}