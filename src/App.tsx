
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home-page';
import { MatchesPage } from '@/pages/matches-page';
import { LiveTVsPage } from '@/pages/live-tvs-page';
import { FavoritesPage } from '@/pages/favorites-page';
import { AdminPage } from '@/pages/admin-page';
import { Header } from '@/components/header';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { Advertisement } from '@/components/advertisement';
import { WelcomePage } from '@/components/welcome-page';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Check if we should show the welcome page
    const shouldShowWelcome = localStorage.getItem('streamgoal_show_welcome') === 'true';
    if (shouldShowWelcome) {
      setShowWelcome(true);
      // Remove the flag so it doesn't show again
      localStorage.removeItem('streamgoal_show_welcome');
    }
    
    // Add iOS PWA class if running as standalone
    if (window.navigator.standalone) {
      document.documentElement.classList.add('ios-pwa');
    }
  }, []);
  
  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="*"
            element={
              <>
                <Header />
                <main className="flex-1 pt-2 pb-16">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/matches" element={<MatchesPage />} />
                    <Route path="/live" element={<MatchesPage />} />
                    <Route path="/tv" element={<LiveTVsPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    {/* Redirect old routes to the matches page */}
                    <Route path="/upcoming" element={<Navigate to="/matches" replace />} />
                    <Route path="/finished" element={<Navigate to="/matches" replace />} />
                  </Routes>
                </main>
                <Navbar />
                <Advertisement />
              </>
            }
          />
        </Routes>
        <Toaster />
        
        {/* Welcome page for first-time visitors */}
        {showWelcome && <WelcomePage onClose={handleCloseWelcome} />}
      </div>
    </Router>
  );
}

export default App;