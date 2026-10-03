# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy monorepo files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json .eslintrc.json ./
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all apps
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy built applications from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/package.json ./package.json

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh
set -e

echo "Starting Nexora Frontend Services..."

# Start Admin app on port 3000
echo "Starting Admin app..."
cd /app/packages/admin && PORT=3000 pnpm start &
ADMIN_PID=$!

# Start FabWash app on port 3001
echo "Starting FabWash app..."
cd /app/packages/fabwash && PORT=3001 pnpm start &
FABWASH_PID=$!

echo "Admin PID: $ADMIN_PID"
echo "FabWash PID: $FABWASH_PID"

# Wait for both processes
wait $ADMIN_PID $FABWASH_PID
EOF

RUN chmod +x /app/start.sh

# Set environment
ENV NODE_ENV=development

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start both apps directly
CMD ["/app/start.sh"]
