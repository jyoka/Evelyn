import { prisma } from "@/lib/db";

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  link: string;
}

function parseArxivXML(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const id = entry.match(/<id>(.*?)<\/id>/)?.[1] || "";
    const title = (entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "")
      .replace(/\s+/g, " ")
      .trim();
    const summary = (entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || "")
      .replace(/\s+/g, " ")
      .trim();
    const published =
      entry.match(/<published>(.*?)<\/published>/)?.[1] || "";

    const authors: string[] = [];
    const authorRegex = /<author>\s*<name>(.*?)<\/name>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      authors.push(authorMatch[1]);
    }

    const linkMatch = entry.match(
      /<link[^>]+title="pdf"[^>]+href="([^"]+)"/
    );
    const link = linkMatch?.[1] || id;

    entries.push({ id, title, summary, authors, published, link });
  }

  return entries;
}

export async function collectArxiv(): Promise<{
  found: number;
  added: number;
}> {
  const source = await prisma.source.findUnique({
    where: { name: "arxiv" },
  });
  if (!source || !source.enabled) return { found: 0, added: 0 };

  const query =
    "cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=30";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://export.arxiv.org/api/query?search_query=${query}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return { found: 0, added: 0 };

    const xml = await res.text();
    const entries = parseArxivXML(xml);

    let added = 0;
    for (const entry of entries) {
      const arxivId = entry.id.split("/abs/").pop() || entry.id;
      try {
        await prisma.article.create({
          data: {
            externalId: `arxiv:${arxivId}`,
            title: entry.title,
            url: entry.id,
            content: entry.summary,
            author: entry.authors.slice(0, 3).join(", "),
            sourceId: source.id,
            publishedAt: new Date(entry.published),
          },
        });
        added++;
      } catch {
        // Duplicate — skip
      }
    }

    return { found: entries.length, added };
  } catch (err) {
    console.error("ArXiv collect failed:", err);
    return { found: 0, added: 0 };
  }
}
