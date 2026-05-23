# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CandyPopGallery is a local web app for browsing media (images, GIFs, videos) downloaded from platforms like Reddit, Twitter, and Instagram. Media is organized into "posts" — a post groups multiple media files by a shared source ID parsed from their filenames. The app has two binaries: a web server and a standalone scan worker.

## Commands

### Backend (Go)

```sh
# Run the web server
go run ./cmd/app

# Run with dev mode (disables browser caching for HTML/JS/CSS)
go run ./cmd/app --dev --port 8020

# Run the scan worker
go run ./cmd/worker

# Build binaries
go build -o ./bin/CandyPopGallery ./cmd/app
go build -o ./bin/CandyPopGallery_worker ./cmd/worker

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
- **`cmd/worker`** — Runs the media scan pipeline standalone (no HTTP server). Useful for handling backend (tasks which would normally be done via frontend dashboard) in the terminal.

### Config (`APP_DATA_DIR/CandyPopGallery/config.yaml`)

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

### Frontend (`frontend/`)

React 19 + TypeScript + Tailwind v4 + Vite. Claude writes the frontend in manageable steps; the user handles most of the Go backend.

**Stack notes:** Tailwind v4 (no config file; CSS-first). CSS custom properties in `index.css` define all design tokens (`--bg`, `--bg2`, `--border`, `--accent`, `--ok`, `--warn`, etc.) for both light and dark themes. Tailwind classes reference them via `[var(--token)]` syntax.

**Layout:** Fixed top header with logo (left), primary nav tabs (left), and a right-side cluster (quick-scan button, backend activity indicator, Dashboard pill). The header is the only persistent chrome — no bottom nav, no persistent sidebar. A `/setup` route handles initial configuration; the root loader redirects there if setup is incomplete.

**Primary nav tabs (left of header):** Home · Posts · Media · Discover · Library. Library has a hover dropdown and, when active, a left sidebar for its subpages (Favourites, Collections, Tags, Comments, View History).

**Dashboard (right of header, pill button):** Also has a hover dropdown. When active, shows a left sidebar for its subpages (Backend, Configure, Settings, Logs). Dashboard is intentionally separated from the main tabs — it's an admin/utility area, not content browsing.

**Routing:** `createBrowserRouter` with nested routes. Every navigation (including sidebar subpages) pushes a history entry. Library and Dashboard subpages use a shared `SidebarLayout` component. Future search state should use `useSearchParams` to keep searches in browser history.

**Home page:** Displays post/media statistics and a contextual warning banner if no media folders are configured.

**Design direction:** Minimal and unobtrusive. Content should dominate; chrome should recede. The mockup in `mockups/layout.html` is the canonical visual reference for the overall layout.
