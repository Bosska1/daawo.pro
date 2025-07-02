
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  isLive: boolean;
}

const TVPage: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate fetching channels from an API
    const fetchChannels = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockChannels: Channel[] = [
          {
            id: '1',
            name: 'Asal Drama',
            logo: '🇸🇴',
            category: 'Entertainment',
            country: 'Somalia',
            isLive: true
          },
          {
            id: '2',
            name: 'Sports Channel',
            logo: '🏆',
            category: 'Sports',
            country: 'International',
            isLive: true
          },
          {
            id: '3',
            name: 'News Network',
            logo: '📰',
            category: 'News',
            country: 'USA',
            isLive: false
          },
          {
            id: '4',
            name: 'Movie Channel',
            logo: '🎬',
            category: 'Movies',
            country: 'International',
            isLive: true
          },
          {
            id: '5',
            name: 'Kids Entertainment',
            logo: '👶',
            category: 'Kids',
            country: 'International',
            isLive: true
          },
          {
            id: '6',
            name: 'Music TV',
            logo: '🎵',
            category: 'Music',
            country: 'UK',
            isLive: true
          },
          {
            id: '7',
            name: 'Documentary Channel',
            logo: '🌍',
            category: 'Documentary',
            country: 'International',
            isLive: false
          },
          {
            id: '8',
            name: 'Comedy Central',
            logo: '😂',
            category: 'Entertainment',
            country: 'USA',
            isLive: true
          }
        ];

        setChannels(mockChannels);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching channels:', error);
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  // Get unique categories for filter
  const categories = ['All', ...new Set(channels.map(channel => channel.category))];

  // Filter channels based on category and search query
  const filteredChannels = channels.filter(channel => {
    const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">TV Channels</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading channels...</p>
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className="empty-state">
          <p>No channels found matching your criteria.</p>
        </div>
      ) : (
        <div className="channels-grid">
          {filteredChannels.map(channel => (
            <Link to={`/channel/${channel.id}`} key={channel.id} className="channel-card glass-card">
              <div className="channel-logo">{channel.logo}</div>
              <div className="channel-info">
                <h3 className="channel-name">{channel.name}</h3>
                <p className="channel-category">{channel.category} • {channel.country}</p>
              </div>
              {channel.isLive && (
                <div className="live-badge">
                  <span className="live-dot"></span>
                  LIVE
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TVPage;