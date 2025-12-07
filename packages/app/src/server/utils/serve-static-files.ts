import { join } from "path";
import { exists } from "fs/promises";

// Helper to serve static files from dist in production
export async function serveStaticFile(
  pathname: string
): Promise<Response | null> {
  // Map root to index.html
  const filePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const distPath = join(process.cwd(), "dist", filePath);

  if (await exists(distPath)) {
    const file = Bun.file(distPath);
    // Set appropriate content type
    const contentType = filePath.endsWith(".js")
      ? "application/javascript"
      : filePath.endsWith(".css")
      ? "text/css"
      : filePath.endsWith(".html")
      ? "text/html"
      : filePath.endsWith(".svg")
      ? "image/svg+xml"
      : "application/octet-stream";
    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  }
  return null;
}
