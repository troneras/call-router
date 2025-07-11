#!/bin/bash

echo "Starting Railway deployment..."

# Check if bun is available
if ! command -v bun &> /dev/null; then
    echo "Bun not found, using node instead..."
    # Run database migrations with node
    echo "Running database migrations..."
    node --loader ts-node/esm src/db/migrate.ts
    
    # Start the application
    echo "Starting application..."
    node --loader ts-node/esm src/server.ts
else
    echo "Using Bun runtime..."
    # Run database migrations
    echo "Running database migrations..."
    bun run db:migrate
    
    # Start the application
    echo "Starting application..."
    bun start
fi