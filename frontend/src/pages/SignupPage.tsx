import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';
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

export function SignupPage() {
  const { signUp } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    if (!username.trim()) return 'Username is required.';
    if (!email.trim()) return 'Email is required.';
    if (!isValidEmail(email)) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    const err = validate();
    if (err) { setFormError(err); return; }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, username.trim());
      setSuccess(true);
      toast.success('Account created! Check your email to confirm.');
    } catch (ex: unknown) {
      const msg = ex instanceof Error ? ex.message : 'Failed to create account. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-green-50 via-white to-eco-teal-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-eco-green-100 dark:bg-eco-green-900/30 flex items-center justify-center mx-auto">
            <Leaf className="w-8 h-8 text-eco-green-600 dark:text-eco-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check your email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            We've sent a confirmation link to <strong className="text-gray-700 dark:text-gray-200">{email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link
            to="/login"
            className="inline-block mt-2 px-6 py-2.5 bg-eco-green-600 hover:bg-eco-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-green-50 via-white to-eco-teal-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 text-eco-green-700 dark:text-eco-green-400 font-bold text-xl mb-8">
        <Leaf className="w-6 h-6" />
        EcoSort AI
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Join EcoSort AI — free forever</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {[
            { id: 'signup-username', label: 'Username', type: 'text', ac: 'username', val: username, set: setUsername, ph: 'ecowarrior42' },
            { id: 'signup-email', label: 'Email', type: 'email', ac: 'email', val: email, set: setEmail, ph: 'you@example.com' },
            { id: 'signup-password', label: 'Password', type: 'password', ac: 'new-password', val: password, set: setPassword, ph: 'At least 8 characters' },
            { id: 'signup-confirm', label: 'Confirm password', type: 'password', ac: 'new-password', val: confirmPassword, set: setConfirmPassword, ph: '••••••••' },
          ].map(({ id, label, type, ac, val, set, ph }) => (
            <div key={id} className="space-y-1">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
              <input
                id={id}
                type={type}
                autoComplete={ac}
                value={val}
                onChange={e => set(e.target.value)}
                disabled={submitting}
                placeholder={ph}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-eco-green-500 focus:border-transparent disabled:opacity-60 transition"
              />
            </div>
          ))}

          {formError && (
            <p role="alert" className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-eco-green-600 hover:bg-eco-green-700 text-white font-semibold rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Spinner />}
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-eco-green-600 dark:text-eco-green-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} EcoSort AI · MIT License
      </p>
    </div>
  );
}
