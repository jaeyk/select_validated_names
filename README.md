# validatednamesr — Interactive Site and R Package

Authors: [Jae Yeon Kim](https://jaeyk.github.io/) and [Charles Crabtree](https://charlescrabtree.com/)

This repository contains the `validatednamesr` R package and an interactive Quarto website that lets users run the package's main workflows in the browser (no R required). The site reproduces the package's selection logic in JavaScript, accepts uploaded datasets (CSV / JSON / Excel), supports column mapping, and can generate downloads (CSV/Excel client-side and RDS via an optional Plumber API).

Core research guidance (from the original README):
- Choose names that vary by race while keeping other perceived attributes constant, or choose names that vary by both race and other perceived attributes.
- Use multiple names per racial group to increase reliability.
- Use names that indicate variation in citizenship, education, and income to explore attribute interactions.

Site features
- Interactive selection UI with controls for:
	- Race, pct_correct threshold, number of names (`n_names`)
	- Selection mode: `control` (attributes constant across races) or `vary` (attributes vary across races)
	- Attribute checkboxes: Income, Education, Citizenship
	- Column mapping UI for uploaded datasets
- Client-side parsing and downloads: CSV and Excel (.xlsx)
- Optional RDS generation via a Plumber API (Dockerized) for authentic R `.rds` files

Quickstart — run locally
1. Install prerequisites: Docker (required), Quarto (optional for rendering locally), and Node.js (for JS tests).

2. Build & run (quick):
```bash
# build and run plumber image and serve site via docker-compose
docker-compose up -d --build

# open the site at http://localhost:4000 and plumber API at http://localhost:8000
```

3. Or use the convenience script (renders the site and serves it):
```bash
chmod +x scripts/launch_local.sh
./scripts/launch_local.sh
```

Using the site
- Open the site in your browser (http://localhost:4000 when running via `docker-compose` or script).
- Upload a dataset (CSV / JSON / Excel) or use the bundled sample.
- If your column names differ from the package, use the Column mapping box to map fields (e.g., `name`, `identity`, `mean_correct`, `income`, `education`, `citizen`).
- Choose `control` mode to select names that are similar across chosen attributes (keeps attributes constant across races), or `vary` mode to select names that maximize attribute differences across races.
- Click `Run` to see results. Use `Download CSV` or `Download Excel` for client-side exports. Use `Download RDS` to request an `.rds` file from the Plumber API.

Development & tests
- Run JS unit tests for selection logic:
```bash
cd quarto-site
npm ci
npm test
```
- Quick CORS check (start the API first):
```bash
chmod +x scripts/test_cors.sh
./scripts/test_cors.sh http://localhost:8000
```
- Makefile targets are provided for common tasks, e.g. `make render`, `make build-image`, `make compose-up`, `make test-js`, `make test-cors`.

Deployment & CI
- GitHub Actions workflow (`.github/workflows/site-and-docker.yml`) does:
	- Run JS tests, render the Quarto site, deploy the site to GitHub Pages.
	- Build and push the Plumber Docker image to GitHub Container Registry (GHCR) and tags images with both `:latest` and the commit SHA.
- See `README_DEPLOY.md` for Docker/compose and deployment notes.

Notes
- The site implements the package logic in client-side JavaScript for interactivity. For exact reproductions or to call R-specific functions, start the Plumber API (the Docker image attempts to install the package and exposes `/rds` to generate `.rds` files).
- If the site and API are served from different origins, CORS is enabled in the Plumber API (`quarto-site/api/plumber.R`).

How to cite

Kim, J and Crabtree, C. (2022). validatednamesr: R package for viewing, loading, and visualizing the Validated Names for Experimental Studies on Race and Ethnicity datasets.
