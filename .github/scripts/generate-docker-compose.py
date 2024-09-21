import toml
import yaml
import os

# Read the main config.toml file
with open('config.toml', 'r') as f:
    config = toml.load(f)

# Initialize docker-compose structure
docker_compose = {
    'version': '3.8',
    'services': {}
}

# Define the NextJS app service
docker_compose['services']['request-directory'] = {
    'build': {
        'context': '.',
        'dockerfile': 'Dockerfile'
    },
    'environment': {},
    'ports': ['3000:3000'],
    'depends_on': []
}

# Add NGINX service with Certbot
docker_compose['services']['nginx'] = {
    'image': 'nginx:latest',
    'ports': ['80:80', '443:443'],
    'volumes': [
        './nginx/nginx.conf:/etc/nginx/nginx.conf',  # Mount NGINX config
        './nginx/certificates:/etc/nginx/certificates',  # Mount SSL certs
        './nginx/html:/var/www/html',  # Mount for Let's Encrypt challenge files
        './certbot-etc:/etc/letsencrypt',  # Let's Encrypt cert storage
    ],
    'environment': {
        # Pass the environment variable
        'NEXT_PUBLIC_SITE_URL': '${NEXT_PUBLIC_SITE_URL}',
    },
    'depends_on': ['request-directory'],
    'command': '/bin/bash -c "/app/init-letsencrypt.sh && nginx -g \'daemon off;\'"'
}

# Certbot dependencies service for SSL generation
docker_compose['services']['certbot'] = {
    'image': 'certbot/certbot',
    'volumes': [
        './nginx/html:/var/www/html',  # Challenge files directory
        './certbot-etc:/etc/letsencrypt',  # Let's Encrypt cert storage
    ],
    'entrypoint': '/bin/bash -c "exit 0"'  # Runs Certbot on NGINX startup
}

# Create NGINX config file for SSL and redirection
nginx_config_dir = './nginx'
os.makedirs(nginx_config_dir, exist_ok=True)
nginx_config_file = os.path.join(nginx_config_dir, 'nginx.conf')

nginx_config = """
server {
    listen 80;
    server_name $host;

    # Handle Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $host;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$host/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$host/privkey.pem;

    # Prevent direct IP access
    if ($host ~* ^(\d+\.\d+\.\d+\.\d+)$) {
        return 444;
    }

    # Proxy requests to the NextJS app
    location / {
        proxy_pass http://request-directory:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"""

# Write NGINX config
with open(nginx_config_file, 'w') as f:
    f.write(nginx_config)

# Create Let's Encrypt initialization script with environment variable support
letsencrypt_script = """#!/bin/bash

domain=${NEXT_PUBLIC_SITE_URL}

# Remove 'http://' or 'https://' if present in domain
domain=${domain#https://}
domain=${domain#http://}

if [ ! -d "/etc/letsencrypt/live/$domain" ]; then
    echo "### Generating SSL certificates for $domain ..."
    certbot certonly --webroot --webroot-path=/var/www/html --agree-tos --email admin@$domain -d $domain --non-interactive
else
    echo "### SSL certificates for $domain already exist ..."
fi
"""

# Write the script to the NGINX directory
init_script_file = os.path.join(nginx_config_dir, 'init-letsencrypt.sh')
with open(init_script_file, 'w') as f:
    f.write(letsencrypt_script)

# Ensure the script is executable
os.chmod(init_script_file, 0o755)

# Get database settings
database = config.get('database', {})
supabase_setting = database.get('supabase', 'managed')

# Determine if Supabase is local
local_supabase = (supabase_setting == 'local')

if local_supabase:
    # Define the Supabase service
    docker_compose['services']['supabase'] = {
        'image': 'supabase/postgres:latest',
        'ports': ['5432:5432', '8000:8000'],  # Expose necessary ports
        'environment': {
            'POSTGRES_PASSWORD': '${SUPABASE_PASSWORD}',
            'JWT_SECRET': '${SUPABASE_JWT_SECRET}',
            'SITE_URL': '${NEXT_PUBLIC_SITE_URL}',
            'SUPABASE_JWT_SECRET': '${SUPABASE_JWT_SECRET}',
            'SUPABASE_ANON_KEY': '${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}',
            'SUPABASE_SERVICE_ROLE_KEY': '${SUPABASE_SECRET_KEY}',
            # Add the GitHub OAuth credentials to the environment
            'GITHUB_CLIENT_ID': '${GITHUB_CLIENT_ID}',
            'GITHUB_CLIENT_SECRET': '${GITHUB_CLIENT_SECRET}',
            'STRIPE_WEBHOOK_SIGNING_SECRET': '${STRIPE_WEBHOOK_SIGNING_SECRET}',
        },
        'volumes': [
            'supabase_data:/var/lib/postgresql/data',
            './supabase/config.toml:/supabase/config.toml'  # Mount the config.toml file
        ]
    }
    docker_compose['services']['request-directory']['depends_on'].append(
        'supabase')

    # Modify or create the Supabase config.toml file
    supabase_config_dir = './supabase'
    os.makedirs(supabase_config_dir, exist_ok=True)
    supabase_config_file = os.path.join(supabase_config_dir, 'config.toml')

    # Create a default config.toml if it doesn't exist
    if os.path.exists(supabase_config_file):
        with open(supabase_config_file, 'r') as f:
            supabase_config = toml.load(f)
    else:
        supabase_config = {}

    # Modify the config.toml to add the GitHub OAuth configuration
    supabase_config.setdefault('auth', {}).setdefault(
        'external', {}).setdefault('github', {})
    supabase_config['auth']['external']['github']['enabled'] = True
    supabase_config['auth']['external']['github']['client_id'] = "env(GITHUB_CLIENT_ID)"
    supabase_config['auth']['external']['github']['secret'] = "env(GITHUB_CLIENT_SECRET)"

    # Write the updated config.toml

    with open(supabase_config_file, 'w') as f:
        toml.dump(supabase_config, f)

# Write the docker-compose.yml file
with open('docker-compose.yml', 'w') as f:
    yaml.dump(docker_compose, f, sort_keys=False)

print("docker-compose.yml has been generated successfully.")
