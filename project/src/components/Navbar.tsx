import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">Bug GPT</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                  Dashboard
                </Link>
                <Link to="/home" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/home')}`}>
                  Home
                </Link>
                <Link to="/scan" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/scan')}`}>
                  Scan Domain
                </Link>
                <Link to="/tools" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/tools')}`}>
                  Tools
                </Link>
                <Link to="/privacy" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/privacy')}`}>
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar