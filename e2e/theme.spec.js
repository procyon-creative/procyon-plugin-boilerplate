const fs = require( 'fs' );
const path = require( 'path' );
const { execFileSync } = require( 'child_process' );
const { test, expect } = require( '@playwright/test' );

const LANDO_EXECUTABLE = process.env.LANDO || 'lando';
const THEME_SLUG = 'e2e-test-theme';
const SCREENSHOT_DIR = path.join( __dirname, 'screenshots' );
const SCREENSHOT_PATH = path.join( SCREENSHOT_DIR, 'homepage.png' );
const PHP_ERROR_PATTERN =
	/(Fatal error|Parse error|Warning:|Notice:|Deprecated:|There has been a critical error on this website)/i;

function runLandoWp( args ) {
	execFileSync( LANDO_EXECUTABLE, [ 'wp', ...args ], {
		cwd: path.resolve( __dirname, '..' ),
		stdio: 'inherit',
	} );
}

function ensureWordPressIsInstalled() {
	try {
		runLandoWp( [ 'core', 'is-installed' ] );
	} catch {
		runLandoWp( [ 'core', 'download', '--skip-content', '--force' ] );
		runLandoWp( [
			'config',
			'create',
			'--dbname=wordpress',
			'--dbuser=wordpress',
			'--dbpass=wordpress',
			'--dbhost=database',
			'--skip-check',
			'--force',
		] );
		runLandoWp( [
			'core',
			'install',
			'--url=http://e2e-test.lndo.site',
			'--title=E2E Test Site',
			'--admin_user=admin',
			'--admin_password=password',
			'--admin_email=admin@example.com',
			'--skip-email',
		] );
	}
}

test.beforeAll( () => {
	ensureWordPressIsInstalled();
	runLandoWp( [ 'theme', 'activate', THEME_SLUG ] );
	fs.mkdirSync( SCREENSHOT_DIR, { recursive: true } );
} );

test( 'scaffolded block theme is active and renders the homepage', async ( {
	page,
} ) => {
	const response = await page.goto( '/', { waitUntil: 'domcontentloaded' } );

	expect( response ).not.toBeNull();
	expect( response.status() ).toBe( 200 );

	await expect( page.locator( '.site-header' ) ).toBeVisible();
	await expect( page.locator( '.site-footer' ) ).toBeVisible();
	await expect( page.locator( 'body' ) ).toContainText(
		'Proudly powered by WordPress.'
	);

	const pageContent = await page.content();

	expect( pageContent ).not.toMatch( PHP_ERROR_PATTERN );

	await page.screenshot( {
		path: SCREENSHOT_PATH,
		fullPage: true,
	} );
} );
