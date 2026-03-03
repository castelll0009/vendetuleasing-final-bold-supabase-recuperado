const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function run() {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service role key defined:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabase.from('payments').select('*').limit(1);
    console.log('payments select result:', { error, data });
  } catch (e) {
    console.error('Exception querying payments table', e);
  }
}

run();
