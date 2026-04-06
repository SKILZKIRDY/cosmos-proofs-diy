import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // Bookmarks
  bookmarkedIds: Set<string>;
  toggleBookmark: (evidenceId: string) => void;
  // Experiment progress
  completedExperiments: Set<string>;
  experimentNotes: Record<string, string>;
  toggleExperimentComplete: (experimentId: string) => void;
  updateExperimentNotes: (experimentId: string, notes: string) => void;
  // Stats
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// Helper to clear any legacy localStorage user data
function clearUserLocalStorage() {
  try {
    localStorage.removeItem('evidence-bookmarks');
    localStorage.removeItem('completed-experiments');
    localStorage.removeItem('experiment-notes');
  } catch {
    // Ignore errors if localStorage is not available
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Initialize all user-specific state to EMPTY — no localStorage reads
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set<string>());
  const [completedExperiments, setCompletedExperiments] = useState<Set<string>>(new Set<string>());
  const [experimentNotes, setExperimentNotes] = useState<Record<string, string>>({});

  // Track the current user ID to prevent stale data from previous sessions
  const currentUserIdRef = useRef<string | null>(null);

  // Clear all user-specific state (used on logout and when no user)
  const resetUserData = useCallback(() => {
    setBookmarkedIds(new Set<string>());
    setCompletedExperiments(new Set<string>());
    setExperimentNotes({});
    setSyncStatus('idle');
    clearUserLocalStorage();
  }, []);

  // Clear any legacy localStorage on mount (one-time cleanup)
  useEffect(() => {
    clearUserLocalStorage();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        // No user on initial load — ensure clean state
        resetUserData();
      }
      setLoading(false);
    }).catch(() => {
      resetUserData();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);

      // On sign out or token removal, immediately clear all user data
      if (event === 'SIGNED_OUT' || !s?.user) {
        currentUserIdRef.current = null;
        resetUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, [resetUserData]);

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (user) {
      // If user changed (different account), reset first
      if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
        resetUserData();
      }
      currentUserIdRef.current = user.id;
      loadUserDataFromSupabase(user.id);
    } else {
      // No user — ensure clean state
      currentUserIdRef.current = null;
      resetUserData();
    }
  }, [user]);

  // Load user data ONLY from Supabase (no local merge)
  const loadUserDataFromSupabase = async (userId: string) => {
    setSyncStatus('syncing');
    try {
      // Fetch bookmarks from Supabase
      const { data: bookmarks, error: bErr } = await supabase
        .from('user_bookmarks')
        .select('evidence_id')
        .eq('user_id', userId);

      // If the user changed while we were fetching, discard results
      if (currentUserIdRef.current !== userId) return;

      if (bErr) {
        // Table might not exist yet — that's okay, just use empty state
        console.warn('Could not fetch bookmarks:', bErr.message);
      }

      const remoteBookmarks = new Set<string>((bookmarks || []).map(b => b.evidence_id));
      setBookmarkedIds(remoteBookmarks);

      // Fetch experiment progress from Supabase
      const { data: progress, error: pErr } = await supabase
        .from('user_experiment_progress')
        .select('experiment_id, completed, notes')
        .eq('user_id', userId);

      // If the user changed while we were fetching, discard results
      if (currentUserIdRef.current !== userId) return;

      if (pErr) {
        console.warn('Could not fetch experiment progress:', pErr.message);
      }

      const remoteCompleted = new Set<string>(
        (progress || []).filter(p => p.completed).map(p => p.experiment_id)
      );
      setCompletedExperiments(remoteCompleted);

      const remoteNotes: Record<string, string> = {};
      (progress || []).forEach(p => {
        if (p.notes) remoteNotes[p.experiment_id] = p.notes;
      });
      setExperimentNotes(remoteNotes);

      setSyncStatus('synced');
    } catch (err) {
      console.error('Error loading user data from Supabase:', err);
      if (currentUserIdRef.current === userId) {
        setSyncStatus('error');
      }
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] }
      }
    });
    if (error) return { error: error.message };

    // Create profile
    if (data.user) {
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        display_name: displayName || email.split('@')[0],
      });
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Reset any stale data before signing in
    resetUserData();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    // Clear all user data FIRST, before signing out
    resetUserData();
    currentUserIdRef.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const toggleBookmark = useCallback(async (evidenceId: string) => {
    // Only allow bookmarking when logged in
    if (!user) return;

    setBookmarkedIds(prev => {
      const next = new Set(prev);
      const isAdding = !next.has(evidenceId);
      if (isAdding) {
        next.add(evidenceId);
      } else {
        next.delete(evidenceId);
      }

      // Sync to Supabase
      if (isAdding) {
        supabase.from('user_bookmarks').upsert(
          { user_id: user.id, evidence_id: evidenceId },
          { onConflict: 'user_id,evidence_id' }
        ).then(() => {});
      } else {
        supabase.from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('evidence_id', evidenceId)
          .then(() => {});
      }

      return next;
    });
  }, [user]);

  const toggleExperimentComplete = useCallback(async (experimentId: string) => {
    // Only allow when logged in
    if (!user) return;

    setCompletedExperiments(prev => {
      const next = new Set(prev);
      const isCompleting = !next.has(experimentId);
      if (isCompleting) {
        next.add(experimentId);
      } else {
        next.delete(experimentId);
      }

      // Sync to Supabase
      supabase.from('user_experiment_progress').upsert(
        {
          user_id: user.id,
          experiment_id: experimentId,
          completed: isCompleting,
          completed_at: isCompleting ? new Date().toISOString() : null,
          notes: experimentNotes[experimentId] || ''
        },
        { onConflict: 'user_id,experiment_id' }
      ).then(() => {});

      return next;
    });
  }, [user, experimentNotes]);

  const updateExperimentNotes = useCallback(async (experimentId: string, notes: string) => {
    // Only allow when logged in
    if (!user) return;

    setExperimentNotes(prev => {
      const next = { ...prev, [experimentId]: notes };

      // Sync to Supabase
      supabase.from('user_experiment_progress').upsert(
        {
          user_id: user.id,
          experiment_id: experimentId,
          completed: completedExperiments.has(experimentId),
          notes
        },
        { onConflict: 'user_id,experiment_id' }
      ).then(() => {});

      return next;
    });
  }, [user, completedExperiments]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      bookmarkedIds,
      toggleBookmark,
      completedExperiments,
      experimentNotes,
      toggleExperimentComplete,
      updateExperimentNotes,
      syncStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
