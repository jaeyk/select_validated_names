OWNER ?= your-org
REPO ?= your-repo
TAG ?= latest
SHORT_SHA := $(shell git rev-parse --short=8 HEAD 2>/dev/null || echo local)
IMAGE = ghcr.io/$(OWNER)/$(REPO):$(TAG)

.PHONY: build-image push-image run stop render serve compose-up compose-down

.PHONY: test-js test-cors

test-js:
	cd quarto-site && npm ci && npm test

test-cors:
	./scripts/test_cors.sh

build-image:
	docker build -t $(IMAGE) .

push-image:
	# Requires GHCR login (docker login ghcr.io)
	docker buildx build --push \
		--tag ghcr.io/$(OWNER)/$(REPO):$(TAG) \
		--tag ghcr.io/$(OWNER)/$(REPO):$(SHORT_SHA) .

run:
	docker run --rm --name select-names-plumber -p 8000:8000 $(IMAGE)

stop:
	-docker rm -f select-names-plumber || true

render:
	quarto render quarto-site

serve:
	python3 -m http.server 4000 --directory quarto-site/_site

compose-up:
	docker-compose up -d --build

compose-down:
	docker-compose down
