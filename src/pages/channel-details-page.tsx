
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiveTVPlayer from '../components/live-tv-player';

interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  description: string;
  streamUrl: string;
  isLive: boolean;
}

const ChannelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching channel details from an API
    const fetchChannelDetails = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockChannels: Record<string, Channel> = {
          '1': {
            id: '1',
            name: 'Asal Drama',
            logo: '🇸🇴',
            category: 'Entertainment',
            country: 'Somalia',
            description: 'The premier entertainment channel featuring the best Somali dramas and shows.',
            streamUrl: 'https://yow.riix.link/asal/musalsal/',
            isLive: true
          },
          '2': {
            id: '2',
            name: 'Sports Channel',
            logo: '🏆',
            category: 'Sports',
            country: 'International',
            description: 'Watch live sports events from around the world, including football, basketball, and more.',
            streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
            isLive: true
          },
          '3': {
            id: '3',
            name: 'News Network',
            logo: '📰',
            category: 'News',
            country: 'USA',
            description: '24/7 coverage of breaking news and current events from around the world.',
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            isLive: false
          },
          '4': {
            id: '4',
            name: 'Movie Channel',
            logo: '🎬',
            category: 'Movies',
            country: 'International',
            description: 'The best movies from Hollywood and international cinema, streaming 24/7.',
            streamUrl: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
            isLive: true
          },
          '5': {
            id: '5',
            name: 'Kids Entertainment',
            logo: '👶',
            category: 'Kids',
            country: 'International',
            description: 'Family-friendly content for children of all ages, including cartoons and educational shows.',
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            isLive: true
          },
          '6': {
            id: '6',
            name: 'Music TV',
            logo: '🎵',
            category: 'Music',
            country: 'UK',
            description: 'The latest music videos, live performances, and music news from around the world.',
            streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
            isLive: true
          },
          '7': {
            id: '7',
            name: 'Documentary Channel',
            logo: '🌍',
            category: 'Documentary',
            country: 'International',
            description: 'Thought-provoking documentaries on nature, history, science, and culture.',
            streamUrl: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
            isLive: false
          },
          '8': {
            id: '8',
            name: 'Comedy Central',
            logo: '😂',
            category: 'Entertainment',
            country: 'USA',
            description: 'The best comedy shows, stand-up specials, and sitcoms to keep you laughing all day.',
            streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            isLive: true
          }
        };

        if (id && mockChannels[id]) {
          setChannel(mockChannels[id]);
        } else {
          setError('Channel not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching channel details:', error);
        setError('Failed to load channel details');
        setLoading(false);
      }
    };

    fetchChannelDetails();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading channel details...</p>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error || 'Channel not found'}</p>
        <button className="retry-button" onClick={handleBack}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="channel-details-container">
      <LiveTVPlayer 
        channelName={channel.name} 
        category={channel.category}
        country={channel.country}
        streamUrl={channel.streamUrl}
        isLive={channel.isLive}
      />
      
      <div className="channel-info-section">
        <div className="channel-header">
          <div className="channel-logo-large">{channel.logo}</div>
          <div className="channel-title-info">
            <h1 className="channel-title">{channel.name}</h1>
            <p className="channel-meta">{channel.category} • {channel.country}</p>
            {channel.isLive && (
              <div className="live-indicator">
                <span className="live-dot"></span>
                LIVE NOW
              </div>
            )}
          </div>
        </div>
        
        <div className="channel-description glass-card">
          <h2>About This Channel</h2>
          <p>{channel.description}</p>
        </div>
        
        <div className="channel-schedule glass-card">
          <h2>Today's Schedule</h2>
          <div className="schedule-item">
            <span className="schedule-time">08:00</span>
            <span className="schedule-title">Morning Show</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-time">10:00</span>
            <span className="schedule-title">News Update</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-time">12:00</span>
            <span className="schedule-title">Afternoon Special</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-time">15:00</span>
            <span className="schedule-title">Kids Hour</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-time">18:00</span>
            <span className="schedule-title">Evening News</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-time">20:00</span>
            <span className="schedule-title">Prime Time Show</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetailsPage;