#!/bin/bash

echo "Starting Railway deployment..."

# Run database migrations
echo "Running database migrations..."
bun run db:migrate

# Start the application
echo "Starting application..."
bun start