import { Leaf, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRODUCT_LINKS = [
  { to: '/scan', label: 'AI Scanner' },
  { to: '/learn', label: 'Learn Hub' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/history', label: 'Scan History' },
];

const RESOURCE_LINKS = [
  { href: 'https://sdgs.un.org/goals/goal12', label: 'UN SDG 12' },
  { href: 'https://www.epa.gov/warm', label: 'EPA WARM v16' },
  { href: 'https://wrap.org.uk', label: 'WRAP 2020' },
  { href: 'https://www.ipcc.ch/ar6/', label: 'IPCC AR6' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-eco-green-400 font-bold text-lg">
              <Leaf className="w-5 h-5" />
              EcoSort AI
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI-powered waste classification and sustainable disposal guidance.
              Built for people who care about the planet.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-eco-green-900/40 border border-eco-green-700 text-xs font-semibold text-eco-green-400">
              🌱 SDG 12 · Responsible Consumption &amp; Production
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-eco-green-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Data Sources</h4>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-eco-green-400 transition-colors"
                  >
                    {label}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get started */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Get Started</h4>
            <p className="text-sm text-gray-400">
              Free to use. No credit card required. Open source under MIT.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-eco-green-600 hover:bg-eco-green-700 text-white text-sm font-semibold rounded-xl text-center transition-colors"
              >
                Create free account
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-sm font-medium rounded-xl text-center transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} EcoSort AI — Built for AI for Sustainability · MIT License
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a
              href="https://sdgs.un.org/goals/goal12"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-eco-green-400 transition-colors"
            >
              UN SDG 12
            </a>
            <span>·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-eco-green-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
