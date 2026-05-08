# Ghostwriter

Carti-style lyric generator.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → Add New Project → import your repo
3. In Project Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
4. Hit Deploy

Done. The `/api/generate` function proxies requests to Anthropic so your key stays server-side.

## Local dev

```bash
npm install
npm run dev
```

For local API calls to work, create a `.env.local` file:
```
ANTHROPIC_API_KEY=your_key_here
```
Then run with Vercel CLI: `npx vercel dev`
