import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { decodeState, initialState, reducer, type Action } from '../domain/state';
import type { DemoState } from '../domain/types';

const KEY = 'rumorly:demo:v1';
const Store = createContext<{ state: DemoState; dispatch: React.Dispatch<Action>; ready: boolean; storageError: string | null } | null>(null);
export function AppStore({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then(raw => {
      if (active) dispatch({ type: 'restore', state: decodeState(raw) });
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
  return <Store.Provider value={{ state, dispatch, ready, storageError }}>{children}</Store.Provider>;
}
export function useApp() {
  const store = useContext(Store);
  if (!store) throw new Error('AppStore is missing');
  return store;
}
