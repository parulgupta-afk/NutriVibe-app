import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiCamera, FiHome, FiUser, FiUsers, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      {user ? (
        <>
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
            onClick={() => setIsMenuOpen(false)}
          >
            <FiHome className="text-lg" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/scanner"
            className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
            onClick={() => setIsMenuOpen(false)}
          >
            <FiCamera className="text-lg" />
            <span>Scan</span>
          </Link>
          <Link
            to="/profiles"
            className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
            onClick={() => setIsMenuOpen(false)}
          >
            <FiUsers className="text-lg" />
            <span>Profiles</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <FiLogOut className="text-lg" />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-gray-600 hover:text-primary-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
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
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-primary-600">NutriVibe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-primary-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 flex flex-col gap-4">
            <NavLinks />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;