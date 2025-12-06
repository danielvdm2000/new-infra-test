# Development stage
FROM oven/bun:1 AS dev
WORKDIR /app

# Copy root package files for workspace support
COPY package.json bun.lockb* ./
# Copy client package files
COPY packages/client/package.json ./packages/client/

# Install dependencies
RUN bun install

# Copy client source code
COPY packages/client ./packages/client

# Set working directory to client
WORKDIR /app/packages/client

# Expose Vite dev server port
EXPOSE 5173

# Run dev server
CMD ["bun", "run", "dev", "--host"]

# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

# Copy root package files for workspace support
COPY package.json bun.lockb* ./
# Copy client package files
COPY packages/client/package.json ./packages/client/

# Install dependencies
RUN bun install

# Copy client source code
COPY packages/client ./packages/client

# Set working directory to client
WORKDIR /app/packages/client

# Build for production
RUN bun run build

# Production stage
FROM nginx:alpine AS prod

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy nginx configuration
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/packages/client/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

