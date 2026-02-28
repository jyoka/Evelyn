import { createClient } from "@libsql/client";
import "dotenv/config";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Source_name_key" ON "Source"("name")`,

  `CREATE TABLE IF NOT EXISTS "Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "author" TEXT,
    "summary" TEXT,
    "category" TEXT,
    "relevance" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "sourceId" INTEGER NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "collectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "Article_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Article_externalId_key" ON "Article"("externalId")`,
  `CREATE INDEX IF NOT EXISTS "Article_category_idx" ON "Article"("category")`,
  `CREATE INDEX IF NOT EXISTS "Article_processed_idx" ON "Article"("processed")`,
  `CREATE INDEX IF NOT EXISTS "Article_relevance_idx" ON "Article"("relevance")`,
  `CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt")`,
  `CREATE INDEX IF NOT EXISTS "Article_sourceId_idx" ON "Article"("sourceId")`,

  `CREATE TABLE IF NOT EXISTS "Digest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "briefing" TEXT NOT NULL,
    "topInsights" TEXT NOT NULL,
    "trendingTopics" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Digest_date_key" ON "Digest"("date")`,
];

async function main() {
  console.log("Pushing schema to Turso...");
  console.log(`URL: ${process.env.TURSO_DATABASE_URL}`);

  for (const sql of statements) {
    const name = sql.match(/(?:TABLE|INDEX).*?"(\w+)"/)?.[1] || "unknown";
    try {
      await client.execute(sql);
      console.log(`  ✓ ${name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${name}: ${msg}`);
    }
  }

  console.log("\nVerifying tables...");
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(
    "Tables:",
    result.rows.map((r) => r.name)
  );

  console.log("Done!");
  client.close();
}

main().catch(console.error);
