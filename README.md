# new infrastructure test
I need a more efficient infrastructure setup for containerized deployments without vendor lock in.

This is my playground for creating create such a setup.

### Run the project

To start the project in development mode, run:
```
bun run dev
```

note: docker should be running

### TODO
- ✅ setup a monorepo
- ✅ setup a simple app with react, vite and bun.
- ✅ deploy the app
- ✅ setup a deployment pipeline (taken care of by dockploy - initially takes 8 seconds)
- ⏳ Get the deployed app running on ws-dev.dk
- ⏳ setup a domain with subdomain routing.
- ✅ setup a simple server with bun and express.
- ⏳ setup a mongodb database
- ⏳ setup backups
- ⏳ setup a react, vite, bun project with serverside rendering and subdomain routing.
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
