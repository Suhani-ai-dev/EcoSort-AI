import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Leaf, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/** Minimal public navbar — shown on the landing page, no auth required. */
export function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-eco-green-700 dark:text-eco-green-400 font-bold text-xl"
          >
            <Leaf className="w-6 h-6" />
            EcoSort AI
          </NavLink>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <Link
              to="/scan"
              className="px-5 py-2 bg-eco-green-600 hover:bg-eco-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Open Scanner
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-2">
          <Link
            to="/scan"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold bg-eco-green-600 text-white hover:bg-eco-green-700 transition-colors text-center"
          >
            Open Scanner
          </Link>
        </div>
      )}
    </nav>
  );
}
