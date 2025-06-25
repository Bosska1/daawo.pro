
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbipnfcokxaxfaylqacl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiaXBuZmNva3hheGZheWxxYWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTMyNjIsImV4cCI6MjA2NjM4OTI2Mn0.A2Gvnd4hFgAbjtiybrymsLHMtjYA_h4lbIc1BOEdtc0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Team = {
  id: string;
  name: string;
  country: string;
  flag: string;
  logo?: string;
};

export type Competition = {
  id: string;
  name: string;
  logo?: string;
};

export type Match = {
  id: string;
  team_a_id: string;
  team_b_id: string;
  competition_id: string;
  kickoff_time: string;
  status: 'live' | 'upcoming' | 'finished';
  score_team_a?: number;
  score_team_b?: number;
  stream_url?: string;
  highlights_url?: string;
  team_a?: Team;
  team_b?: Team;
  competition?: Competition;
};

export type LiveTV = {
  id: string;
  name: string;
  category: string;
  logo?: string;
  stream_url: string;
  is_premium: boolean;
  country?: string;
  language?: string;
};

export type AdminUser = {
  id: string;
  email: string;
};