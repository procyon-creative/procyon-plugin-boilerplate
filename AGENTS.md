# AGENTS.md

## What This Repo Is

An **external template** for `@wordpress/create-block`. It scaffolds WordPress block plugins with auto-update support (via `yahnis-elsts/plugin-update-checker`) and a GitHub Actions release workflow.

This repo is NOT a WordPress plugin itself — it's a template consumed during `npx @wordpress/create-block`.

## Architecture

```
index.js                          Thin entrypoint — instantiates lib/CLI and calls run()
lib/
  CLI.js                          CLI class: intercepts custom args (--githubAccount), sets env vars, spawns npx @wordpress/create-block
  TemplateConfig.js               TemplateConfig class: defaults, variants, transformer, paths
templates/
  index.js                        Exports a TemplateConfig instance — the file @wordpress/create-block actually loads
  block-templates/*.mustache      Per-block files (edit.js, render.php, view.js, styles, etc.)
  plugin-templates/*.mustache     Plugin-level files (main PHP, composer.json, GitHub Actions workflow, plugin.json)
  plugin-assets/                  Static assets copied into generated plugin (icon SVG)
__tests__/                        Jest unit tests for lib/
```

Published to npm as **`@procyon-creative/plugin-boilerplate`** (scoped, public).

## Key Conventions

- **Indent style**: tabs (WordPress coding standards, enforced in `.editorconfig`)
- **Mustache templating**: block/plugin templates use `{{variable}}` syntax
- **GitHub Actions mustache workaround**: `main.yml.mustache` uses `{{=<% %>=}}` to switch delimiters to `<%slug%>`, avoiding conflicts with `${{ }}` GitHub Actions syntax
- **Node**: >= 20.10.0 (`.nvmrc` = 22)
- **No TypeScript source**: the template itself is plain JS; a TS variant exists only for generated blocks (`view.ts.mustache`)

## How Generated Plugins Work

- Blocks live under `src/<slug>/` (set by `folderName: join('src', slug)`) — enables multi-block plugins
- Uses **server-side rendering** (`render.php`), not the JS `save` function
- Default variant includes **WordPress Interactivity API** (`@wordpress/interactivity`)
- Build uses `--experimental-modules` flag (`wp-scripts build --experimental-modules`)
- `prestart`/`prebuild` scripts auto-run `composer install` if no `vendor/` dir
- Plugin registration scans `build/` subdirectories dynamically (see `$slug.php.mustache`)

## Developer Commands

```bash
npm run lint:js     # wp-scripts lint-js
npm test            # Jest unit tests (lib/ + __tests__/)
```

There is no build, start, or typecheck command for this repo itself — it's a template, not a runnable project.

## Conventional Commits

This repo uses **conventional commits** enforced via commitlint + husky:

- `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:` — standard prefixes
- Commit messages are linted on `commit-msg` hook
- JS is linted on `pre-commit` hook via `npm run lint:js`

Branch names should include a Jira key (e.g. `feature/WPB-8-fix-variant-path`).

**NEVER commit directly to `main`.** Always create a feature branch and merge via PR.

## CI/CD

- **ci.yml**: Lints on PRs/pushes to `main`. Uses `procyon-creative/jira-action-man@main` on PRs to extract Jira keys and post to Jira tickets (requires `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` secrets).
- **release-please.yml**: Auto-creates release PRs from conventional commits on `main`. Merging a release PR publishes to npm via trusted publishing (OIDC, no NPM_TOKEN) with provenance.
- **dependabot.yml**: Weekly updates for npm deps and GitHub Actions.

## Version Release Process (for generated plugins)

Three places must have matching version bumps:
1. `readme.txt` — stable tag
2. `plugin.json` — version field
3. Main plugin PHP file — header comment version

Then tag + push: `git tag v0.1.x -m "message" && git push origin v0.1.x`

The GitHub Actions workflow (in the generated plugin) builds the zip and attaches it to the release automatically.

## Things an Agent Might Get Wrong

- **This is not a plugin.** Don't try to run `wp-scripts build` or `wp start` here — those commands belong in the *generated* output.
- **Custom env vars**: The root `index.js` passes `--githubAccount` as an env var (`process.env.githubAccount`) because `@wordpress/create-block` rejects unknown CLI flags. The `transformer` in `templates/index.js` reads it back from `process.env`.
- **Convention: repo name = plugin slug**. The update URI is built as `github.com/<account>/<slug>/` where `<slug>` matches both the folder name and the GitHub repo name.
- **Tests live under `__tests__/`** and cover `lib/CLI.js` and `lib/TemplateConfig.js`. Run with `npm test`.
- **Interactive variant uses the same block templates as default.** Both variants share `blockTemplatesPath: join(__dirname, 'block-templates')`. The interactive variant adds `@wordpress/interactivity` and enables interactivity supports.
