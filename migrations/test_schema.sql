-- Schema Validation Tests
-- File: test_schema.sql
-- Description: Test queries to validate the database schema works correctly
-- 
-- IMPORTANT: These are test queries only - DO NOT run in production!
-- Run these manually in Supabase SQL Editor after running 001_initial_schema.sql

-- =====================================================
-- 1. POSITIVE TESTS (Should succeed) (Run as one block)
-- =====================================================

-- Test user creation (use manual UUID for testing)
INSERT INTO users (id, email, username) VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'testuser');

-- Test list creation (use the same UUID)
INSERT INTO lists (user_id, name, description, is_public) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'My Watchlist', 'Movies I want to watch', false);

-- Test adding items to list
INSERT INTO list_items (list_id, tmdb_id, media_type, notes) 
VALUES (
  (SELECT id FROM lists WHERE name = 'My Watchlist'), 
  550, 
  'movie', 
  'Fight Club - heard it was great'
);

-- Test rating insertion
INSERT INTO ratings (user_id, tmdb_id, media_type, rating, review) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 550, 'movie', 5, 'Amazing movie!');

-- Test watch status tracking
INSERT INTO watch_status (user_id, tmdb_id, media_type, status) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 550, 'movie', 'watched');

-- =====================================================
-- 2. NEGATIVE TESTS (Should fail with constraint errors) (Run individually)
-- =====================================================

-- Test invalid email format (should FAIL)
INSERT INTO users (email, username) VALUES ('invalid-email', 'testuser2');

-- Test rating out of range (should FAIL)
INSERT INTO ratings (user_id, tmdb_id, media_type, rating) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 550, 'movie', 10);

-- Test invalid media type (should FAIL)
INSERT INTO list_items (list_id, tmdb_id, media_type) 
VALUES ((SELECT id FROM lists LIMIT 1), 550, 'invalid_type');

-- Test username too short (should FAIL)
INSERT INTO users (email, username) VALUES ('test2@example.com', 'ab');

-- =====================================================
-- 3. VERIFICATION QUERIES (Run as one block)
-- =====================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'lists', 'list_items', 'ratings', 'watch_status');

-- Check indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'lists', 'list_items', 'ratings', 'watch_status');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'lists', 'list_items', 'ratings', 'watch_status');

-- Verify foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema='public'
AND tc.table_name IN ('lists', 'list_items', 'ratings', 'watch_status');

-- =====================================================
-- 4. CLEANUP (Run after testing) (Run as one block)
-- =====================================================

-- Clean up test data
DELETE FROM watch_status WHERE tmdb_id = 550;
DELETE FROM ratings WHERE tmdb_id = 550;
DELETE FROM list_items WHERE tmdb_id = 550;
DELETE FROM lists WHERE name = 'My Watchlist';
DELETE FROM users WHERE email = 'test@example.com'; 