import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqjtywsreplknwrlvppj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxanR5d3NyZXBsa253cmx2cHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MzM4MzIsImV4cCI6MjA1MzEwOTgzMn0.S9C5OXH7sDIrFgSGENhkBo-NzPtxnajRzjHTVwBoDRk';

export const supabase = createClient(supabaseUrl, supabaseKey);
