# Multi-stage build for Vue.js Rugby Board project

# Stage 1: Development
FROM node:18-alpine AS development

# Add Python and build essentials for native modules
RUN apk add --no-cache python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vue -u 1001 -G nodejs

# Set working directory
WORKDIR /app
RUN chown -R vue:nodejs /app

# Create Cypress cache directory with proper permissions
RUN mkdir -p /home/vue/.cache/Cypress && chown -R vue:nodejs /home/vue/.cache

# Copy entrypoint script
COPY --chown=vue:nodejs docker/entrypoint-dev.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy package files (will install on startup via entrypoint)
COPY --chown=vue:nodejs package*.json ./

# Copy source code
COPY --chown=vue:nodejs . .

# Switch to non-root user
USER vue

# Expose port and set environment
EXPOSE 5527
ENV NODE_ENV=development
ENV CYPRESS_CACHE_FOLDER=/home/vue/.cache/Cypress

# Set entrypoint and default command
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "serve"]

# Stage 2: Test Environment
FROM node:18-alpine AS test

# Add Python and build essentials for testing tools
RUN apk add --no-cache python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vue -u 1001 -G nodejs

# Set working directory
WORKDIR /app
RUN chown -R vue:nodejs /app

# Create Cypress cache directory with proper permissions
RUN mkdir -p /home/vue/.cache/Cypress && chown -R vue:nodejs /home/vue/.cache

# Copy entrypoint script
COPY --chown=vue:nodejs docker/entrypoint-test.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy package files (will install on startup via entrypoint)
COPY --chown=vue:nodejs package*.json ./

# Copy source code
COPY --chown=vue:nodejs . .

# Switch to non-root user
USER vue

# Set test environment
ENV NODE_ENV=test
ENV CI=true
ENV CYPRESS_CACHE_FOLDER=/home/vue/.cache/Cypress

# Set entrypoint and default command
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "test:unit"]

# Stage 3: Build
FROM node:18-alpine AS build

# Add Python and build essentials
RUN apk add --no-cache python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vue -u 1001 -G nodejs

# Set working directory
WORKDIR /app
RUN chown -R vue:nodejs /app

# Copy package files and install dependencies
COPY --chown=vue:nodejs package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY --chown=vue:nodejs . .
RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration if exists
COPY nginx.conf /etc/nginx/nginx.conf 2>/dev/null || true

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
