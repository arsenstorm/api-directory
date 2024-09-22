# Run docker-compose up
docker-compose up --build --force-recreate -d

# Deploy using kamal-proxy with NEXT_PUBLIC_SITE_URL from .env with TLS
docker-compose exec proxy kamal-proxy rollout deploy main --target request-directory:3000 --host ${NEXT_PUBLIC_SITE_URL} --tls