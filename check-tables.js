// 실제 Supabase 테이블 구조 확인
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcvidhfhkidywdhmicje.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjdmlkaGZoa2lkeXdkaG1pY2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDM4MzUsImV4cCI6MjA3MTA3OTgzNX0.szhOEPg02IRm-mqhIBhLtgajTZjaC4twuVhRhw9nAnI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking actual table structure...');
  
  const tablesToCheck = [
    'teams',
    'team_members', 
    'team_memberships',
    'profiles',
    'notifications',
    'routines',
    'bills',
    'items'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': accessible, columns:`, data ? Object.keys(data[0] || {}) : 'empty');
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`);
    }
  }
  
  // 특별히 teams 테이블의 구조 확인
  try {
    console.log('\n🔍 Checking teams table relationships...');
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_memberships(*)
      `)
      .limit(1);
      
    if (error) {
      console.log('❌ teams with team_memberships:', error.message);
    } else {
      console.log('✅ teams with team_memberships: success');
    }
  } catch (err) {
    console.log('❌ teams relationship test failed:', err.message);
  }
  
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(*)
      `)
      .limit(1);
      
    if (error) {
      console.log('❌ teams with team_members:', error.message);
    } else {
      console.log('✅ teams with team_members: success');
    }
  } catch (err) {
    console.log('❌ teams with team_members test failed:', err.message);
  }
}

checkTables().then(() => {
  console.log('🎉 Table check completed');
});