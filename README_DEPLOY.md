Deployment (Plumber + Docker)
--------------------------------

This project includes a minimal Plumber API to generate `.rds` files from JSON data and a `Dockerfile` to run it.

Build and run locally with Docker:

```bash
docker build -t select-names-plumber .
docker run -p 8000:8000 select-names-plumber
```

Endpoints:
- `GET /health` — simple health check
- `POST /rds` — generate an RDS from posted JSON; body: `{ "rows": [ ... ], "filename": "selected_names.rds" }`

Notes:
- The Dockerfile uses `rstudio/plumber:latest` and installs a few CRAN packages. Adjust the image or packages as needed.
- If you want the API to call the package's `select_names()` functions directly, ensure the package is installed inside the Docker image (the Dockerfile attempts to install the current repo).

Makefile and dev convenience
---------------------------

There is a `Makefile` with common targets:

- `make build-image` — build the Docker image locally
- `make push-image` — buildx and push image to GHCR (tags with `$(TAG)` and short SHA)
- `make run` — run the plumber image locally
- `make render` — render the Quarto site locally
- `make compose-up` / `make compose-down` — use `docker-compose` to run both services

Docker Compose override
-----------------------

`docker-compose.override.yml` mounts local code into the containers for development. Use:

```bash
docker-compose up -d --build
```

CI tagging
----------

The GitHub Actions workflow tags Docker images with both `:latest` and the commit SHA for reproducible builds.

