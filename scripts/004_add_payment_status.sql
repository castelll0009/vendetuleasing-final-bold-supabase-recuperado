-- Migration: Add payment status fields for BOLD integration
-- This migration adds fields to control property publication and featured status

-- Create enum for property publication status
DO $$ BEGIN
    CREATE TYPE property_publication_status AS ENUM ('pending_payment', 'published', 'expired', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add publication_status column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS publication_status property_publication_status DEFAULT 'pending_payment';

-- Add is_featured_paid column to control paid featured properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_featured_paid BOOLEAN DEFAULT FALSE;

-- Add featured_until column to control featured expiration
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;

-- Add payment_reference column to store BOLD payment reference
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add featured_payment_reference column for featured payment
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS featured_payment_reference TEXT;

-- Create payments table to track all BOLD payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('publication', 'featured')),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'COP',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  bold_reference TEXT,
  bold_transaction_id TEXT,
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update payments" ON public.payments FOR UPDATE USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_publication_status ON public.properties(publication_status);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured_paid ON public.properties(is_featured_paid);
CREATE INDEX IF NOT EXISTS idx_properties_featured_until ON public.properties(featured_until);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_bold_reference ON public.payments(bold_reference);

-- Update existing properties to 'published' status (for backward compatibility)
UPDATE public.properties SET publication_status = 'published' WHERE publication_status IS NULL;

-- Function to check and expire featured properties
CREATE OR REPLACE FUNCTION check_featured_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.featured_until IS NOT NULL AND NEW.featured_until < NOW() THEN
    NEW.is_featured_paid := FALSE;
    NEW.featured := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-expire featured properties
DROP TRIGGER IF EXISTS trigger_check_featured_expiration ON public.properties;
CREATE TRIGGER trigger_check_featured_expiration
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION check_featured_expiration();
