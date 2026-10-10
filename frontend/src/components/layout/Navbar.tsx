import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const NAV_LINKS = [
  { to: '/scan',        label: 'Scan' },
  { to: '/history',     label: 'History' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/learn',       label: 'Learn' },
  { to: '/profile',     label: 'Profile' },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/scan" className="flex items-center gap-2 text-eco-green-700 dark:text-eco-green-400 font-bold text-xl">
            <Leaf className="w-6 h-6" />
            EcoSort AI
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-eco-green-700 dark:text-eco-green-400 border-b-2 border-eco-green-600 pb-0.5'
                      : 'text-gray-600 dark:text-gray-300 hover:text-eco-green-600 dark:hover:text-eco-green-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-eco-green-50 dark:bg-eco-green-900/20 text-eco-green-700 dark:text-eco-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
