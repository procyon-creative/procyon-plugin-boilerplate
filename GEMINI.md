# GEMINI.md

## Project Overview
**Procyon Plugin Boilerplate** is an external template for the `@wordpress/create-block` tool. Its purpose is to scaffold WordPress block plugins with built-in support for:
- **Auto-updates:** Integrated via `yahnis-elsts/plugin-update-checker`.
- **GitHub Actions Releases:** Automates building zip files and creating GitHub releases.
- **Multi-block Architecture:** Blocks are scaffolded under `src/<slug>/`, allowing a single plugin to contain multiple blocks.
- **Interactivity API:** Default support for the WordPress Interactivity API in the `interactive` variant.

**Note:** This repository is a **template**, not a runnable WordPress plugin itself. Commands like `wp-scripts build` should be run in the *generated* plugin, not here.

## Core Architecture
- `index.js`: A CLI wrapper that intercepts custom flags (like `--githubAccount`), sets them as environment variables, and then spawns `npx @wordpress/create-block`.
- `templates/index.js`: The main configuration file for the `@wordpress/create-block` external template. It defines default values, variants, and a `transformer` to inject custom logic.
- `templates/block-templates/`: Mustache templates for block-specific files (PHP, JS, SCSS).
- `templates/plugin-templates/`: Mustache templates for plugin-level files (Main PHP, GitHub workflows, `plugin.json`).
- `templates/plugin-assets/`: Static assets (like icons) copied into the generated plugin.

## Development Conventions
- **Code Style:** Tabs for indentation (WordPress standards), enforced via `.editorconfig`.
- **Templating:** Uses Mustache (`{{variable}}`).
  - **Special Case:** `main.yml.mustache` uses `{{=<% %>=}}` to change delimiters to `<%slug%>` to avoid conflicts with GitHub Actions syntax `${{ }}`.
- **Commits:** Conventional Commits are enforced via `commitlint` and `husky`.
- **Branching:** Use feature branches (e.g., `feature/WPB-8-fix-variant-path`) and merge via PR. Never commit directly to `main`.
- **Version Management:** For generated plugins, versions must be manually synced in `readme.txt`, `plugin.json`, and the main PHP file header.

## Building and Running
As this is a template, the "building" happens when it is consumed to create a new plugin.

### Scaffolding a New Plugin
```bash
export GITHUB_ACCOUNT=your-username
npx @wordpress/create-block <plugin-slug> --template=<path-to-this-repo> --interactive
```
*Note: The CLI wrapper allows using `--githubAccount your-username` instead of the environment variable.*

### Adding a Block to an Existing Plugin
```bash
npx @wordpress/create-block <block-slug> --template=<path-to-this-repo> --interactive --no-plugin
```

### Local Commands (This Repo)
- `npm run lint:js`: Runs `wp-scripts lint-js` on the repository's JavaScript files.
- `npm test`: Runs unit tests using Jest. The project uses an OOP structure with logic encapsulated in the `lib/` directory.

## TODO / Future Work
- [ ] Add a wrapper to allow custom options instead of relying on environment variables.
- [x] Complete the initial unit test suite (Jest is configured, tests cover CLI and TemplateConfig classes).
- [ ] Clean up and refine template variants.
- [ ] Add linting for PHP and CSS files.
