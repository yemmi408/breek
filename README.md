# Social Media App with Supabase

This is a social media application built with React, TypeScript, and Supabase.

## Setup Instructions

1. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. Set up the database:
   - Go to the SQL editor in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Run the SQL commands to create the database schema

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Deploy to Vercel:
   - Push your code to GitHub
   - Import the project in Vercel
   - Add the environment variables in Vercel's project settings:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Features

- User authentication with Supabase Auth
- Create, read, update, and delete posts
- Like and comment on posts
- Follow other users
- Real-time updates
- Media uploads
- Responsive design

## Tech Stack

- React
- TypeScript
- Supabase (Auth, Database, Storage)
- Vite
- Tailwind CSS
- Vercel (Deployment)
