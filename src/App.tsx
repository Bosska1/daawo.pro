
import React from 'react';
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
import './App.css';

function App() {
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
                    <Route path="/upcoming" element={<MatchesPage />} />
                    <Route path="/finished" element={<MatchesPage />} />
                    <Route path="/tv" element={<LiveTVsPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    {/* Redirect old routes to the new unified matches page */}
                    <Route path="/matches/:status" element={<Navigate to="/matches" replace />} />
                  </Routes>
                </main>
                <Navbar />
                <Advertisement />
              </>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;