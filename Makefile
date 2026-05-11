
EXE = CandyPopGallery
EXE_MAIN = "./bin/$(EXE)"
EXE_WORKER = "./bin/$(EXE)_worker"

PORT_DEV = 8021
PORT_PROD = 8020

.PHONY: build, build_frontend, run_dev, run, tidy, clean, clean_frontend

build: $(EXE_MAIN) $(EXE_WORKER)

$(EXE_MAIN):
	go build -ldflags="-s -w" -o "$(EXE_MAIN)" ./cmd/app

$(EXE_WORKER):
	go build -o "$(EXE_WORKER)" ./cmd/worker

build_frontend:
	cd frontend && npm run build

run_dev: $(EXE_MAIN)
	./$(EXE_MAIN) --dev --port $(PORT_DEV)

run: $(EXE_MAIN)
	./$(EXE_MAIN)

tidy:
	go mod tidy

clean:
	rm -rf bin

clean_frontend:
	rm -rf frontend/dist

