FROM rstudio/plumber:latest

# Copy repo
WORKDIR /home/plumber/app
COPY . /home/plumber/app

# Install required R packages
RUN R -e "install.packages(c('jsonlite','readr','dplyr','stringr','remotes','plumber'), repos='https://cloud.r-project.org')"
RUN R -e "try(remotes::install_local('/home/plumber/app', upgrade = 'never', dependencies = FALSE), silent=TRUE)"

EXPOSE 8000

CMD ["R", "-e", "pr <- plumber::plumb('quarto-site/api/plumber.R'); pr$run(host='0.0.0.0', port=8000)"]
