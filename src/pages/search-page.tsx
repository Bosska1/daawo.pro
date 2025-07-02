import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any[]>([]); // Replace 'any' with your actual result type

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
    // In a real app, you would fetch search results here
    // For now, we'll use mock data
    setResults([
      { id: '1', title: 'Football Match', type: 'event', category: 'Sports' },
      { id: '2', title: 'News Channel', type: 'channel', category: 'News' },
      { id: '3', title: 'Movie Premiere', type: 'event', category: 'Entertainment' },
    ]);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for matches, channels..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <div className="search-results">
        {results.length > 0 ? (
          results.map((item) => (
            <div key={item.id} className="search-result-item">
              <h3>{item.title}</h3>
              <p>{item.category} • {item.type}</p>
            </div>
          ))
        ) : (
          <p className="no-results">
            {query ? 'No results found' : 'Enter a search term'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
