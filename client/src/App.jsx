import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, MobileNav, PageHeader } from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Scanner from './pages/Scanner.jsx';
import VibeDiet from './pages/VibeDiet.jsx';
import Meals from './pages/Meals.jsx';
import Hydration from './pages/Hydration.jsx';
import Wellness from './pages/Wellness.jsx';
import VibeAI from './pages/VibeAI.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="mx-auto flex min-w-0 max-w-[1240px] flex-1 flex-col gap-7 px-5 pb-28 pt-8 md:px-12 md:pb-10 md:pt-9">
        <PageHeader />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/scanner" element={<Navigate to="/scan" replace />} />
          <Route path="/diet" element={<VibeDiet />} />
          <Route path="/vibe-diet" element={<Navigate to="/diet" replace />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/hydration" element={<Hydration />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/ai" element={<VibeAI />} />
          <Route path="/vibe-ai" element={<Navigate to="/ai" replace />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <p className="text-xs text-mute">
          NutriVibe explains and informs. It is not medical advice. Ask your clinician or pharmacist about medical decisions.
        </p>
      </main>
      <MobileNav />
    </div>
  );
}
