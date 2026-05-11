# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CandyPopGallery is a local web app for browsing media (images, GIFs, videos) downloaded from platforms like Reddit, Twitter, and Instagram. Media is organized into "posts" — a post groups multiple media files by a shared source ID parsed from their filenames. The app has two binaries: a web server and a standalone scan worker.

## Commands

### Backend (Go)

```sh
# Run the web server (reads config.yaml from CWD)
go run ./cmd/app

# Run with dev mode (disables browser caching for HTML/JS/CSS)
go run ./cmd/app --dev --port 8020

# Run the scan worker
go run ./cmd/worker

# Build binaries
go build -o ./bin/App ./cmd/app
go build -o ./bin/Worker ./cmd/worker

# Build (PowerShell, from project root)
.\tools\build_and_run.ps1
```

### Frontend (Vite + React)

```sh
cd frontend

npm install
npm run dev      # dev server on port 1235
npm run build    # build to frontend/dist/ (consumed by Go server)
```

In production the Go server serves `frontend/dist/` as static files.

## Architecture

### Two binaries

- **`cmd/app`** — Echo HTTP server (default port 8020). Serves the built frontend from `frontend/dist/` and will expose REST API routes (see `NOTES.md` for planned routes). Reads `config.yaml` at startup.
- **`cmd/worker`** — Runs the media scan pipeline standalone (no HTTP server). Useful for bulk ingestion before starting the app.

### Config (`config.yaml`)

Two keys:
- `filename_formats` — ordered list of `string_parser` patterns used to extract metadata from filenames.
- `media_folders` — absolute paths to scan for media.

Custom `filename_formats.txt` can be placed inside a scanned folder (or its `.metadata/` subdirectory) to override the global formats for that folder.

### Scan pipeline (`internal/scan/`)

Three steps in `ScanMediaDirs`:
1. Walk `media_folders`, collect all files matching `MediaSuffixes`.
2. Group files into `PostFiles` objects by extracting a `sid` (source ID) from each filename. Post ID = `lowercase(source) + "-" + sid`.
3. For each new post, parse the filename with a `string_parser.StringParser` to get structured metadata, merge with any sidecar JSON metadata, then construct `models.PostData`.

### Data model (`internal/models/posts.go`)

- **`PostData`** — one record per post. `PostID = source + "-" + source_id`. Contains title, upload date, source, community, tags, likes, and a slice of `MediaData`.
- **`MediaData`** — one record per file. `MediaID = postID + "-" + itemNum`. Stores relative path, suffix, type (`image`/`video`), and filesize.

### Database (`internal/db/`)

SQLite (via `modernc.org/sqlite`, WAL mode). Two helpers cover the primary pattern: serialized-JSON tables where each row is `(id TEXT, data TEXT)`. Generic functions `ReadSerializedRowFromTable[S]`, `ReadSerializedMapFromTable[S]`, and `WriteSerializedRowToTable[S]` handle marshal/unmarshal automatically. `InsertDataIntoTable` handles flat column maps.

### TF-IDF (`internal/tfidf/`)

`GetSimilarPost` computes post similarity by scoring shared tokens (tags). Consumes prebuilt `id→tokens` and `token→ids` maps; the generation step is triggered via an admin API route.

### Frontend (`frontend/`)

_to be rewritten in React_
