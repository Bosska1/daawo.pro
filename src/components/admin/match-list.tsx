
import React from 'react';
import { Match } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime } from '@/lib/utils';
import { Edit, Trash2, Play, Clock, CheckCircle } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
}

export function MatchList({ matches, onEdit, onDelete }: MatchListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Play className="h-4 w-4 text-red-500" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'finished':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-left">
            <th className="p-3 text-sm font-medium">Teams</th>
            <th className="p-3 text-sm font-medium">Competition</th>
            <th className="p-3 text-sm font-medium">Date & Time</th>
            <th className="p-3 text-sm font-medium">Status</th>
            <th className="p-3 text-sm font-medium">Score</th>
            <th className="p-3 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id} className="border-t border-gray-800 hover:bg-gray-800/50">
              <td className="p-3">
                <div className="flex items-center space-x-1">
                  <span>{match.team_a?.name}</span>
                  <span className="text-sm">{match.team_a?.flag}</span>
                  <span className="text-gray-400 mx-1">vs</span>
                  <span className="text-sm">{match.team_b?.flag}</span>
                  <span>{match.team_b?.name}</span>
                </div>
              </td>
              <td className="p-3 text-sm">{match.competition?.name}</td>
              <td className="p-3 text-sm">
                {formatDate(match.kickoff_time)}<br />
                {formatTime(match.kickoff_time)}
              </td>
              <td className="p-3">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(match.status)}
                  <span className="text-sm capitalize">{match.status}</span>
                </div>
              </td>
              <td className="p-3 text-sm">
                {match.status !== 'upcoming' ? (
                  <span>
                    {match.score_team_a} - {match.score_team_b}
                  </span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(match)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(match)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          
          {matches.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-400">
                No matches found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}