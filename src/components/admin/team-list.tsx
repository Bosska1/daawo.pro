
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  country: string;
  flag: string;
  logo?: string;
}

interface TeamListProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export function TeamList({ teams, onEdit, onDelete }: TeamListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 text-left">
            <th className="p-3 text-sm font-medium">Team</th>
            <th className="p-3 text-sm font-medium">Country</th>
            <th className="p-3 text-sm font-medium">Flag</th>
            <th className="p-3 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} className="border-t border-gray-800 hover:bg-gray-800/50">
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-sm">{team.flag}</span>
                    </div>
                  )}
                  <div className="font-medium">{team.name}</div>
                </div>
              </td>
              <td className="p-3 text-sm">{team.country}</td>
              <td className="p-3 text-2xl">{team.flag}</td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(team)}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(team)}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          
          {teams.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-400">
                No teams found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}