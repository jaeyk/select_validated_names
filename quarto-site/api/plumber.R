#!/usr/bin/env Rscript
library(plumber)
library(jsonlite)

#* Health check
#* @get /health
function() {
  list(status = "ok")
}

#* CORS filter
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (identical(req$REQUEST_METHOD, "OPTIONS")) {
    res$status <- 200
    return(list())
  }
  plumber::forward()
}

#* Create an RDS file from provided rows
#* @post /rds
#* @serializer contentType list(type = "application/octet-stream")
function(req, res) {
  body <- tryCatch(jsonlite::fromJSON(req$postBody, simplifyVector = FALSE), error = function(e) NULL)
  if (is.null(body) || is.null(body$rows)) {
    res$status <- 400
    return(list(error = "Request must include JSON body with a 'rows' array."))
  }

  rows <- body$rows
  df <- tryCatch(as.data.frame(rows, stringsAsFactors = FALSE), error = function(e) NULL)
  if (is.null(df)) {
    res$status <- 400
    return(list(error = "Unable to coerce 'rows' to a data.frame."))
  }

  fname <- if (!is.null(body$filename)) body$filename else "selected_names.rds"
  tmp <- tempfile(fileext = ".rds")
  saveRDS(df, tmp)

  bin <- readBin(tmp, what = "raw", n = file.info(tmp)$size)
  res$setHeader("Content-Disposition", paste0('attachment; filename="', fname, '"'))
  res$setHeader("Content-Type", "application/octet-stream")
  return(bin)
}

# Run if executed directly
if (identical(environment(), globalenv())) {
  pr <- plumber::plumb(file = "./quarto-site/api/plumber.R")
  pr$run(host = "0.0.0.0", port = 8000)
}
