-- Add subscription tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create a policy to allow users to read their own ensure status (already covered by existing policies, but good verifying)
-- No changes needed for RLS if "SELECT" policy is already "Give users access to own profile 1lh041u_0"

-- Comment for documentation
COMMENT ON COLUMN profiles.is_pro IS 'True if user has an active Pro subscription';
COMMENT ON COLUMN profiles.subscription_end_date IS 'The expiration date of the current subscription';
