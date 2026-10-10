import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Leaf, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Translate raw Supabase error messages into friendly user-facing text
// ---------------------------------------------------------------------------
function friendlyError(raw: string): { message: string; isRateLimit: boolean } {
  const lower = raw.toLowerCase();

  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('email rate limit') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('for security purposes') ||
    lower.includes('rate_limit')
  ) {
    return {
      message: 'Too many attempts — please wait a minute before trying again.',
      isRateLimit: true,
    };
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return { message: 'Incorrect email or password. Please try again.', isRateLimit: false };
  }

  if (lower.includes('email not confirmed')) {
    return {
      message: 'Please check your inbox and confirm your email address first.',
      isRateLimit: false,
    };
  }

  if (lower.includes('user not found') || lower.includes('no user found')) {
    return { message: 'No account found with that email. Did you mean to sign up?', isRateLimit: false };
  }

  return { message: raw, isRateLimit: false };
}

// ---------------------------------------------------------------------------
// Error banner — different style for rate limit vs regular error
// ---------------------------------------------------------------------------
function ErrorBanner({ message, isRateLimit }: { message: string; isRateLimit: boolean }) {
  if (isRateLimit) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3"
      >
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-700 dark:text-amber-400">Rate limit reached</p>
          <p className="text-amber-600 dark:text-amber-500 mt-0.5">{message}</p>
          <p className="text-amber-500 dark:text-amber-600 mt-1 text-xs">
            Wait ~60 seconds then try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
    >
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!email.trim()) return 'Email is required.';
    if (!isValidEmail(email)) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    return '';
  }

  function setError(raw: string) {
    const { message, isRateLimit: rl } = friendlyError(raw);
    setFormError(message);
    setIsRateLimit(rl);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setIsRateLimit(false);
    const err = validate();
    if (err) { setFormError(err); setIsRateLimit(false); return; }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate('/scan', { replace: true });
    } catch (ex: unknown) {
      const raw = ex instanceof Error ? ex.message : 'Failed to sign in. Please try again.';
      setError(raw);
      const { isRateLimit: rl } = friendlyError(raw);
      if (!rl) toast.error(friendlyError(raw).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-green-50 via-white to-eco-teal-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 text-eco-green-700 dark:text-eco-green-400 font-bold text-xl mb-8">
        <Leaf className="w-6 h-6" />
        EcoSort AI
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to your EcoSort AI account</p>
        </div>

        {/* Rate-limit error shown at top */}
        {formError && isRateLimit && (
          <ErrorBanner message={formError} isRateLimit={isRateLimit} />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFormError(''); setIsRateLimit(false); }}
              disabled={submitting}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent disabled:opacity-60 transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setFormError(''); setIsRateLimit(false); }}
              disabled={submitting}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent disabled:opacity-60 transition"
            />
          </div>

          {/* Non-rate-limit errors shown inside form */}
          {formError && !isRateLimit && (
            <ErrorBanner message={formError} isRateLimit={false} />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-eco-green-600 hover:bg-eco-green-700 text-white font-semibold rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Spinner />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-eco-green-600 dark:text-eco-green-400 font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} EcoSort AI · MIT License
      </p>
    </div>
  );
}
