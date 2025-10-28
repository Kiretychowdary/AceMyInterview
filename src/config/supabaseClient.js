// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://exzesygjgprxiuqozjns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4emVzeWdqZ3ByeGl1cW96am5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODY0MDksImV4cCI6MjA3NTg2MjQwOX0.OBHwFmZJ7flygpccRjgeMeqSSOqqByN18Yo23X3hEAI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
