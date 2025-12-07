const API_URL = process.env.API_URL || "http://server:3001";

export async function proxyToBackend(req: Request, path: string): Promise<Response> {
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