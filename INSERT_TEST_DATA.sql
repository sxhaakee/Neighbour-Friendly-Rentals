-- Insert Test Properties
-- Run this in Supabase SQL Editor after migration

-- Get a user ID (replace with your actual user ID)
-- You can find your user ID by running: SELECT id FROM auth.users LIMIT 1;

-- Test Property 1: 2 BHK Flat in Koramangala, Bangalore
INSERT INTO properties (
  type, title, description, address, city, state, pincode, locality,
  rent_amount, deposit_amount, maintenance_charges, negotiable,
  bedrooms, bathrooms, balconies, area_sqft, floor_number, total_floors, age_years,
  furnishing, amenities, preferred_tenants, pets_allowed, non_veg_allowed,
  images, owner_id, owner_name, owner_phone, owner_email,
  available_from, lease_duration, minimum_stay_months, status
) VALUES (
  'flat',
  '2 BHK Flat in Koramangala',
  'Beautiful 2 BHK flat with modern amenities in the heart of Koramangala. Close to restaurants, cafes, and tech parks. Perfect for working professionals.',
  '123 Main Street, 5th Block',
  'Bangalore',
  'Karnataka',
  '560034',
  'Koramangala',
  25000,
  50000,
  2000,
  true,
  2,
  2,
  1,
  1200,
  3,
  10,
  5,
  'semi-furnished',
  ARRAY['Parking', 'Lift', 'Power Backup', 'Security', 'WiFi', 'Water Supply'],
  ARRAY['Family', 'Bachelor', 'Company'],
  false,
  true,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  (SELECT id FROM auth.users LIMIT 1),
  'Rajesh Kumar',
  '9876543210',
  'rajesh@example.com',
  CURRENT_DATE + INTERVAL '7 days',
  '11-months',
  11,
  'approved'
);

-- Test Property 2: 3 BHK House in Indiranagar
INSERT INTO properties (
  type, title, description, address, city, state, pincode, locality,
  rent_amount, deposit_amount, maintenance_charges, negotiable,
  bedrooms, bathrooms, balconies, area_sqft, age_years,
  furnishing, amenities, preferred_tenants, pets_allowed, non_veg_allowed,
  images, owner_id, owner_name, owner_phone, owner_email,
  available_from, lease_duration, minimum_stay_months, status
) VALUES (
  'house',
  '3 BHK Independent House in Indiranagar',
  'Spacious independent house with garden. Family-friendly neighborhood with schools and parks nearby.',
  '456 Garden Road',
  'Bangalore',
  'Karnataka',
  '560038',
  'Indiranagar',
  45000,
  90000,
  3000,
  false,
  3,
  3,
  2,
  1800,
  3,
  'furnished',
  ARRAY['Parking', 'Garden', 'Security', 'Power Backup', 'Water Supply', 'Gas Pipeline'],
  ARRAY['Family'],
  true,
  true,
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
  (SELECT id FROM auth.users LIMIT 1),
  'Priya Sharma',
  '9876543211',
  'priya@example.com',
  CURRENT_DATE,
  '1-year',
  12,
  'approved'
);

-- Test Property 3: PG in Whitefield
INSERT INTO properties (
  type, title, description, address, city, state, pincode, locality,
  rent_amount, deposit_amount, negotiable,
  bedrooms, bathrooms, area_sqft,
  furnishing, amenities, preferred_tenants, pets_allowed, non_veg_allowed,
  images, owner_id, owner_name, owner_phone, owner_email,
  available_from, lease_duration, minimum_stay_months, status
) VALUES (
  'pg',
  'PG for Working Professionals in Whitefield',
  'Comfortable PG accommodation with all meals included. AC rooms, WiFi, and laundry services available.',
  '789 Tech Park Road',
  'Bangalore',
  'Karnataka',
  '560066',
  'Whitefield',
  12000,
  12000,
  true,
  1,
  1,
  150,
  'furnished',
  ARRAY['WiFi', 'Power Backup', 'Security', 'Laundry', 'Meals Included'],
  ARRAY['Bachelor', 'Students', 'Company'],
  false,
  false,
  ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
  (SELECT id FROM auth.users LIMIT 1),
  'Suresh Reddy',
  '9876543212',
  'suresh@example.com',
  CURRENT_DATE,
  'flexible',
  1,
  'approved'
);

-- Test Property 4: Commercial Office Space
INSERT INTO properties (
  type, title, description, address, city, state, pincode, locality,
  rent_amount, deposit_amount, maintenance_charges, negotiable,
  bathrooms, area_sqft, floor_number, total_floors, age_years,
  furnishing, amenities, preferred_tenants,
  images, owner_id, owner_name, owner_phone, owner_email,
  available_from, lease_duration, minimum_stay_months, status
) VALUES (
  'office',
  'Commercial Office Space in MG Road',
  'Prime office space in MG Road. Ideal for startups and small businesses. Ready to move in.',
  '101 Business Tower, MG Road',
  'Bangalore',
  'Karnataka',
  '560001',
  'MG Road',
  80000,
  160000,
  5000,
  true,
  2,
  2000,
  5,
  15,
  2,
  'semi-furnished',
  ARRAY['Parking', 'Lift', 'Power Backup', 'Security', 'WiFi', 'Conference Room'],
  ARRAY['Company'],
  ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'],
  (SELECT id FROM auth.users LIMIT 1),
  'Amit Patel',
  '9876543213',
  'amit@example.com',
  CURRENT_DATE + INTERVAL '15 days',
  '2-years',
  24,
  'approved'
);

-- Test Property 5: Villa in HSR Layout
INSERT INTO properties (
  type, title, description, address, city, state, pincode, locality,
  rent_amount, deposit_amount, maintenance_charges, negotiable,
  bedrooms, bathrooms, balconies, area_sqft, age_years,
  furnishing, amenities, preferred_tenants, pets_allowed, non_veg_allowed,
  images, owner_id, owner_name, owner_phone, owner_email,
  available_from, lease_duration, minimum_stay_months, status, featured
) VALUES (
  'villa',
  'Luxury 4 BHK Villa in HSR Layout',
  'Premium villa with private pool and garden. Gated community with 24/7 security. Perfect for families looking for luxury living.',
  '234 Villa Street, Sector 2',
  'Bangalore',
  'Karnataka',
  '560102',
  'HSR Layout',
  85000,
  170000,
  5000,
  false,
  4,
  4,
  3,
  3000,
  1,
  'furnished',
  ARRAY['Parking', 'Swimming Pool', 'Garden', 'Gym', 'Security', 'Power Backup', 'Club House', 'Play Area'],
  ARRAY['Family'],
  true,
  true,
  ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  (SELECT id FROM auth.users LIMIT 1),
  'Deepa Iyer',
  '9876543214',
  'deepa@example.com',
  CURRENT_DATE + INTERVAL '30 days',
  '1-year',
  12,
  'approved',
  true
);

-- Verify insertion
SELECT 
  id,
  type,
  title,
  city,
  rent_amount,
  status,
  featured
FROM properties
ORDER BY created_at DESC
LIMIT 10;

-- Success message
SELECT '✅ Test data inserted successfully! Visit /properties to see them.' as message;
