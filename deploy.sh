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

# Run docker-compose up
docker-compose up --build --force-recreate -d

# Deploy with TLS
docker-compose exec proxy kamal-proxy deploy main --target request-directory:3000 --host ${NEXT_PUBLIC_SITE_URL} --tls