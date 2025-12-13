import { serve } from "bun";
import index from "./index.html";

// Backend API URL - defaults to Docker service name, can be overridden via env var
const API_URL = process.env.API_URL || "http://server:3001";

// Development server: use Bun's HTML import feature with routes
const server = serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
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