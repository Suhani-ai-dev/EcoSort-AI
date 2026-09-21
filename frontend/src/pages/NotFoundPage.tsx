import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <Leaf className="w-12 h-12 text-eco-green-400" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">404</h1>
      <p className="text-gray-500 dark:text-gray-400">Page not found.</p>
      <Link to="/scan" className="text-eco-green-600 hover:underline text-sm">Go back to Scan</Link>
    </div>
  );
}
