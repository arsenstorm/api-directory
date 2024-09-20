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

# Get database settings
database = config.get('database', {})
supabase_setting = database.get('supabase', 'managed')

# Determine if supabase is local
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
            'AUTH_GITHUB_ID': '${AUTH_GITHUB_ID}',
            'AUTH_GITHUB_SECRET': '${AUTH_GITHUB_SECRET}',
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

# Get the APIs configurations
api_configs = config.get('api', {})

# Define mapping from external API names to images and ports
external_api_images = {
    'nudenet': {
        'image': 'ghcr.io/notai-tech/nudenet:latest',
        'ports': ['8080:8080'],
        'cap_add': ['SYS_RESOURCE'],  # this flag didn't work to fix the bug
        # 'privileged': True  # WARNING: This is dangerous
    },
    # Add external APIs here
}

# These Environment Variables are added to the NextJS app service
external_api_environment_variables = {
    'nudenet': {
        'NUDENET_URL': 'http://nudenet:8080/infer'
    }
}

docker_compose['services']['request-directory']['environment'] = {
    # GitHub OAuth
    'AUTH_GITHUB_ID': '${AUTH_GITHUB_ID}',
    'AUTH_GITHUB_SECRET': '${AUTH_GITHUB_SECRET}',

    # Unkey
    'UNKEY_ROOT_KEY': '${UNKEY_ROOT_KEY}',
    'UNKEY_API_ID': '${UNKEY_API_ID}',

    # Supabase
    'NEXT_PUBLIC_SUPABASE_URL': '${NEXT_PUBLIC_SUPABASE_URL}',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': '${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}',
    'SUPABASE_SECRET_KEY': '${SUPABASE_SECRET_KEY}',
    'SUPABASE_JWT_SECRET': '${SUPABASE_JWT_SECRET}',
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
            service_config = {
                'image': external_api['image'],
                'ports': external_api['ports'],
            }

            if 'cap_add' in external_api:
                service_config['cap_add'] = external_api['cap_add']
            if 'privileged' in external_api:
                service_config['privileged'] = external_api['privileged']

            docker_compose['services'][service_name] = service_config
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

# Write the docker-compose.yml file
with open('docker-compose.yml', 'w') as f:
    yaml.dump(docker_compose, f, sort_keys=False)

print("docker-compose.yml has been generated successfully.")
