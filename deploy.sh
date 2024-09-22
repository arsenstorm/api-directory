# Run docker-compose up
docker-compose up --build --force-recreate -d

# Deploy with TLS
docker-compose exec proxy kamal-proxy deploy main --target request-directory:3000 --host ${NEXT_PUBLIC_SITE_URL} --tls