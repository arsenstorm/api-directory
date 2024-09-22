#!/bin/bash

# Ensure the script is run from the directory where the config.toml file is located
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ".env file not found. Please create a .env file with the necessary environment variables."
    exit 1
fi

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Check if NEXT_PUBLIC_SITE_URL is set
if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
    echo "NEXT_PUBLIC_SITE_URL is not set in the .env file."
    exit 1
fi

# Remove http:// or https:// from NEXT_PUBLIC_SITE_URL if present
CLEAN_URL=$(echo "${NEXT_PUBLIC_SITE_URL}" | sed -e 's|^https\?://||')

# Print the value of NEXT_PUBLIC_SITE_URL for debugging
echo "Deploying to: ${CLEAN_URL}"

# Run docker-compose up
docker-compose up --build --force-recreate -d

# Wait for containers to be ready (adjust sleep time if needed)
echo "Waiting for containers to be ready..."
sleep 10

# Check if the proxy container is running
if ! docker-compose ps | grep -q "proxy.*Up"; then
    echo "Error: Proxy container is not running. Check docker-compose logs."
    exit 1
fi

echo "Deploying to ${CLEAN_URL}"

# Deploy with TLS (with added quotes and error checking)
if ! docker-compose exec proxy kamal-proxy deploy main --target request-directory:3000 --host ${CLEAN_URL} --tls; then
    echo "Error: Deployment failed. Check the error message above."
    exit 1
fi

echo "Deployment completed successfully."
