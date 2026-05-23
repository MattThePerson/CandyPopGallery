
# OS dependent things
ifeq ($(OS),Windows_NT)
	SUFF := .exe
	CMD_RM := rmdir /s /q
else
	SUFF :=
	CMD_RM := rm -rf
endif


# binaries
EXE = CandyPopGallery
EXE_MAIN = bin/$(EXE)$(SUFF)
EXE_WORKER = bin/$(EXE)_worker$(SUFF)

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
	go build -ldflags="-s -w" -o "$(EXE_MAIN)" ./cmd/app

build_worker:
	go build -o "$(EXE_WORKER)" ./cmd/worker

build_frontend:
	cd frontend && npm run build

run_dev:
	go run ./cmd/app --dev --port $(PORT_DEV)

run:
	go run ./cmd/app

tidy:
	go mod tidy

clean:
	$(CMD_RM) bin

clean_frontend:
	 -$(CMD_RM) frontend/dist
