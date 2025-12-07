import { proxyToBackend } from "./utils/proxy-to-backend";

export const apiRoutes = {
  "/api/count": {
    async GET(req: Request) {
      return proxyToBackend(req, "/api/count");
    },
  },
  "/api/count/increment": {
    async POST(req: Request) {
      return proxyToBackend(req, "/api/count/increment");
    },
  },
  // "/api/hello": {
  //   async GET() {
  //     return Response.json({ message: "Hello, world!", method: "GET" });
  //   },
  //   async PUT() {
  //     return Response.json({ message: "Hello, world!", method: "PUT" });
  //   },
  // },
  // "/api/hello/:name": async (req: Request & { params: { name: string } }) => {
  //   return Response.json({ message: `Hello, ${req.params.name}!` });
  // },
};
