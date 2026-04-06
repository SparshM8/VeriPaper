# Frontend build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage - serve with lightweight HTTP server
FROM node:18-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set Vite API URL from environment or default
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8000/api}

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
