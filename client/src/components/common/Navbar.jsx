import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiCamera, FiHome, FiUsers, FiLogOut, FiMenu, FiX, FiMoon, FiSun, FiHeart } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const linkClass =
    'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded';

  const NavLinks = () => (
    <>
      {user ? (
        <>
          <Link to="/dashboard" className={linkClass} onClick={() => setIsMenuOpen(false)}>
            <FiHome className="text-lg" aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
          <Link to="/scanner" className={linkClass} onClick={() => setIsMenuOpen(false)}>
            <FiCamera className="text-lg" aria-hidden="true" />
            <span>Scan</span>
          </Link>
          <Link to="/profiles" className={linkClass} onClick={() => setIsMenuOpen(false)}>
            <FiUsers className="text-lg" aria-hidden="true" />
            <span>Profiles</span>
          </Link>
          <Link to="/favorites" className={linkClass} onClick={() => setIsMenuOpen(false)}>
            <FiHeart className="text-lg" aria-hidden="true" />
            <span>Saved</span>
          </Link>
          <button type="button" onClick={handleLogout} className={linkClass}>
            <FiLogOut className="text-lg" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className={linkClass} onClick={() => setIsMenuOpen(false)}>
            Login
          </Link>
          <Link
            to="/register"
            className="btn-primary text-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      )}
      {/* Phase 12: theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className={linkClass}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <FiSun className="text-lg" aria-hidden="true" /> : <FiMoon className="text-lg" aria-hidden="true" />}
        <span className="md:hidden">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" aria-label="Main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">NutriVibe</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>

          <button
            type="button"
            className="md:hidden text-gray-600 dark:text-gray-300 hover:text-primary-600 p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <FiX className="text-2xl" aria-hidden="true" /> : <FiMenu className="text-2xl" aria-hidden="true" />}
          </button>
        </div>

        {isMenuOpen && (
          <div id="mobile-nav" className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4">
            <NavLinks />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
