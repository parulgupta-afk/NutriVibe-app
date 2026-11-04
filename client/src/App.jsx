import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const HomeDashboard = lazy(() => import('./pages/HomeDashboard'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Product = lazy(() => import('./pages/Product'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Profiles = lazy(() => import('./pages/Profiles'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Hydration = lazy(() => import('./pages/Hydration'));
const VibeDiet = lazy(() => import('./pages/VibeDiet'));
const VibeAI = lazy(() => import('./pages/VibeAI'));
const Reactions = lazy(() => import('./pages/Reactions'));
const MealPhoto = lazy(() => import('./pages/MealPhoto'));
const ScanResultDemo = lazy(() => import('./pages/ScanResultDemo'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center bg-nv-bg" role="status">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nv-teal" />
    <span className="sr-only">Loading…</span>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nv-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nv-teal" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-nv-bg text-nv-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-nv-teal focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to main content
      </a>
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
            <Route path="/product/:barcode" element={<ProtectedRoute><Product /></ProtectedRoute>} />
            <Route path="/scan-result" element={<ProtectedRoute><ScanResultDemo /></ProtectedRoute>} />
            <Route path="/profiles" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/hydration" element={<ProtectedRoute><Hydration /></ProtectedRoute>} />
            <Route path="/vibe-diet" element={<ProtectedRoute><VibeDiet /></ProtectedRoute>} />
            <Route path="/vibe-ai" element={<ProtectedRoute><VibeAI /></ProtectedRoute>} />
            <Route path="/reactions" element={<ProtectedRoute><Reactions /></ProtectedRoute>} />
            <Route path="/meal-photo" element={<ProtectedRoute><MealPhoto /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
