import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Forgot Password?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-200 mb-1">
              Check your email
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If an account exists for <strong>{email}</strong>, a reset link is
              on its way. The link expires in 10 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label-field">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Send Reset Link <FiArrowRight />
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
          >
            <FiArrowLeft /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
