import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // -------------------------------------------------------------------------
  // signIn
  // -------------------------------------------------------------------------
  async function signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // -------------------------------------------------------------------------
  // signUp — creates the auth user then inserts a profiles row
  // -------------------------------------------------------------------------
  async function signUp(
    email: string,
    password: string,
    username: string,
  ): Promise<void> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Insert profile row if the user was created (not a re-confirmation case).
    // Profile insert failure is non-fatal — a duplicate key error happens when
    // Google OAuth already created the user row, so we silently ignore it.
    if (data.user) {
      await supabase
        .from('profiles')
        .insert({ id: data.user.id, username })
        .then(({ error: profileError }) => {
          if (profileError && !profileError.message.includes('duplicate')) {
            console.warn('[AuthContext] Profile insert warning:', profileError.message);
          }
        });
    }
  }

  // -------------------------------------------------------------------------
  // signOut
  // -------------------------------------------------------------------------
  async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
