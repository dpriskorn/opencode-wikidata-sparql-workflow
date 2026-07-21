# Justfile for opencode-wikidata-sparql-workflow

# Install the plugin to opencode
install:
    bun run bin/install.ts install

# Uninstall the plugin from opencode
uninstall:
    bun run bin/install.ts uninstall

# Reinstall plugin (remove then add)
reinstall: uninstall install

# Run linter
lint:
    npm run lint

# Fix linting issues
lint-fix:
    npm run lint:fix

# Format code
format:
    npm run format

# Type check
typecheck:
    npm run typecheck

# Run all checks (lint + typecheck)
check: lint typecheck
    echo "All checks passed!"

# Run tests
test:
    npm test

# Build/lint/typecheck all in one
ci: lint typecheck test
    echo "CI passed!"

# Watch mode (if supported)
watch:
    echo "No watch mode configured"

# Development: link package for local development
dev-install:
    npm link

# Development: unlink package
dev-unlink:
    npm unlink

# Bump version (patch)
bump-patch:
    npm version patch

# Bump version (minor)
bump-minor:
    npm version minor

# Bump version (major)
bump-major:
    npm version major
