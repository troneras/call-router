#!/bin/bash

echo "Starting Railway deployment..."

# Set environment variable for fastify autoload TypeScript support
export FASTIFY_AUTOLOAD_TYPESCRIPT=1

# Run database migrations
echo "Running database migrations..."
bun run src/db/migrate.ts

# Start the application with bun - use bun start script
echo "Starting application..."
bun start