# Evelyn — AI Intelligence Dashboard

Your personal AI agent & trends newsletter. Evelyn automatically collects AI news from multiple sources, uses Claude AI to generate summaries and insights, and presents everything in a clean web dashboard.

## Features

- **Multi-source collection** — RSS feeds (OpenAI, Anthropic, HuggingFace, Google AI, MIT Tech Review), HackerNews API, ArXiv papers
- **AI-powered processing** — Claude summarizes articles, categorizes them, scores relevance, and extracts tags
- **Daily briefings** — AI-generated narrative digest of the day's most important AI news
- **Web dashboard** — Browse articles, filter by category/source/relevance, track trends
- **One-click refresh** — Click "Collect & Process" to fetch and analyze the latest content

## Quick Start

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path (default: `file:./dev.db`) |
| `ANTHROPIC_API_KEY` | For AI features | Your Anthropic API key for Claude-powered summaries |

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite via Prisma 6
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
