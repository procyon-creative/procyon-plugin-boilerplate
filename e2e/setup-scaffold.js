const fs = require( 'fs' );
const path = require( 'path' );
const ThemeScaffolder = require( '../lib/ThemeScaffolder' );
const ThemeTemplateConfig = require( '../lib/ThemeTemplateConfig' );

const THEME_SLUG = 'e2e-test-theme';
const WORDPRESS_ROOT = path.resolve( __dirname, '..', 'wordpress' );
const THEMES_ROOT = path.join( WORDPRESS_ROOT, 'wp-content', 'themes' );
const THEME_OUTPUT_DIR = path.join( THEMES_ROOT, THEME_SLUG );

function ensureThemesRoot() {
	fs.mkdirSync( THEMES_ROOT, { recursive: true } );
}

function removeExistingTheme() {
	fs.rmSync( THEME_OUTPUT_DIR, { recursive: true, force: true } );
}

function scaffoldTheme() {
	process.env.githubAccount = 'procyon-creative';

	const config = new ThemeTemplateConfig( THEME_SLUG );
	const scaffolder = new ThemeScaffolder( config, THEME_OUTPUT_DIR );

	ensureThemesRoot();
	removeExistingTheme();
	scaffolder.scaffold();
}

scaffoldTheme();
