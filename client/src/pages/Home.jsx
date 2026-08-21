import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiShield, FiZap, FiTrendingUp, FiHeart, FiCamera, FiDatabase } from 'react-icons/fi';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FiShield className="text-4xl text-primary-600" />,
      title: 'Allergen Safety First',
      description: 'Get an instant safety verdict before you see nutrition facts. Know what\'s safe for you.'
    },
    {
      icon: <FiZap className="text-4xl text-primary-600" />,
      title: '2-Second Verdict',
      description: 'Scan any barcode and get personalized allergen and safety information in under 2 seconds.'
    },
    {
      icon: <FiTrendingUp className="text-4xl text-primary-600" />,
      title: 'Smart Alternatives',
      description: 'Discover healthier alternatives that fit your dietary needs and health goals.'
    },
    {
      icon: <FiHeart className="text-4xl text-primary-600" />,
      title: 'Personalized Goals',
      description: 'Set health goals like weight loss, muscle gain, or diabetic-friendly nutrition tracking.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Scan First,
              <span className="text-primary-600"> Worry Never</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              NutriVibe turns any barcode into personalized food intelligence — 
              instantly telling you if a product is safe for you, before you see the nutrition label.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/scanner" className="btn-primary text-lg px-8 py-3">
                  Start Scanning
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FiCamera className="text-lg" />
              <span>Scan any product • Instant safety verdict • Personalized recommendations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Why Choose NutriVibe?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCamera className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Scan</h3>
              <p className="text-gray-600 dark:text-gray-300">Point your camera at any barcode or product label</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDatabase className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">2. Analyze</h3>
              <p className="text-gray-600 dark:text-gray-300">We cross-check ingredients against your profile</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">3. Decide</h3>
              <p className="text-gray-600">Get instant safety verdict and personalized insights</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;