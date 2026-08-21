import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiCamera } from "react-icons/fi";

/**
 * Phase 10: real 404 page instead of silent redirect to home.
 */
const NotFound = () => (
  <div className="max-w-lg mx-auto px-4 py-20 text-center">
    <p className="text-6xl font-bold text-primary-600 mb-2" aria-hidden="true">
      404
    </p>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
      Page not found
    </h1>
    <p className="text-gray-600 dark:text-gray-300 mb-8">
      That link doesn&apos;t match any page in NutriVibe.
    </p>
    <div className="flex flex-wrap justify-center gap-3">
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <FiHome /> Home
      </Link>
      <Link
        to="/scanner"
        className="btn-secondary inline-flex items-center gap-2"
      >
        <FiCamera /> Scanner
      </Link>
    </div>
  </div>
);

export default NotFound;
