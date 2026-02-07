# Validated Names Selection Tool

A standalone, web-based interface for selecting scientifically validated names for experimental studies on race and ethnicity. This tool replicates the logic of the [`validatednamesr`](https://jaeyk.github.io/validatednamesr/) R package directly in your browser using Vanilla JavaScript.

**[Live Website](https://jaeyk.github.io/select_validated_names/)**

## Features

*   **Parameter-Driven Selection:** Filter names by race/ethnicity, minimum correct identification probability, and other attributes.
*   **Scientific Rigor:** Based on a dataset of 600 names with over 44,000 evaluations (Crabtree et al., 2023).
*   **Flexible Modes:**
    *   **Control Mode:** Select names with similar perceived attributes (income, education, citizenship) to isolate racial signals.
    *   **Vary Mode:** Select names with diverse attributes to study intersectional biases.
*   **Instant Export:** Download your selected list of names as a CSV file.
*   **Privacy-First:** All processing happens in your browser; no data is sent to external servers.

## Usage

1.  **access the Tool:** Visit the [live site](https://jaeyk.github.io/select_validated_names/) or run it locally.
2.  **Configure Parameters:**
    *   **Target Race/Ethnicity:** Asian, Black, Hispanic, or White.
    *   **Min. Correct Prob.:** The minimum probability (0-1) that the name is correctly perceived as the intended group.
    *   **Number of Names:** How many names you want to generate.
    *   **Selection Mode:** `Control` (similar attributes) or `Vary` (diverse attributes) or `Random`.
    *   **Attributes:** Choose which perceptions (Income, Education, Citizenship) to factor into the selection.
3.  **Generate & Download:** Click "Generate Selection" to view results, then "Download CSV" to save them.

## Local Development

To run the site on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jaeyk/select_validated_names.git
    cd select_validated_names
    ```

2.  **Launch the local server:**
    We provide a helper script to launch a lightweight Python HTTP server.
    ```bash
    ./launch_site.sh
    ```
    Open your browser to `http://localhost:8000`.

## Credits & Citation

**Developed by:** [Jae Yeon Kim](https://jaeyk.github.io/) (UNC Chapel Hill)

**Original R Package:** [Jae Yeon Kim](https://jaeyk.github.io/) and [Charles Crabtree](https://charlescrabtree.com/) (Monash University)

If you use this tool or data in your research, please cite:

> Crabtree, C., Kim, J.Y., Gaddis, S.M., Holbein, J.B., Guage, C. & Marx, W.W. (2023). Validated names for experimental studies on race and ethnicity. *Sci Data* 10, 130. https://doi.org/10.1038/s41597-023-01947-0

## Contact

*   **Tool Suggestions/Questions:** [Jae Yeon Kim](mailto:jaekim@unc.edu)
*   **Data Inquiries:** [Charles Crabtree](mailto:charles.crabtree@monash.edu)
