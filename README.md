# Evelyn — AI Intelligence Dashboard

Your personal AI agent & trends newsletter. Evelyn automatically collects AI news from multiple sources, uses Claude AI to generate summaries and insights, and presents everything in a clean web dashboard.

## Features

- **Multi-source collection** — RSS feeds (OpenAI, Anthropic, HuggingFace, Google AI, MIT Tech Review), HackerNews API, ArXiv papers
- **AI-powered processing** — Claude summarizes articles, categorizes them, scores relevance, and extracts tags
- **Daily briefings** — AI-generated narrative digest of the day's most important AI news
- **Web dashboard** — Browse articles, filter by category/source/relevance, track trends
- **One-click refresh** — Click "Collect & Process" to fetch and analyze the latest content
- **PWA** — Install on iPhone/Android home screen, works like a native app

## Quick Start (Local)

```bash
# Install dependencies
npm install

# Set up your environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Initialize the database
npx prisma generate
npx prisma db push

# Seed default sources
npm run seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Collect & Process"** to fetch your first batch of AI news.

## Deploy to Vercel + Turso (Production)

### 1. Create a Turso database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up / log in
turso auth signup    # or: turso auth login

# Create a database
turso db create evelyn

# Get your connection URL
turso db show evelyn --url

# Create an auth token
turso db tokens create evelyn
```

### 2. Push schema to Turso

```bash
# Set Turso env vars locally
export TURSO_DATABASE_URL="libsql://evelyn-yourorg.turso.io"
export TURSO_AUTH_TOKEN="your-token"

# Push schema and seed
npx prisma db push
npm run seed
```

### 3. Deploy to Vercel

```bash
vercel

# Set environment variables in Vercel
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add ANTHROPIC_API_KEY

# Deploy to production
vercel --prod
```

### 4. Use on iPhone

1. Open your Vercel URL in Safari
2. Tap **Share** > **Add to Home Screen**
3. Tap **Add** — Evelyn is now a native-feeling app

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Local only | SQLite path for local dev (default: `file:./dev.db`) |
| `ANTHROPIC_API_KEY` | For AI features | Your Anthropic API key for Claude-powered summaries |
| `TURSO_DATABASE_URL` | Production | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token |

When `TURSO_DATABASE_URL` is set, Evelyn uses Turso. Otherwise it falls back to local SQLite — no code changes needed.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (local) / Turso (production) via Prisma 6
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **Data**: RSS Parser + HackerNews Algolia API + ArXiv API

## Pages

- `/` — Home: Daily briefing, top insights, trending topics
- `/feed` — Browse all articles with filters (category, source, relevance, search)
- `/trends` — Category distribution, source stats, trending tags
- `/sources` — View and manage configured data sources

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/collect` | POST | Collect articles from all sources |
| `/api/process` | POST | Run Claude AI on unprocessed articles |
| `/api/digest` | POST | Generate daily briefing digest |
| `/api/articles` | GET | Query articles with filters |
| `/api/trends` | GET | Get trend analytics |
