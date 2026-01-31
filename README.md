# WatchPoint Dashboard

Next.js frontend for the WatchPoint web monitoring service.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** for authentication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

3. Edit `.env.local` with your values:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) (use different port if backend runs on 3000)

## Project Structure

```
src/
âââ app/
â   âââ layout.tsx          # Root layout
â   âââ page.tsx            # Redirects to /dashboard
â   âââ globals.css         # Tailwind imports
â   âââ login/page.tsx      # Login page
â   âââ signup/page.tsx     # Signup page
â   âââ dashboard/page.tsx  # Main dashboard (protected)
â   âââ watches/
â       âââ new/page.tsx    # Create watch (protected)
â       âââ [id]/page.tsx   # Watch detail (protected)
âââ lib/
â   âââ supabaseClient.ts   # Supabase client
â   âââ api.ts              # API helper with auth
â   âââ types.ts            # TypeScript interfaces
â   âââ utils.ts            # Utility functions
```

## API Endpoints (Backend)

The dashboard consumes these authenticated endpoints:

- `GET /api/me` - Current user info
- `GET /api/watches` - List user's watches
- `POST /api/watches` - Create watch
- `GET /api/watches/:id` - Watch details + changes
- `POST /api/watches/:id/pause` - Pause watch
- `POST /api/watches/:id/resume` - Resume watch
- `DELETE /api/watches/:id` - Delete watch
- `GET /api/changes/recent` - Recent changes
- `POST /api/feedback/:changeId` - Submit feedback

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```
