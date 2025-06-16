-- Movie Tracker Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Create initial database schema with users, lists, list_items, ratings, and watch_status tables

-- Users table: stores user profile information
-- Uses auth.uid() as primary key to integrate with Supabase Auth
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT username_length CHECK (length(username) >= 3 AND length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~* '^[A-Za-z0-9_-]+$')
);

-- Lists table: stores user-created watchlists
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT list_name_length CHECK (length(trim(name)) >= 1 AND length(name) <= 100),
  CONSTRAINT description_length CHECK (description IS NULL OR length(description) <= 500)
);

-- List items table: stores movies/TV shows in lists
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT positive_tmdb_id CHECK (tmdb_id > 0),
  CONSTRAINT notes_length CHECK (notes IS NULL OR length(notes) <= 1000),
  CONSTRAINT unique_item_per_list UNIQUE(list_id, tmdb_id, media_type)
);

-- Ratings table: stores user ratings and reviews
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_tmdb_id CHECK (tmdb_id > 0),
  CONSTRAINT review_length CHECK (review IS NULL OR length(review) <= 2000),
  CONSTRAINT unique_user_rating UNIQUE(user_id, tmdb_id, media_type)
);

-- Watch status table: tracks viewing progress and status
CREATE TABLE IF NOT EXISTS watch_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  status TEXT NOT NULL CHECK (status IN ('not_watched', 'currently_watching', 'watched', 'dropped', 'plan_to_watch')),
  progress JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_tmdb_id CHECK (tmdb_id > 0),
  CONSTRAINT unique_user_watch_status UNIQUE(user_id, tmdb_id, media_type),
  CONSTRAINT completed_after_started CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);

-- Create indexes for performance optimization
-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_status_user_id ON watch_status(user_id);

-- Frequently queried columns
CREATE INDEX IF NOT EXISTS idx_list_items_tmdb_id ON list_items(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_list_items_media_type ON list_items(media_type);
CREATE INDEX IF NOT EXISTS idx_ratings_tmdb_id ON ratings(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_ratings_media_type ON ratings(media_type);
CREATE INDEX IF NOT EXISTS idx_watch_status_tmdb_id ON watch_status(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watch_status_media_type ON watch_status(media_type);
CREATE INDEX IF NOT EXISTS idx_watch_status_status ON watch_status(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ratings_user_rating ON ratings(user_id, rating);
CREATE INDEX IF NOT EXISTS idx_watch_status_user_status ON watch_status(user_id, status);
CREATE INDEX IF NOT EXISTS idx_list_items_tmdb_media ON list_items(tmdb_id, media_type);

-- Timestamp indexes for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_lists_created_at ON lists(created_at);
CREATE INDEX IF NOT EXISTS idx_list_items_added_at ON list_items(added_at);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_watch_status_updated_at ON watch_status(updated_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Lists table policies
CREATE POLICY "Users can view their own lists" ON lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public lists" ON lists
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own lists" ON lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON lists
  FOR DELETE USING (auth.uid() = user_id);

-- List items table policies
CREATE POLICY "Users can view list items from their lists or public lists" ON list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_items.list_id 
      AND (lists.user_id = auth.uid() OR lists.is_public = true)
    )
  );

CREATE POLICY "Users can manage items in their own lists" ON list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lists 
      WHERE lists.id = list_items.list_id 
      AND lists.user_id = auth.uid()
    )
  );

-- Ratings table policies
CREATE POLICY "Users can view all ratings" ON ratings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own ratings" ON ratings
  FOR ALL USING (auth.uid() = user_id);

-- Watch status table policies
CREATE POLICY "Users can view their own watch status" ON watch_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watch status" ON watch_status
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_status_updated_at BEFORE UPDATE ON watch_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 