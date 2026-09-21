import { Outlet } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { Footer } from './Footer';

/** Public layout — shown on the marketing home page (no auth required). */
export function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
