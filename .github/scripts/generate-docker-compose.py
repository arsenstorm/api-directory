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

# Collect GitHub OAuth credentials
auth_github_id = input(
    "Enter the GitHub OAuth Application Client ID (AUTH_GITHUB_ID): ")
auth_github_secret = input(
    "Enter the GitHub OAuth Application Client Secret (AUTH_GITHUB_SECRET): ")

# Collect Unkey credentials
unkey_root_key = input("Enter the Unkey Root Key (UNKEY_ROOT_KEY): ")
unkey_api_id = input("Enter the Unkey API ID (UNKEY_API_ID): ")

# Initialize Supabase variables
supabase_url = ''
supabase_publishable_key = ''
supabase_secret_key = ''
supabase_jwt_secret = ''

# Get database settings
database = config.get('database', {})
supabase_setting = database.get('supabase', 'managed')

# Determine if supabase is local
local_supabase = (supabase_setting == 'local')

if local_supabase:
    # If Supabase is local, ask for necessary credentials
    site_url = input("Enter the site URL: ")
    supabase_password = input(
        "Enter a password to secure your Supabase instance (or leave blank to auto-generate): ")
    if not supabase_password:
        import random
        import string
        supabase_password = ''.join(random.choices(
            string.ascii_letters + string.digits, k=16))
        print(f"Generated Supabase password: {supabase_password}")

    print("Visit https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys to generate a JWT secret, anon key, and service role key.")
    supabase_jwt_secret = input(
        "Enter a JWT secret to secure your Supabase instance: ")
    supabase_anon_key = input(
        "Enter the Supabase Publishable Key (Anon Key): ")
    supabase_service_role_key = input(
        "Enter the Supabase Secret (Service Role) Key: ")

    # Set Supabase URL for local instance
    supabase_url = 'http://supabase:8000'  # Adjust the port if necessary
    supabase_publishable_key = supabase_anon_key
    supabase_secret_key = supabase_service_role_key

    # Define the Supabase service
    docker_compose['services']['supabase'] = {
        'image': 'supabase/postgres:latest',
        'ports': ['5432:5432', '8000:8000'],  # Expose necessary ports
        'environment': {
            'POSTGRES_PASSWORD': supabase_password,
            'JWT_SECRET': supabase_jwt_secret,
            'SITE_URL': site_url,
            'SUPABASE_JWT_SECRET': supabase_jwt_secret,
            'SUPABASE_ANON_KEY': supabase_anon_key,
            'SUPABASE_SERVICE_ROLE_KEY': supabase_service_role_key,
            # The keys below are added due to changes in Supabase
            'SUPABASE_PUBLISHABLE_KEY': supabase_anon_key,
            'SUPABASE_SECRET_KEY': supabase_service_role_key,
            # Add the GitHub OAuth credentials to the environment
            'AUTH_GITHUB_ID': auth_github_id,
            'AUTH_GITHUB_SECRET': auth_github_secret,
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
    supabase_config['auth']['external']['github']['client_id'] = "env(AUTH_GITHUB_ID)"
    supabase_config['auth']['external']['github']['secret'] = "env(AUTH_GITHUB_SECRET)"

    # Write the updated config.toml
    with open(supabase_config_file, 'w') as f:
        toml.dump(supabase_config, f)
else:
    # If Supabase is managed, ask for credentials
    supabase_url = input("Enter the Supabase URL (NEXT_PUBLIC_SUPABASE_URL): ")
    supabase_publishable_key = input(
        "Enter the Supabase Publishable Key (Anon Key): ")
    supabase_secret_key = input(
        "Enter the Supabase Secret Key (Service Role Key): ")
    supabase_jwt_secret = input("Enter the Supabase JWT Secret: ")

# Get the APIs configurations
api_configs = config.get('api', {})

# Define mapping from external API names to images and ports
external_api_images = {
    'nudenet': {
        'image': 'ghcr.io/notai-tech/nudenet:latest',
        'ports': ['8080:8080']
    },
    # Add external APIs here
}

# These Environment Variables are added to the NextJS app service
external_api_environment_variables = {
    'nudenet': {
        'NUDENET_URL': 'http://nudenet:8080/infer'
    }
}

# Process each API
for api_name, api_value in api_configs.items():
    api_enabled = api_value.get('enabled', False)
    api_type = api_value.get('type', 'internal')

    if api_enabled and api_type == 'external':
        # Get the external API configuration
        external_api = external_api_images.get(api_name)
        if external_api:
            service_name = api_name.replace('_', '-')
            docker_compose['services'][service_name] = {
                'image': external_api['image'],
                'ports': external_api['ports'],
            }
            docker_compose['services']['request-directory']['depends_on'].append(
                service_name)

            # Add environment variables for this external API to the NextJS app service
            if api_name in external_api_environment_variables:
                docker_compose['services']['request-directory']['environment'].update(
                    external_api_environment_variables[api_name]
                )
        else:
            print(
                f"No image information for external API '{api_name}'. Skipping.")

# Add environment variables to the app service
docker_compose['services']['request-directory']['environment'] = {
    # GitHub OAuth
    'AUTH_GITHUB_ID': auth_github_id,
    'AUTH_GITHUB_SECRET': auth_github_secret,

    # Unkey
    'UNKEY_ROOT_KEY': unkey_root_key,
    'UNKEY_API_ID': unkey_api_id,

    # Supabase
    'NEXT_PUBLIC_SUPABASE_URL': supabase_url,
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': supabase_publishable_key,
    'SUPABASE_SECRET_KEY': supabase_secret_key,
    'SUPABASE_JWT_SECRET': supabase_jwt_secret,
}

# Write the docker-compose.yml file
with open('docker-compose.yml', 'w') as f:
    yaml.dump(docker_compose, f, sort_keys=False)

print("docker-compose.yml has been generated successfully.")
