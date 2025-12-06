## Run the project

To start the project in development mode, run:
```
docker compose -f docker-compose.dev.yml up --build
```

To start the project in production mode, run:
```
docker compose up --build
```

## TODO
This is a test project for the new infrastructure of whistleservice. It will use a vps from hetzner with dockploy.

- ✅ setup a monorepo
- ✅ setup a simple app with react, vite and bun.
- ✅ deploy the app
- ✅ setup a deployment pipeline (taken care of by dockploy - and it is super fast on push to main no more than a few seconds)
- ⏳ Get the deployed app running on ws-dev.dk
- ⏳ setup a domain with subdomain routing.
- ⏳ setup a simple server with bun and express.
- ⏳ setup a mongodb database
- ⏳ setup backups
- ⏳ setup a react, vite, bun project with serverside rendering and subdomain routing.
- ⏳ setup a shared ui project with hot-reloading and typesafety.
- ⏳ setup a s3 compatible object storage. 

## Setup of VPS
1. Install dockploy (`curl -sSL https://dokploy.com/install.sh | sh`)
2. Open 159.69.209.121:3000
3. Create user
4. Create DNS `A Record` from the vps ip (159.69.209.121) to ws-dev.dk
5. Setup domain in dockploy with SSL
6. Connect to github
7. Create a new project of you compose and follow the wizard

## DNS
Use `nslookup ws-dev.dk` to see if the domain has been connected to the IP of the VPS 

### Settings
- `A Record` ws-dev.dk -> 159.69.209.121
