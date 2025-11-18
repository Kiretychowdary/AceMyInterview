// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Use environment variables first, then fallback to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://exzesygjgprxiuqozjns.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4emVzeWdqZ3ByeGl1cW96am5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODY0MDksImV4cCI6MjA3NTg2MjQwOX0.OBHwFmZJ7flygpccRjgeMeqSSOqqByN18Yo23X3hEAI';

console.log('Supabase Config:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey,
  env: import.meta.env.MODE 
});

// Add error handling for network issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Re-enable auto refresh for better UX
    persistSession: true,
    detectSessionInUrl: true, // Enable to handle OAuth redirects
    flowType: 'pkce' // Use PKCE flow for better security
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

// Global flag to track if Supabase is working
export let isSupabaseWorking = true;

// Add connection test with better error handling
const testConnection = async () => {
  try {
    // Test connection using auth session (doesn't require any tables)
    const { data, error } = await supabase.auth.getSession();
    if (!error) {
      console.log('✅ Supabase connected successfully');
      isSupabaseWorking = true;
      return true;
    } else {
      throw error;
    }
  } catch (err) {
    console.warn('⚠️ Supabase connection failed:', err.message);
    isSupabaseWorking = false;
    return false;
  }
};

// Test connection on load (non-blocking)
testConnection();
