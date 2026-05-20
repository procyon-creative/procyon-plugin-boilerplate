# Procyon Plugin & Theme Boilerplate

[![npm version](https://img.shields.io/npm/v/@procyon-creative/plugin-boilerplate.svg)](https://www.npmjs.com/package/@procyon-creative/plugin-boilerplate)

* Scaffolds WordPress **block plugins** and **block themes**
* Includes an update system using [yahnis-elsts/plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker)
* [GitHub Actions templates](https://github.com/procyon-creative/procyon-plugin-boilerplate/tree/main/templates) to build zip files and releases
* Variants for static and interactive blocks
* E2E test suite with Lando + Playwright

## Description
A starter project to help create new WordPress block plugins and block themes. Includes an update system using [yahnis-elsts/plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) and GitHub Actions to build zip files and releases so you can update right from WordPress.

## Usage

### Prerequisites
1. Composer
2. Node/NPM (>= 20.10.0)
3. A GitHub account

### Creating a Plugin (recommended — from npm)

```bash
npx @procyon-creative/plugin-boilerplate <plugin-slug> --githubAccount <your-github-account>
```

This scaffolds a new block plugin in the `<plugin-slug>` folder using `@wordpress/create-block` under the hood. Add `--interactive` if you want to choose a variant.

### Creating a Theme

```bash
npx @procyon-creative/plugin-boilerplate <theme-slug> --type theme --githubAccount <your-github-account>
```

This scaffolds a new block theme in the `<theme-slug>` folder with:
- `style.css` with theme headers
- `functions.php` with PUC auto-update wiring
- `theme.json` (v3) with default settings
- Block templates (`templates/index.html`) and template parts (`parts/header.html`, `parts/footer.html`)
- GitHub Actions workflow for building release zips
- `composer.json` with PUC dependency

### Installation (from a local clone)

If you want to work on the boilerplate itself or need a custom path:

```bash
git clone git@github.com:procyon-creative/procyon-plugin-boilerplate.git
cd <your-plugins-directory>
export githubAccount=<your-github-account>
npx @wordpress/create-block <plugin-slug> --template=<path-to-cloned-repo> --interactive
```

> [!NOTE]
> The `githubAccount` value is used by the GitHub Action and the updater. The npm-installed CLI accepts `--githubAccount` as a flag; for the local-template path you set it as an env var (`@wordpress/create-block` rejects unknown CLI flags). The convention is that the repo name matches the slug.

If you want to set the plugin URI or repository manually, you can do so in the `plugin.json` file and the main `plugin.php` file:
```json
// plugin.json
{
	"name": "<slug>",
	"version": "0.1.0",
	"download_url": "https://github.com/<your-account>/<slug>/releases/latest/download/<slug>.zip",
	"sections": {
		"description": "An example block from my heart to yours."
	}
}
```
```php
// plugin.php
$myUpdateChecker = PucFactory::buildUpdateChecker(
	'https://github.com/<your-account>/<slug>/', // plugin name must match the folder name
	__FILE__,
	'plugin-test'
);
```

Read more [on the plugin-update-checker page](https://github.com/YahnisElsts/plugin-update-checker?tab=readme-ov-file#github-integration).

### Adding another block to the plugin
You can add another block to the plugin using the `--no-plugin` option by navigating to the `src` folder and running:

```bash
npx @procyon-creative/plugin-boilerplate other --interactive --no-plugin
```

The folder structure is as follows:
```
test
├── src
│   └──blockname
│      ├── block.json
│      ├── ...
│   └──blockname2
│      ├── block.json
│      ├── ...
├── plugin.json <-- needed for update checker
├── readme.txt  <-- needed for update checker
├── ...
```

## Development

> [!NOTE]
> I suggest you make the plugin outside your `wp-content/plugins` folder and symlink it to your `plugins` folder. This way you will not lose your development files when you update the plugin from WordPress. WordPress will delete your plugin's folder before it unzips the new one in that location. I've done that when testing the installation process.

### Local commands

```bash
npm run lint:js              # ESLint via wp-scripts
npm test                     # Jest unit tests
npm run test:e2e:setup       # Scaffold theme into Lando WordPress
npm run test:e2e:playwright  # Run Playwright E2E tests
npm run test:e2e             # Scaffold + Playwright (full E2E)
```

### E2E Testing

The E2E test suite uses [Lando](https://lando.dev/) with the WordPress recipe and [Playwright](https://playwright.dev/) for browser testing. It scaffolds a theme, deploys it to a local WordPress instance, and verifies it renders correctly.

```bash
# Start the Lando environment
lando start

# Scaffold and test
npm run test:e2e
```

### Releasing a new version of this package

This repo uses [release-please](https://github.com/googleapis/release-please) and conventional commits. You don't bump the version manually:

1. Land conventional commits on `main` (e.g. `feat: ...`, `fix: ...`).
2. release-please opens a PR titled `chore(main): release <version>` with the bumped version + auto-generated `CHANGELOG.md`.
3. Merging that PR creates a GitHub release and publishes to npm via OIDC trusted publishing — no `NPM_TOKEN` involved.

### Releasing a new version of a generated plugin

For plugins *created* with this boilerplate, three files must have matching version bumps:

1. `readme.txt` — stable tag
2. `plugin.json` — version field
3. Main plugin PHP file — header comment version

Then tag and push: `git tag v0.1.x -m "message" && git push origin v0.1.x`

The bundled GitHub Action will build the zip and attach it to the release. Any site with the plugin installed will then be able to update from WordPress.

### Releasing a new version of a generated theme

For themes created with this boilerplate, three files must have matching version bumps:

1. `readme.txt` — stable tag
2. `style.css` — Version header
3. `theme.json` — version field (if tracked)

Then tag and push: `git tag v0.1.x -m "message" && git push origin v0.1.x`

The bundled GitHub Action will build the theme zip and attach it to the release. Any site with the theme installed will then be able to update from WordPress.

## TODO
- [x] Create a new block plugin
- [x] Allow multiple blocks per plugin
- [x] CLI wrapper to allow custom options instead of only env variables
- [x] GitHub Action to build the plugin zip file
- [x] Linting (ESLint via wp-scripts)
- [x] Tests (Jest)
- [x] Theme scaffolding with `--type theme`
- [x] E2E test suite (Lando + Playwright)
- [ ] Clean up the variants
- [ ] Test on Windows

### Variants
The default block is based on the interactive block example from the Gutenberg Repository. I plan to move that to the interactive variant so the default block can be basic.
* default
* interactive
* typescript
