import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { stories as demoStories } from '../data/stories';
import { decodeState, initialState, reducer, type Action } from '../domain/state';
import type { DemoState, Story } from '../domain/types';
import { loadCommunity, saveAction, type CommunitySnapshot } from '../lib/community';
import { friendlyError } from '../lib/errors';
import { requireSupabase } from '../lib/supabase';
import { c } from '../theme';
import { useAuth } from './AuthStore';

const KEY = 'rumorly:demo:v1';
interface StoreValue {
  state: DemoState; stories: Story[]; blockedNames: Record<string, string>;
  dispatch: (action: Action) => Promise<boolean>; ready: boolean; storageError: string | null;
  mode: 'demo' | 'live'; busy: boolean; refresh: () => Promise<void>;
}
const Store = createContext<StoreValue | null>(null);
export function AppStore({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.bg }}><ActivityIndicator accessibilityLabel="Restoring account" color={c.accent} /></View>;
  // Switching accounts unmounts all personal state and in-flight UI callbacks.
  return user ? <LiveStore key={user.id} userId={user.id}>{children}</LiveStore> : <DemoStore>{children}</DemoStore>;
}
function DemoStore({ children }: { children: React.ReactNode }) {
  const [state, localDispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then(raw => {
      if (active) localDispatch({ type: 'restore', state: decodeState(raw) });
    }).catch(() => { if (active) setStorageError('Device storage is unavailable. Changes may not survive a restart.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const snapshot = JSON.stringify(state);
    writeQueue.current = writeQueue.current.then(() => AsyncStorage.setItem(KEY, snapshot))
      .catch(() => setStorageError('Could not save changes on this device.'));
  }, [state, ready]);
  const dispatch = useCallback(async (action: Action) => { localDispatch(action); return true; }, []);
  return <Store.Provider value={{ state, dispatch, ready, storageError, stories: demoStories, blockedNames: {}, mode: 'demo', busy: false, refresh: async () => {} }}>{children}</Store.Provider>;
}
function LiveStore({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<CommunitySnapshot>({ state: { ...initialState, onboarded: true }, stories: [], blockedNames: {} });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const active = useRef(true);
  const working = useRef(false);
  const loaded = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const reload = useCallback(async () => {
    const next = await loadCommunity(requireSupabase(), userId);
    if (active.current) { setSnapshot(next); loaded.current = true; setStorageError(null); }
  }, [userId]);
  const refresh = useCallback(async () => {
    if (working.current) return;
    working.current = true; setBusy(true);
    try { await reload(); }
    catch (error) { if (active.current) setStorageError(friendlyError(error)); }
    finally { working.current = false; if (active.current) { setBusy(false); setReady(true); } }
  }, [reload]);
  useEffect(() => { void refresh(); }, [refresh]);
  const dispatch = useCallback(async (action: Action) => {
    if (working.current || !loaded.current) return false;
    working.current = true; setBusy(true); setStorageError(null);
    try {
      await saveAction(requireSupabase(), userId, snapshot.state, action);
      if (!active.current) return false;
      setSnapshot(previous => ({ ...previous, state: reducer(previous.state, action) }));
      try { await reload(); }
      catch { if (active.current) setStorageError('Your change was saved, but the latest feed could not load. Tap Refresh.'); }
      return true;
    } catch (error) { if (active.current) setStorageError(friendlyError(error)); return false; }
    finally { working.current = false; if (active.current) setBusy(false); }
  }, [reload, snapshot.state, userId]);
  return <Store.Provider value={{ ...snapshot, dispatch, ready, storageError, mode: 'live', busy, refresh }}>{children}</Store.Provider>;
}
export function useApp() {
  const store = useContext(Store);
  if (!store) throw new Error('AppStore is missing');
  return store;
}
