publish:
	bun run build:prod
	bun publish
	# Extract version from package.json
	VERSION=$(shell grep '"version"' package.json | head -1 | sed 's/[^0-9.]*\([0-9.]*\).*/\1/')
	MAJOR=$(shell echo $$VERSION | cut -d. -f1)
	MINOR=$(shell echo $$VERSION | cut -d. -f2)
	PATCH=$(shell echo $$VERSION | cut -d. -f3)
	PKG=@naper/embed-components
	# Purge jsdelivr CDN for all tags
	curl -X GET "https://purge.jsdelivr.net/npm/$$PKG@latest"
	curl -X GET "https://purge.jsdelivr.net/npm/$$PKG@$$MAJOR"
	curl -X GET "https://purge.jsdelivr.net/npm/$$PKG@$$MAJOR.$$MINOR"
	curl -X GET "https://purge.jsdelivr.net/npm/$$PKG@$$MAJOR.$$MINOR.$$PATCH"

tag-major:
	@if [ "$(shell git branch --show-current)" != "main" ]; then \
	  echo "You must be on the main branch to tag a release."; exit 1; \
	fi
	@OLD_VERSION=$(shell grep '"version"' package.json | head -1 | sed 's/[^0-9.]*\([0-9.]*\).*/\1/'); \
	MAJOR=$$(echo $$OLD_VERSION | cut -d. -f1); \
	NEW_VERSION=$$(($$MAJOR + 1)).0.0; \
	sed -i "s/\(\"version\" *: *\)\"[0-9.]*\"/\1\"$$NEW_VERSION\"/" package.json; \
	git add package.json; \
	git commit -m "chore: bump version to $$NEW_VERSION"; \
	git tag v$$NEW_VERSION; \
	git push && git push --tags; \
	$(MAKE) publish

tag-minor:
	@if [ "$(shell git branch --show-current)" != "main" ]; then \
	  echo "You must be on the main branch to tag a release."; exit 1; \
	fi
	@OLD_VERSION=$(shell grep '"version"' package.json | head -1 | sed 's/[^0-9.]*\([0-9.]*\).*/\1/'); \
	MAJOR=$$(echo $$OLD_VERSION | cut -d. -f1); \
	MINOR=$$(echo $$OLD_VERSION | cut -d. -f2); \
	NEW_VERSION=$$MAJOR.$$(($$MINOR + 1)).0; \
	sed -i "s/\(\"version\" *: *\)\"[0-9.]*\"/\1\"$$NEW_VERSION\"/" package.json; \
	git add package.json; \
	git commit -m "chore: bump version to $$NEW_VERSION"; \
	git tag v$$NEW_VERSION; \
	git push && git push --tags; \
	$(MAKE) publish

tag-patch:
	@if [ "$(shell git branch --show-current)" != "main" ]; then \
	  echo "You must be on the main branch to tag a release."; exit 1; \
	fi
	@OLD_VERSION=$(shell grep '"version"' package.json | head -1 | sed 's/[^0-9.]*\([0-9.]*\).*/\1/'); \
	MAJOR=$$(echo $$OLD_VERSION | cut -d. -f1); \
	MINOR=$$(echo $$OLD_VERSION | cut -d. -f2); \
	PATCH=$$(echo $$OLD_VERSION | cut -d. -f3); \
	NEW_VERSION=$$MAJOR.$$MINOR.$$(($$PATCH + 1)); \
	sed -i "s/\(\"version\" *: *\)\"[0-9.]*\"/\1\"$$NEW_VERSION\"/" package.json; \
	git add package.json; \
	git commit -m "chore: bump version to $$NEW_VERSION"; \
	git tag v$$NEW_VERSION; \
	git push && git push --tags; \
	$(MAKE) publish
