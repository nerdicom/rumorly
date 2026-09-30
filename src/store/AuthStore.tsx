import type { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';

const Auth = createContext<{ user: User | null; ready: boolean; error: string | null; signOut: () => Promise<void> } | null>(null);
export function AuthStore({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    // INITIAL_SESSION is emitted after storage is restored; no competing getSession call.
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (active) { setUser(session?.user ?? null); setReady(true); setError(null); }
    });
    const appState = Platform.OS === 'web' ? null : AppState.addEventListener('change', state => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    if (Platform.OS !== 'web' && AppState.currentState === 'active') client.auth.startAutoRefresh();
    return () => { active = false; subscription.unsubscribe(); appState?.remove(); if (Platform.OS !== 'web') client.auth.stopAutoRefresh(); };
  }, []);
  const signOut = async () => {
    if (!supabase) return;
    const { error: problem } = await supabase.auth.signOut({ scope: 'local' });
    if (problem) { setError(friendlyError(problem)); return; }
    setUser(null);
  };
  return <Auth.Provider value={{ user, ready, error, signOut }}>{children}</Auth.Provider>;
}
export function useAuth() {
  const auth = useContext(Auth);
  if (!auth) throw new Error('AuthStore is missing');
  return auth;
}
