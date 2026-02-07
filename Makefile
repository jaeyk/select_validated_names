.PHONY: render serve test

render:
	quarto render quarto-site

serve:
	python3 -m http.server 4000 --directory quarto-site/_site

test:
	cd quarto-site && npm ci && npm test

dev: render serve
