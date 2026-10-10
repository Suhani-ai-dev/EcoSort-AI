import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import { LandingLayout } from './components/layout/LandingLayout';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LearnPage from './pages/LearnPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Main dashboard entry point */}
          <Route path="/" element={<Navigate to="/scan" replace />} />

          {/* About / project story landing page */}
          <Route element={<LandingLayout />}>
            <Route path="/about" element={<HomePage />} />
          </Route>

          {/* Core app routes — wrapped in Layout (Navbar + Footer) */}
          <Route element={<Layout />}>
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Legacy auth redirects directly to scanner */}
          <Route path="/login" element={<Navigate to="/scan" replace />} />
          <Route path="/signup" element={<Navigate to="/scan" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
