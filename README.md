# Procyon Plugin Boilerplate

[![npm version](https://img.shields.io/npm/v/@procyon-creative/plugin-boilerplate.svg)](https://www.npmjs.com/package/@procyon-creative/plugin-boilerplate)

* Includes an update system using [yahnis-elsts/plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker)
* [GitHub Actions template](https://github.com/procyon-creative/procyon-plugin-boilerplate/tree/main/templates/plugin-templates/.github/workflows) to build zip files and releases
* Variants for static and interactive blocks

## Description
A starter project to help create a new WordPress Block Plugin. I found myself doing some of the same tasks over and over. This includes an update system using [yahnis-elsts/plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) and a GitHub action to build zip files and releases so you can update the plugin right from WordPress.

## Usage

### Prerequisites
1. Composer
2. Node/NPM (>= 20.10.0)
3. A GitHub account

### Installation (recommended — from npm)

```bash
npx @procyon-creative/plugin-boilerplate <plugin-slug> --githubAccount <your-github-account>
```

This scaffolds a new block plugin in the `<plugin-slug>` folder using `@wordpress/create-block` under the hood. Add `--interactive` if you want to choose a variant.

### Installation (from a local clone)

If you want to work on the boilerplate itself or need a custom path:

```bash
git clone git@github.com:procyon-creative/procyon-plugin-boilerplate.git
cd <your-plugins-directory>
export githubAccount=<your-github-account>
npx @wordpress/create-block <plugin-slug> --template=<path-to-cloned-repo> --interactive
```

> [!NOTE]
> The `githubAccount` value is used by the GitHub Action and the plugin updater. The npm-installed CLI accepts `--githubAccount` as a flag; for the local-template path you set it as an env var (`@wordpress/create-block` rejects unknown CLI flags). The convention is that the plugin's GitHub repo name matches its slug.

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
npm run lint:js   # ESLint via wp-scripts
npm test          # Jest unit tests
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

## TODO
- [x] Create a new block plugin
- [x] Allow multiple blocks per plugin
- [x] CLI wrapper to allow custom options instead of only env variables
- [x] GitHub Action to build the plugin zip file
- [x] Linting (ESLint via wp-scripts)
- [x] Tests (Jest)
- [ ] Clean up the variants
- [ ] Test on Windows

### Variants
The default block is based on the interactive block example from the Gutenberg Repository. I plan to move that to the interactive variant so the default block can be basic.
* default
* interactive
* typescript
