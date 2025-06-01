# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Debug: Show what files we have before build
RUN echo "=== Files before build ===" && ls -la

# Run build and show what happens
RUN npm run build || (echo "Build failed" && ls -la && exit 1)

# Debug: Show what files exist after build
RUN echo "=== Files after build ===" && ls -la
RUN echo "=== Checking for .next directory ===" && ls -la .next || echo "No .next directory created!"

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# For now, just copy everything to see what we have
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]