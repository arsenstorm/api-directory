# Request Directory

Request Directory is an open-source alternative to RapidAPI, allowing you to use
APIs for a variety of tasks with a single API key!

## Getting Started

To get started with self-hosting Request Directory, run this command:

```bash
# TODO!
```

> [!NOTE]
>
> I’ve not completed this yet—I’m looking to create a simple command that will
> take an input of the APIs you want to use and then automatically set up the
> environment for you.

## Manual Setup

Eventually, I’ll get rid of the need for Python, but for now, here’s how to set
up the project:

```bash
# clone the repo
git clone https://github.com/arsenstorm/api-directory.git request-directory
cd request-directory

# add Environment Variables
cp .env.example .env

# WARNING: You need to fill in the environment variables in the .env file

# make the setup script executable
chmod +x setup.sh

# run the setup script
./setup.sh
```

> [!CAUTION]
>
> You need to fill in the environment variables in the .env file.

## Development

The stuff below talks about the stuff that goes on in the development
environment.

## Docker

To build the docker image, run the following command:

```bash
docker build -t request-directory .
```

To run the docker container, run the following command:

```bash
docker run -it -p3000:3000 request-directory
```

## Supabase

Request Directory uses Supabase for authentication, database, storage, and edge
functions.

Edge functions are used to handle incoming Webhooks (such as from Stripe).

Storage is used to store images, videos, and other files where appropriate (such
as the video creation API).

## Unkey

Request Directory uses [Unkey](https://unkey.dev) to manage API keys.

I chose Unkey because it’s open source and has a generous free tier.

Although it’s possible to self-host Unkey, documentation is not available (see
[this issue](https://github.com/unkeyed/unkey/issues/1964)).

## APIs

Request Directory contains a bunch of different APIs that are all hosted on the
same domain.

### NudeNet

Details about the NudeNet API can be found
[here](https://github.com/notai-tech/nudenet).

To start the NudeNet API, run the following command:

```bash
docker run -it -p8080:8080 ghcr.io/notai-tech/nudenet:latest
```

This will make the API available at `http://localhost:8080/infer`.

Request Directory uses this API locally at `http://localhost:3000/v1/nudenet` or
`https://request.directory/v1/nudenet` in production.

## FAQ

### Will you be adding more APIs?

Yep! I think Request Directory is super useful and it’s a great way to discover
new APIs. If you have any suggestions, please open an issue or submit a PR.

### Will Request Directory get any AI models?

No. The official instance of Request Directory won’t get any AI models.

It will, however, host APIs that use AI models (like those from OpenAI).

> [!TIP]
>
> If you want to use Request Directory to host AI models, clone this repository
> and add necessary configurations to the

### Why Supabase?

I chose Supabase for a couple reasons:

1. Supabase is open source (and has a generous free tier)
2. Supabase is easier to get up and running rather than setting up Postgres, S3,
   and Next Auth.
3. I just so happened to start this project while Supabase was running their
   Twelfth Hackathon and I wanted to win😂

## Notes

### Environment Variables

If you’ve been developing locally and using docker, you may run into an issue
where the environment variables are not being set accurately inside of Next.

If this is the case, you’ve probably forgotten to shutdown the docker-compose
stack.

To fix it, run the following command:

```bash
docker-compose down
```

And then open a new terminal window before running `bun dev` again.
