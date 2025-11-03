import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addPricingModelColumn() {
  console.log('Adding pricing_model column to listings table...');

  try {
    // Execute the SQL to add the column
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add pricing_model column to listings table
        ALTER TABLE listings 
        ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_day' 
        CHECK (pricing_model IN ('per_day', 'per_week', 'per_month', 'per_event', 'per_hour'));

        -- Update existing listings to have default pricing_model
        UPDATE listings 
        SET pricing_model = 'per_day' 
        WHERE pricing_model IS NULL;
      `
    });

    if (error) {
      console.error('Error adding column:', error);
      
      // Try alternative approach using direct SQL
      console.log('Trying alternative approach...');
      const { error: altError } = await supabase
        .from('listings')
        .select('id')
        .limit(1);
      
      if (altError) {
        console.error('Database connection error:', altError);
      } else {
        console.log('✅ Database connection successful');
        console.log('⚠️  Please run the migration manually in Supabase SQL Editor:');
        console.log(`
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_day' 
CHECK (pricing_model IN ('per_day', 'per_week', 'per_month', 'per_event', 'per_hour'));

UPDATE listings 
SET pricing_model = 'per_day' 
WHERE pricing_model IS NULL;
        `);
      }
    } else {
      console.log('✅ Successfully added pricing_model column!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:');
    console.log(`
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_day' 
CHECK (pricing_model IN ('per_day', 'per_week', 'per_month', 'per_event', 'per_hour'));

UPDATE listings 
SET pricing_model = 'per_day' 
WHERE pricing_model IS NULL;
    `);
  }
}

addPricingModelColumn();
