# Multi-stage build for Vue.js Rugby Board project

# Stage 1: Development
FROM node:16-alpine AS development

# Create app user to avoid running as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vue -u 1001 -G nodejs

WORKDIR /app

# Change ownership of the app directory
RUN chown -R vue:nodejs /app

# Switch to the app user
USER vue

# Copy package files for dependency installation
COPY --chown=vue:nodejs package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY --chown=vue:nodejs . .

# Create cache directory with proper permissions
RUN mkdir -p node_modules/.cache && chmod 755 node_modules/.cache

# Expose development port
EXPOSE 5527

# Development command with hot reload
CMD ["npm", "run", "serve"]

# Stage 2: Build
FROM node:16-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only for build)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
