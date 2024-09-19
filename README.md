# Request Directory

Request Directory is an open-source alternative to RapidAPI, allowing you to use
APIs for a variety of tasks with a single API key!

## Docker

To build the docker image, run the following command:

```bash
docker build -t request-directory .
```

To run the docker container, run the following command:

```bash
docker run -it -p3000:3000 request-directory
```

## APIs

Request Directory contains a bunch of different APIs that are all hosted on
the same domain.

### NudeNet

Details about the NudeNet API can be found [here](https://github.com/notai-tech/nudenet).

To start the NudeNet API, run the following command:

```bash
docker run -it -p2000:8080 ghcr.io/notai-tech/nudenet:latest
```

This will make the API available at `http://localhost:2000/infer`.

Request Directory uses this API locally at `http://localhost:3000/v1/nudenet` or
`https://request.directory/v1/nudenet` in production.

## FAQ

### Will you be adding more APIs?

Yep! I think Request Directory is super useful and it’s a great way to
discover new APIs. If you have any suggestions, please open an issue or
submit a PR.

### Will Request Directory get any AI models?

No. The official instance of Request Directory won’t get any AI models.

It will, however, host APIs that use AI models (like those from OpenAI).

### Why Supabase?

I chose Supabase for a couple reasons:

1. Supabase is open source (and has a generous free tier)
2. Supabase is easier to get up and running rather than setting up Postgres, S3,
   and Next Auth.
3. I just so happened to start this project while Supabase was running their
   Twelfth Hackathon and I wanted to win😂
