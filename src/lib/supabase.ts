import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Enable only after the hosted email-code template and delivery are configured.
export const emailCodesReady = process.env.EXPO_PUBLIC_AUTH_EMAIL_CODES_READY === 'true';

// Missing configuration keeps the standalone fictional demo usable.
export const supabase = url && key ? createClient(url, key, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage, lock: processLock } : {}),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
}) : null;

export function requireSupabase() {
  if (!supabase) throw new Error('Account connection is not configured in this build.');
  return supabase;
}
