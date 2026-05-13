
EXE = CandyPopGallery
EXE_MAIN = bin/$(EXE)
EXE_WORKER = bin/$(EXE)_worker

PORT_DEV = 8021
PORT_PROD = 8020

.PHONY: all build_all build build_frontend run_dev run tidy clean clean_frontend install

all: build_all

install:
	go mod download
	cd frontend && npm install

build_all: build build_frontend

build: build_main build_worker

build_main:
	go build -ldflags="-s -w" -o "$(EXE_MAIN)" .

build_worker:
	go build -o "$(EXE_WORKER)" ./cmd/worker

build_frontend:
	cd frontend && npm run build

run_dev:
	go run . --dev --port $(PORT_DEV)

run:
	go run .

tidy:
	go mod tidy

clean:
	rm -rf bin

clean_frontend:
	rm -rf frontend/dist

