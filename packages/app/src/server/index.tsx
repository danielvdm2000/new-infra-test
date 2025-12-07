import { serve } from "bun";
import { serveStaticFile } from "./utils/serve-static-files";
import { apiRoutes } from "./api-routes";
import { ssr } from "./ssr";

export async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Production mode: use routes to serve built files
    const server = serve({
      port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
      routes: {
        ...apiRoutes,
        // Catch-all route to serve static files (must be last)
        "/*": async (req: Request & { url: string }) => {
          const url = new URL(req.url);
          const pathname = url.pathname;

          if (pathname === "/") return ssr();

          const staticResponse = await serveStaticFile(pathname);
          if (staticResponse) return staticResponse;
          return new Response("Not found", { status: 404 });
        },
      },
    });

    console.log(`🚀 Server running at ${server.url}`);
  } else {
    const { default: index } = await import("../index.html");

    // Development mode: use Bun's HTML import feature with routes
    const server = serve({
      port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
      routes: {
        ...apiRoutes,
        // Serve index.html for all unmatched routes (must be last)
        "/*": index,
      },

      development: {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
      },
    });

    console.log(`🚀 Server running at ${server.url}`);
  }
}
