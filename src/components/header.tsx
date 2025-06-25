
import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-gray-950 border-b border-gray-800 py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            StreamGoal
          </span>
        </Link>
        <div className="text-sm text-gray-400">
          Watch Live Football — Free & Fast!
        </div>
      </div>
    </header>
  );
}