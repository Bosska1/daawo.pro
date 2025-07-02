import React from 'react';
import { useParams } from 'react-router-dom';
import MatchStream from '../components/match-stream';

const MatchDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch match data based on the ID
  const mockMatch = {
    id: id || '1',
    title: 'Example Match',
    streamUrl: 'https://yow.riix.link/asal/films/',
    category: 'Football',
    country: 'International',
    isLive: true,
    teamA: 'Team A',
    teamB: 'Team B',
    teamAFlag: '🇺🇸',
    teamBFlag: '🇬🇧',
    scoreA: '2',
    scoreB: '1'
  };

  return (
    <div className="match-details-page">
      <MatchStream match={mockMatch} />
    </div>
  );
};

export default MatchDetailsPage;
