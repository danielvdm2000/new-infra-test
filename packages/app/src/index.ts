import { serve } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import index from "./index.html";

// Backend API URL - defaults to Docker service name, can be overridden via env var
const API_URL = process.env.API_URL || "http://server:3001";

const isProduction = process.env.NODE_ENV === "production";

// Helper function to proxy requests to the backend server
async function proxyToBackend(req: Request, path: string): Promise<Response> {
  const url = new URL(path, API_URL);
  const headers = new Headers(req.headers);
  
  // Remove host header to avoid issues
  headers.delete("host");
  
  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
    });
    
    // Create a new response with the backend's status and headers
    const responseHeaders = new Headers(response.headers);
    // Ensure CORS headers are preserved
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`Proxy error for ${path}:`, error);
    return Response.json(
      { error: "Failed to connect to backend server" },
      { status: 502 }
    );
  }
}

// Helper to serve static files from dist in production
async function serveStaticFile(pathname: string): Promise<Response | null> {
  if (!isProduction) return null;
  
  // Map root to index.html
  const filePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const distPath = join(process.cwd(), "dist", filePath);
  
  if (existsSync(distPath)) {
    const file = Bun.file(distPath);
    // Set appropriate content type
    const contentType = filePath.endsWith(".js") ? "application/javascript" :
                       filePath.endsWith(".css") ? "text/css" :
                       filePath.endsWith(".html") ? "text/html" :
                       filePath.endsWith(".svg") ? "image/svg+xml" :
                       "application/octet-stream";
    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  }
  return null;
}

if (isProduction) {
  // Production mode: use fetch handler to serve built files
  const server = serve({
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // API proxy routes
      if (pathname === "/api/count" && req.method === "GET") {
        return proxyToBackend(req, "/api/count");
      }
      if (pathname === "/api/count/increment" && req.method === "POST") {
        return proxyToBackend(req, "/api/count/increment");
      }
      if (pathname === "/api/hello" && (req.method === "GET" || req.method === "PUT")) {
        return Response.json({
          message: "Hello, world!",
          method: req.method,
        });
      }
      if (pathname.startsWith("/api/hello/")) {
        const name = pathname.split("/api/hello/")[1];
        return Response.json({
          message: `Hello, ${name}!`,
        });
      }

      // Try to serve static files from dist
      const staticResponse = await serveStaticFile(pathname);
      if (staticResponse) return staticResponse;
      
      // For SPA routing, serve index.html for all non-API routes
      if (!pathname.startsWith("/api")) {
        const indexPath = join(process.cwd(), "dist", "index.html");
        if (existsSync(indexPath)) {
          const indexFile = Bun.file(indexPath);
          return new Response(indexFile, {
            headers: { "Content-Type": "text/html" },
          });
        }
      }

      return new Response("Not found", { status: 404 });
    },
  });

  console.log(`🚀 Server running at ${server.url}`);
} else {
  // Development mode: use Bun's HTML import feature with routes
  const server = serve({
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    routes: {
      // API proxy routes - must come before the catch-all route
      "/api/count": {
        async GET(req) {
          return proxyToBackend(req, "/api/count");
        },
      },

      "/api/count/increment": {
        async POST(req) {
          return proxyToBackend(req, "/api/count/increment");
        },
      },

      "/api/hello": {
        async GET(req) {
          return Response.json({
            message: "Hello, world!",
            method: "GET",
          });
        },
        async PUT(req) {
          return Response.json({
            message: "Hello, world!",
            method: "PUT",
          });
        },
      },

      "/api/hello/:name": async req => {
        const name = req.params.name;
        return Response.json({
          message: `Hello, ${name}!`,
        });
      },

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
