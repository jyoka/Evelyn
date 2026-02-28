import { processUnprocessedArticles } from "@/lib/ai/process";

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await processUnprocessedArticles((progress) => {
          controller.enqueue(
            encoder.encode(JSON.stringify(progress) + "\n")
          );
        });
      } catch (err) {
        console.error("Processing failed:", err);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              processed: 0,
              errors: 1,
              total: 0,
              done: true,
              error: "Processing failed",
            }) + "\n"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
