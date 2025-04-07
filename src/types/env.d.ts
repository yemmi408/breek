declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    
    // Optional: Add other environment variables as needed
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 