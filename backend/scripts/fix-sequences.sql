-- Fix auto-increment sequences for all tables
-- This script resets sequences that may have gotten out of sync

-- Fix lawyer_profiles sequence
SELECT setval('lawyer_profiles_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM lawyer_profiles));

-- Fix cases sequence
SELECT setval('cases_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM cases));

-- Fix case_proposals sequence
SELECT setval('case_proposals_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_proposals));

-- Fix case_documents sequence
SELECT setval('case_documents_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_documents));

-- Fix case_messages sequence
SELECT setval('case_messages_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_messages));

-- Fix case_updates sequence
SELECT setval('case_updates_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_updates));

-- Fix blog_posts sequence
SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM blog_posts));

-- Verify all sequences are correct
SELECT 
    'lawyer_profiles' as table_name,
    currval('lawyer_profiles_id_seq') as current_sequence_value
UNION ALL
SELECT 
    'cases' as table_name,
    currval('cases_id_seq') as current_sequence_value
UNION ALL
SELECT 
    'case_proposals' as table_name,
    currval('case_proposals_id_seq') as current_sequence_value
UNION ALL
SELECT 
    'case_documents' as table_name,
    currval('case_documents_id_seq') as current_sequence_value
UNION ALL
SELECT 
    'case_messages' as table_name,
    currval('case_messages_id_seq') as current_sequence_value
UNION ALL
SELECT 
    'case_updates' as table_name,
    currval('case_updates_id_seq') as current_sequence_value
UNION ALL
SELECT 
    'blog_posts' as table_name,
    currval('blog_posts_id_seq') as current_sequence_value;
