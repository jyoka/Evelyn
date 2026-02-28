import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const DEFAULT_SOURCES = [
  {
    name: "openai-blog",
    type: "rss",
    label: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
  },
  {
    name: "anthropic-blog",
    type: "rss",
    label: "Anthropic Blog",
    url: "https://www.anthropic.com/rss.xml",
  },
  {
    name: "huggingface-blog",
    type: "rss",
    label: "HuggingFace Blog",
    url: "https://huggingface.co/blog/feed.xml",
  },
  {
    name: "google-ai-blog",
    type: "rss",
    label: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
  },
  {
    name: "mit-tech-review",
    type: "rss",
    label: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
  },
  {
    name: "hackernews",
    type: "api",
    label: "HackerNews",
    url: "https://hn.algolia.com/api/v1/search_by_date",
  },
  {
    name: "arxiv",
    type: "api",
    label: "ArXiv",
    url: "http://export.arxiv.org/api/query",
  },
];

function createPrisma(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrisma();

async function main() {
  for (const source of DEFAULT_SOURCES) {
    await prisma.source.upsert({
      where: { name: source.name },
      update: { label: source.label, url: source.url, type: source.type },
      create: source,
    });
  }
  console.log(`Seeded ${DEFAULT_SOURCES.length} sources`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
