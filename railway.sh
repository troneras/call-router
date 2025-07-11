#!/bin/bash

echo "Starting Railway deployment..."

# Run database migrations
echo "Running database migrations..."
bun run src/db/migrate.ts

# Start the application with bun - use bun start script
echo "Starting application..."
bun start