require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const SRIDHAR_ID = 'af88657d-3449-4c64-90ca-5d3808dc29a6';

async function testLogging() {
  console.log('=== Test 1: Insert a log ===');
  const { data: insertData, error: insertError } = await supabase
    .from('companion_daily_log')
    .upsert({
      client_id: SRIDHAR_ID,
      log_date: '2026-06-29',
      checked_item_ids: ['dp1', 'dp3', 's1', 'a2'],
      progress_percent: 40.0,
      total_items: 10,
      notes: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_id,log_date' })
    .select()
    .single();
  
  console.log('Insert data:', insertData);
  console.log('Insert error:', insertError);

  console.log('\n=== Test 2: Load the log back ===');
  const { data: loadData, error: loadError } = await supabase
    .from('companion_daily_log')
    .select('*')
    .eq('client_id', SRIDHAR_ID)
    .eq('log_date', '2026-06-29')
    .maybeSingle();
  
  console.log('Load data:', loadData);
  console.log('Load error:', loadError);

  console.log('\n=== Test 3: Upsert (update same date) ===');
  const { data: updateData, error: updateError } = await supabase
    .from('companion_daily_log')
    .upsert({
      client_id: SRIDHAR_ID,
      log_date: '2026-06-29',
      checked_item_ids: ['dp1', 'dp2', 'dp3', 's1', 's2', 'a1', 'a2'],
      progress_percent: 70.0,
      total_items: 10,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_id,log_date' })
    .select()
    .single();
  
  console.log('Update data:', updateData);
  console.log('Update error:', updateError);

  console.log('\n=== Test 4: Cleanup ===');
  const { error: delError } = await supabase
    .from('companion_daily_log')
    .delete()
    .eq('client_id', SRIDHAR_ID)
    .eq('log_date', '2026-06-29');
  console.log('Delete error:', delError);
}

testLogging();
