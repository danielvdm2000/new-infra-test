import { App } from "@/App";
import { renderToReadableStream } from "react-dom/server";
import { join } from "path";

export async function ssr() {
  const { beforeRoot, afterRoot } = await loadHtmlTemplate();
  const stream = await renderToReadableStream(<App />);

  // Create encoder for text chunks
  const encoder = new TextEncoder();

  // Combine HTML shell with React stream
  const combinedStream = new ReadableStream({
    async start(controller) {
      // Send HTML before root div (includes opening root div)
      controller.enqueue(encoder.encode(beforeRoot + '<div id="root">'));

      // Collect React content chunks
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      // Combine chunks
      const combined = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const reactHtml = new TextDecoder().decode(combined);

      // Send React content (asset paths are already correct in the bundle)
      controller.enqueue(encoder.encode(reactHtml));

      // Send closing root div and rest of HTML
      controller.enqueue(encoder.encode("</div>" + afterRoot));
      controller.close();
    },
  });

  return new Response(combinedStream, {
    headers: { "Content-Type": "text/html" },
  });
}

let htmlTemplate: { beforeRoot: string; afterRoot: string } | null = null;

async function loadHtmlTemplate() {
  if (htmlTemplate) return htmlTemplate;
  const htmlPath = join(process.cwd(), "dist", "index.html");
  const htmlFile = Bun.file(htmlPath);
  const html = await htmlFile.text();
  const [beforeRoot, afterRoot] = html.split('<div id="root"></div>');
  return { beforeRoot, afterRoot };
}