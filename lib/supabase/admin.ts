import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase admin client using the service role key.
 * This bypasses RLS and should ONLY be used in server-side API routes
 * (webhooks, cron jobs, etc.) where there is no user session.
 */
export function createAdminClient() {
  // allow either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL (some env setups use one or the other)
  const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabaseUrl = rawUrl ? String(rawUrl).replace(/^\"|\"$/g, "") : undefined
  const serviceRoleKey = rawKey ? String(rawKey).replace(/^\"|\"$/g, "") : undefined

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY environment variables."
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
