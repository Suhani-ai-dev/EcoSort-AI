import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Layout } from './components/layout/Layout';
import { LandingLayout } from './components/layout/LandingLayout';
import HomePage from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LearnPage from './pages/LearnPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Public marketing home — wrapped in LandingLayout */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            {/* Public auth routes — no layout wrapper */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes — wrapped in Layout (Navbar + Footer) */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
