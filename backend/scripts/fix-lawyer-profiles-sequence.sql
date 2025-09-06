-- Fix the auto-increment sequence for lawyer_profiles table
-- This script resets the sequence to the next available ID

-- First, let's see what's in the table
SELECT id FROM lawyer_profiles ORDER BY id;

-- Get the maximum ID value
SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM lawyer_profiles;

-- Reset the sequence to the next available ID
SELECT setval('lawyer_profiles_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM lawyer_profiles));

-- Verify the sequence is correct
SELECT currval('lawyer_profiles_id_seq') as current_sequence_value;
