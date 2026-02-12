-- Run this in Supabase Dashboard → SQL Editor if profile updates (e.g. nickname) don't persist.
-- It enables RLS on profiles and adds policies so users can read/insert/update their own row.
--
-- If you get "policy already exists", first go to Table Editor → profiles → Policies,
-- delete the existing policies, then run this again.

-- Enable Row Level Security on profiles (if not already)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies with these names if re-running
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow anyone (including logged-out visitors) to read profiles (needed for public leaderboard)
CREATE POLICY "Anyone can view all profiles"
  ON profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile (signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (edit nickname, etc.)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
