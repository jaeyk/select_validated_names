
# Create directory
if (!dir.exists("data_prep")) {
  dir.create("data_prep")
}
if (!dir.exists("web-app/public/data")) {
  dir.create("web-app/public/data", recursive = TRUE)
}

# Install packages if missing
if (!requireNamespace("dataverse", quietly = TRUE)) install.packages("dataverse", repos = "https://cloud.r-project.org")
if (!requireNamespace("dplyr", quietly = TRUE)) install.packages("dplyr", repos = "https://cloud.r-project.org")
if (!requireNamespace("jsonlite", quietly = TRUE)) install.packages("jsonlite", repos = "https://cloud.r-project.org")
if (!requireNamespace("readr", quietly = TRUE)) install.packages("readr", repos = "https://cloud.r-project.org")

library(dplyr)
library(jsonlite)

# Source the original package functions
# We need to be careful about environment, but sourcing should work if files are local
source("R/datasets.R")

tryCatch({
  message("Downloading Pooled Data...")
  # The view_data function sets the env var
  pooled <- load_data(file_note = "Pooled")
  
  message("Downloading Names Data...")
  names_df <- load_data(file_name = "names.rds")
  
  message("Processing Data...")
  
  # Standardize column names
  names(pooled) <- tolower(names(pooled))
  names(names_df) <- tolower(names(names_df))
  
  # Calculate stats
  name_pct_correct <- pooled %>%
    group_by(name) %>%
    summarize(mean_correct = mean(correct, na.rm = TRUE), .groups = 'drop')
  
  name_covariates <- pooled %>%
    group_by(name) %>%
    summarize(
      avg_income = mean(income.ord, na.rm = TRUE),
      avg_education = mean(education.ord, na.rm = TRUE),
      avg_citizenship = mean(citizen, na.rm = TRUE),
      .groups = 'drop'
    )
  
  # Join
  final_df <- names_df %>%
    dplyr::select(name, identity) %>%
    left_join(name_pct_correct, by = "name") %>%
    left_join(name_covariates, by = "name") %>%
    distinct() # Ensure uniqueness
    
  message(paste("Total records:", nrow(final_df)))
  
  # Export
  write_json(final_df, "web-app/public/data/full_data.json", pretty = TRUE, auto_unbox = TRUE)
  message("Successfully saved to web-app/public/data/full_data.json")
  
}, error = function(e) {
  message("Error occurred:")
  message(e$message)
  quit(status = 1)
})
