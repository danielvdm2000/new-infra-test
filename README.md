# new infrastructure test
I need a more efficient infrastructure setup for containerized deployments without vendor lock in.

This is my playground for creating create such a setup.

### Run the project

To start the project in development mode, run:
```
bun run dev
```

note: docker should be running

### Troubleshooting

#### Missing node_modules error (ENOENT reading node_modules)

If you encounter an error like `error: ENOENT reading "/app/packages/app/node_modules/bun-plugin-tailwind"`, this typically happens when Docker named volumes override the `node_modules` installed during the Docker build.

**Solution:** Remove any named volumes for `node_modules` from your `docker-compose.dev.yml`. The dependencies installed during the Docker build (`RUN bun install`) will be used instead. Named volumes for `node_modules` are only needed if you want to share dependencies between host and container, but they will override the installed dependencies if the volume is empty.

**Example of what to remove:**
```yaml
volumes:
  - app-node-modules:/app/packages/app/node_modules
  - root-node-modules:/app/node_modules
```

The `server` package in this project demonstrates the correct setup - it doesn't use named volumes for `node_modules` and relies on the dependencies installed during the Docker build.

### TODO
- ✅ setup a monorepo
- ✅ setup a simple app with react, vite and bun.
- ✅ deploy the app
- ✅ setup a deployment pipeline (taken care of by dockploy - initially takes 8 seconds)
- ✅ Get the deployed app running on ws-dev.dk
- ⏳ setup a domain with subdomain routing.
- ✅ setup a simple server with bun and express.
- ✅ setup a mongodb database
- ⏳ setup backups
- 🚫 setup a react, vite, bun project with serverside rendering (i have concluded that solid server-side rendering isn't worth the added complexity)
- ⏳ setup a shared ui project with hot-reloading and typesafety.
- ⏳ setup a s3 compatible object storage. 

### Setup of VPS

1. Install dockploy (`curl -sSL https://dokploy.com/install.sh | sh`)
2. Open server-id:3000
3. Create user
4. Create DNS `A Record` from the vps ip (server-ip) to ws-dev.dk
5. Setup domain in dockploy with SSL
6. Connect to github
7. Create a new project of you compose and follow the wizard
