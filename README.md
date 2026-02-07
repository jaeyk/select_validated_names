# Interactive Site for `validatednamesr`

Authors: [Jae Yeon Kim](https://jaeyk.github.io/) and [Charles Crabtree](https://charlescrabtree.com/)

This repository contains the `validatednamesr` R package and a **static web-based interface** that replicates the package's selection logic in the browser (no R required). The interactive site lets users select validated names by parameters, just like the R package, using a bundled sample dataset.

## Research Background

The site helps researchers design studies that account for name-based racial bias:

- **Control mode**: Select names that are similar across your chosen attributes (e.g., income, education) to keep attributes constant while varying race.
- **Vary mode**: Select names that maximize attribute diversity across races to explore how perceived identity interacts with other attributes.
- Use **multiple names per racial group** to increase statistical reliability.
- Explore attribute interactions on citizenship, education, and income.

## Features

- **Parameter-driven selection** – choose race, pronunciation correctness threshold, number of names, attributes, and selection mode
- **Instant results** – pure JavaScript selection algorithm runs in your browser
- **Bundled sample data** – 16 validated names (4 per racial group) included
- **Easy exports** – download results as CSV or Excel (.xlsx)
- **No setup required** – fully static site; visit the deployed URL and start selecting

## Local Development

### Prerequisites
- **Node.js** (for running tests)
- **Quarto** (for rendering the site locally, optional)

### Development Commands

```bash
# Run JS unit tests for the selection algorithm
make test

# Render the Quarto site
make render

# Serve the site locally on http://localhost:4000
make serve

# Render site, then serve it
make dev
```

## Using the Site

1. **Visit the site** (deployed at the GitHub Pages URL or locally via `make dev`)
2. **Choose parameters:**
   - **Race/Ethnicity**: Filter by a specific race or use all races
   - **Min Correct Pronunciation (%)**: Set a minimum threshold (0–100)
   - **Number of Names**: How many names to select (1–16)
   - **Order Results By**: Sort results by a specific attribute (or no sort)
   - **Selection Mode**: `control` (attributes similar across races) or `vary` (maximize diversity)
   - **Attributes to Consider**: Select which attributes (Income, Education, Citizenship) inform the selection
3. **Run Selection** to see results in the table
4. **Download** results as CSV or Excel

## Deployment

The site is automatically deployed to **GitHub Pages** via GitHub Actions on every push to the `main` branch.

- GitHub Actions workflow (`.github/workflows/site-and-docker.yml`):
  - Runs JS unit tests
  - Renders the Quarto site
  - Deploys to GitHub Pages

## Project Structure

```
.
├── quarto-site/           # Quarto site source
│   ├── index.qmd          # Main page (Quarto markdown + inline HTML)
│   ├── _quarto.yml        # Quarto configuration
│   ├── js/
│   │   ├── selection_core.js    # Core selection algorithm (UMD module)
│   │   ├── select_names.js      # Wrapper (client demos)
│   │   └── __tests__/           # Jest unit tests
│   ├── data/
│   │   └── sample_names.json    # 16-name sample dataset
│   └── _site/             # Built static site (deployed to Pages)
├── R/                     # Original R package source
├── tests/                 # R package tests
├── Makefile              # Common tasks
└── README.md             # This file
```

## How It Works

The **selection algorithm** (in `quarto-site/js/selection_core.js`) implements the R package's core logic in JavaScript:

1. **Filter** the dataset by race and pronunciation correctness
2. **Compute** the median value for each selected attribute
3. **Rank** candidates by Euclidean distance to the median vector
4. **Select** the requested number of names:
   - **Control mode**: Names closest to the median (similar to each other)
   - **Vary mode**: Names farthest from the median (diverse from each other)
5. **Sort** results by optional attribute

Results are rendered as an interactive table with options to export as CSV or Excel.

## How to Cite

Kim, J and Crabtree, C. (2022). validatednamesr: R package for viewing, loading, and visualizing the Validated Names for Experimental Studies on Race and Ethnicity datasets.


How to cite

Kim, J and Crabtree, C. (2022). validatednamesr: R package for viewing, loading, and visualizing the Validated Names for Experimental Studies on Race and Ethnicity datasets.
