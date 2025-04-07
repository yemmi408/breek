/**
 * Safely get an environment variable
 * @param key The environment variable key
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function getEnv(key: keyof NodeJS.ProcessEnv): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

/**
 * Get Supabase URL from environment variables
 * @returns The Supabase URL
 */
export function getSupabaseUrl(): string {
  return getEnv('NEXT_PUBLIC_SUPABASE_URL');
}

/**
 * Get Supabase anon key from environment variables
 * @returns The Supabase anon key
 */
export function getSupabaseAnonKey(): string {
  return getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Check if we're in development mode
 * @returns True if in development mode
 */
export function isDevelopment(): boolean {
  return getEnv('NODE_ENV') === 'development';
}

/**
 * Check if we're in production mode
 * @returns True if in production mode
 */
export function isProduction(): boolean {
  return getEnv('NODE_ENV') === 'production';
} 