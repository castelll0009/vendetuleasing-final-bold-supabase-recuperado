-- ====================================================================
-- VENDE TU LEASING - Complete Database Backup
-- Real Estate Portal with Leasing System
-- Generated: 2024
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- ENUM TYPES
-- ====================================================================

CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'office', 'villa', 'townhome', 'bungalow', 'condo', 'land', 'commercial');
CREATE TYPE property_status AS ENUM ('for_sale', 'for_rent', 'sold', 'rented');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'property_payment', 'subscription');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- ====================================================================
-- TABLES
-- ====================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN public.profiles.id IS 'User ID from auth.users';
COMMENT ON COLUMN public.profiles.role IS 'User role: user, premium, or admin';

-- Wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

COMMENT ON TABLE public.wallets IS 'User digital wallets for transactions';
COMMENT ON COLUMN public.wallets.balance IS 'Current balance in COP (Colombian Pesos)';

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL,
  status property_status NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'Colombia',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  property_id_code TEXT UNIQUE,
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.properties IS 'Real estate properties for sale or rent';
COMMENT ON COLUMN public.properties.property_id_code IS 'Unique property identifier (RTD + 7 digits)';
COMMENT ON COLUMN public.properties.featured IS 'Featured properties appear first in listings';
COMMENT ON COLUMN public.properties.views IS 'Number of times property has been viewed';

-- Property images table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.property_images IS 'Images associated with properties';
COMMENT ON COLUMN public.property_images.is_primary IS 'Primary image is shown in property listings';

-- Property amenities table
CREATE TABLE IF NOT EXISTS public.property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.property_amenities IS 'Property features and amenities';

-- Price alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_type property_type,
  city TEXT,
  min_price DECIMAL(12, 2),
  max_price DECIMAL(12, 2),
  min_bedrooms INTEGER,
  max_bedrooms INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.price_alerts IS 'User alerts for property price changes';

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type transaction_type NOT NULL,
  transaction_status transaction_status DEFAULT 'pending',
  description TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS 'Wallet transactions including property payments';

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_code ON public.properties(property_id_code);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON public.property_images(property_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_property_amenities_property_id ON public.property_amenities(property_id);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON public.price_alerts(active);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON public.transactions(property_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Wallets policies
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
CREATE POLICY "Users can update own wallet" ON public.wallets 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallets;
CREATE POLICY "Users can insert own wallet" ON public.wallets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Properties policies
DROP POLICY IF EXISTS "Anyone can view published properties" ON public.properties;
CREATE POLICY "Anyone can view published properties" ON public.properties 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own properties" ON public.properties;
CREATE POLICY "Users can insert own properties" ON public.properties 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;
CREATE POLICY "Users can update own properties" ON public.properties 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own properties" ON public.properties;
CREATE POLICY "Users can delete own properties" ON public.properties 
  FOR DELETE USING (auth.uid() = user_id);

-- Property images policies
DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
CREATE POLICY "Anyone can view property images" ON public.property_images 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Property owners can manage images" ON public.property_images;
CREATE POLICY "Property owners can manage images" ON public.property_images 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_images.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Property amenities policies
DROP POLICY IF EXISTS "Anyone can view amenities" ON public.property_amenities;
CREATE POLICY "Anyone can view amenities" ON public.property_amenities 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Property owners can manage amenities" ON public.property_amenities;
CREATE POLICY "Property owners can manage amenities" ON public.property_amenities 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_amenities.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Price alerts policies
DROP POLICY IF EXISTS "Users can view own alerts" ON public.price_alerts;
CREATE POLICY "Users can view own alerts" ON public.price_alerts 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON public.price_alerts;
CREATE POLICY "Users can insert own alerts" ON public.price_alerts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.price_alerts;
CREATE POLICY "Users can update own alerts" ON public.price_alerts 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.price_alerts;
CREATE POLICY "Users can delete own alerts" ON public.price_alerts 
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- FUNCTIONS AND TRIGGERS
-- ====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_price_alerts_updated_at ON public.price_alerts;
CREATE TRIGGER update_price_alerts_updated_at 
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile and wallet on user signup
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'user'
  );

  -- Insert wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile/wallet for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger to create profile and wallet on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique property ID code
DROP FUNCTION IF EXISTS generate_property_id_code() CASCADE;
CREATE OR REPLACE FUNCTION generate_property_id_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.property_id_code IS NULL THEN
    NEW.property_id_code := 'RTD' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate property ID code
DROP TRIGGER IF EXISTS generate_property_code ON public.properties;
CREATE TRIGGER generate_property_code 
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION generate_property_id_code();

-- ====================================================================
-- SAMPLE DATA (Optional - for testing)
-- ====================================================================

-- Note: Uncomment the following section to insert sample data
-- This assumes you have created test users in Supabase Auth first

/*
-- Sample property data
INSERT INTO public.properties (user_id, title, description, property_type, status, price, bedrooms, bathrooms, square_feet, address, city, state, country, featured)
VALUES 
  ('YOUR-USER-UUID-HERE', 'Hermosa casa dentro de la ciudad', 'Casa moderna con amplio jardín y excelente ubicación', 'house', 'for_sale', 350000000, 4, 3, 220, 'Calle 15 #23-45', 'Popayán', 'Cauca', 'Colombia', true),
  ('YOUR-USER-UUID-HERE', 'Apartamento céntrico', 'Apartamento amoblado en zona residencial', 'apartment', 'for_rent', 1200000, 2, 2, 85, 'Carrera 5 #10-20', 'Bogotá', 'Cundinamarca', 'Colombia', false);

-- Sample property images
INSERT INTO public.property_images (property_id, image_url, is_primary)
VALUES 
  ((SELECT id FROM public.properties WHERE title = 'Hermosa casa dentro de la ciudad'), '/placeholder.svg?height=400&width=600', true);

-- Sample amenities
INSERT INTO public.property_amenities (property_id, amenity)
VALUES 
  ((SELECT id FROM public.properties WHERE title = 'Hermosa casa dentro de la ciudad'), 'Jardín'),
  ((SELECT id FROM public.properties WHERE title = 'Hermosa casa dentro de la ciudad'), 'Garaje'),
  ((SELECT id FROM public.properties WHERE title = 'Apartamento céntrico'), 'Aire acondicionado'),
  ((SELECT id FROM public.properties WHERE title = 'Apartamento céntrico'), 'Amoblado');
*/

-- ====================================================================
-- DATABASE CONFIGURATION RECOMMENDATIONS
-- ====================================================================

-- Enable real-time for specific tables (optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.property_images;

-- Set up storage buckets for property images (run in Supabase Dashboard)
-- 1. Create a bucket named "property-images"
-- 2. Set public access policies as needed

-- ====================================================================
-- MAINTENANCE QUERIES
-- ====================================================================

-- View all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

-- View all indexes
-- SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- ====================================================================
-- END OF BACKUP
-- ====================================================================
