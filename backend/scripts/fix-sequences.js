const postgres = require('postgres');
require('dotenv').config();

async function fixSequences() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('🔧 Fixing database sequences...');
    
    // Fix lawyer_profiles sequence
    const lawyerProfilesResult = await sql`
      SELECT setval('lawyer_profiles_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM lawyer_profiles))
    `;
    console.log('✅ Fixed lawyer_profiles sequence');
    
    // Fix cases sequence
    const casesResult = await sql`
      SELECT setval('cases_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM cases))
    `;
    console.log('✅ Fixed cases sequence');
    
    // Fix case_proposals sequence
    const caseProposalsResult = await sql`
      SELECT setval('case_proposals_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_proposals))
    `;
    console.log('✅ Fixed case_proposals sequence');
    
    // Fix case_documents sequence
    const caseDocumentsResult = await sql`
      SELECT setval('case_documents_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_documents))
    `;
    console.log('✅ Fixed case_documents sequence');
    
    // Fix case_messages sequence
    const caseMessagesResult = await sql`
      SELECT setval('case_messages_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_messages))
    `;
    console.log('✅ Fixed case_messages sequence');
    
    // Fix case_updates sequence
    const caseUpdatesResult = await sql`
      SELECT setval('case_updates_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM case_updates))
    `;
    console.log('✅ Fixed case_updates sequence');
    
    // Fix blog_posts sequence
    const blogPostsResult = await sql`
      SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM blog_posts))
    `;
    console.log('✅ Fixed blog_posts sequence');
    
    console.log('\n🎉 All sequences have been fixed!');
    
    // Verify sequences
    console.log('\n📊 Current sequence values:');
    const sequences = await sql`
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
        currval('blog_posts_id_seq') as current_sequence_value
    `;
    
    sequences.forEach(seq => {
      console.log(`  ${seq.table_name}: ${seq.current_sequence_value}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing sequences:', error);
  } finally {
    await sql.end();
  }
}

fixSequences();
