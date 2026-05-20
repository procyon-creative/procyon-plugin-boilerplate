const fs = require( 'fs' );
const path = require( 'path' );
const ThemeScaffolder = require( '../lib/ThemeScaffolder' );
const ThemeTemplateConfig = require( '../lib/ThemeTemplateConfig' );

const TMP_ROOT = path.join( __dirname, '__tmp_scaffolder__' );

function scaffoldToTmp( slug, extraEnv ) {
	const outputDir = path.join( TMP_ROOT, slug );

	fs.rmSync( outputDir, { recursive: true, force: true } );

	process.env.githubAccount = 'procyon-creative';
	if ( extraEnv ) {
		Object.assign( process.env, extraEnv );
	}

	const config = new ThemeTemplateConfig( slug );
	const scaffolder = new ThemeScaffolder( config, outputDir );
	scaffolder.scaffold();

	return outputDir;
}

function readFile( dir, relativePath ) {
	return fs.readFileSync( path.join( dir, relativePath ), 'utf8' );
}

function listAllFiles( dir, base ) {
	base = base || '';
	const results = [];
	for ( const entry of fs.readdirSync( dir, { withFileTypes: true } ) ) {
		const rel = base ? `${ base }/${ entry.name }` : entry.name;
		if ( entry.isDirectory() ) {
			results.push(
				...listAllFiles( path.join( dir, entry.name ), rel )
			);
		} else {
			results.push( rel );
		}
	}
	return results.sort();
}

describe( 'ThemeScaffolder (real filesystem)', () => {
	let outputDir;

	beforeAll( () => {
		fs.mkdirSync( TMP_ROOT, { recursive: true } );
		outputDir = scaffoldToTmp( 'test-theme' );
	} );

	afterAll( () => {
		fs.rmSync( TMP_ROOT, { recursive: true, force: true } );
		delete process.env.githubAccount;
		delete process.env.updateURI;
	} );

	it( 'creates all expected files', () => {
		const files = listAllFiles( outputDir );
		expect( files ).toContain( 'style.css' );
		expect( files ).toContain( 'functions.php' );
		expect( files ).toContain( 'theme.json' );
		expect( files ).toContain( 'index.php' );
		expect( files ).toContain( 'readme.txt' );
		expect( files ).toContain( 'composer.json' );
		expect( files ).toContain( '.editorconfig' );
		expect( files ).toContain( '.gitignore' );
		expect( files ).toContain( 'screenshot.png' );
		expect( files ).toContain( 'parts/header.html' );
		expect( files ).toContain( 'parts/footer.html' );
		expect( files ).toContain( 'templates/index.html' );
		expect( files ).toContain( '.github/workflows/main.yml' );
	} );

	it( 'has no .mustache extensions in output', () => {
		const files = listAllFiles( outputDir );
		for ( const f of files ) {
			expect( f ).not.toMatch( /\.mustache$/ );
		}
	} );

	it( 'renders theme name in style.css', () => {
		const css = readFile( outputDir, 'style.css' );
		expect( css ).toContain( 'Theme Name:       Example Theme' );
		expect( css ).toContain( 'Text Domain:      test-theme' );
		expect( css ).toContain( 'Tags:             block-theme' );
	} );

	it( 'renders description in style.css', () => {
		const css = readFile( outputDir, 'style.css' );
		expect( css ).toContain(
			'Description:      An example WordPress block theme.'
		);
	} );

	it( 'renders author in style.css', () => {
		const css = readFile( outputDir, 'style.css' );
		expect( css ).toContain(
			'Author:           Procyon Creative - theme builder'
		);
	} );

	it( 'renders PUC update checker in functions.php with githubAccount', () => {
		const php = readFile( outputDir, 'functions.php' );
		expect( php ).toContain(
			'https://github.com/procyon-creative/test-theme/'
		);
		expect( php ).toContain( 'PucFactory::buildUpdateChecker' );
		expect( php ).toContain( "'test-theme'" );
	} );

	it( 'references functions.php __FILE__ for theme updates', () => {
		const php = readFile( outputDir, 'functions.php' );
		expect( php ).toMatch( /__FILE__/ );
	} );

	it( 'loads composer autoload in functions.php', () => {
		const php = readFile( outputDir, 'functions.php' );
		expect( php ).toContain(
			"require_once __DIR__ . '/vendor/autoload.php'"
		);
	} );

	it( 'uses updateURI when set instead of github fallback', () => {
		const customDir = scaffoldToTmp( 'uri-theme', {
			updateURI: 'https://custom.example.com/update',
		} );
		const php = readFile( customDir, 'functions.php' );
		expect( php ).toContain( 'https://custom.example.com/update' );
		expect( php ).not.toContain(
			'https://github.com/procyon-creative/uri-theme/'
		);
	} );

	it( 'renders valid theme.json', () => {
		const json = readFile( outputDir, 'theme.json' );
		const parsed = JSON.parse( json );
		expect( parsed.version ).toBe( 3 );
		expect( parsed.settings.appearanceTools ).toBe( true );
		expect( parsed.templateParts ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( { name: 'header', area: 'header' } ),
				expect.objectContaining( { name: 'footer', area: 'footer' } ),
			] )
		);
	} );

	it( 'renders readme.txt with theme title and stable tag', () => {
		const readme = readFile( outputDir, 'readme.txt' );
		expect( readme ).toContain( '=== Example Theme ===' );
		expect( readme ).toContain( 'Stable tag:        0.1.0' );
		expect( readme ).toContain( 'Tested up to:      6.7' );
	} );

	it( 'renders composer.json with PUC dependency', () => {
		const json = readFile( outputDir, 'composer.json' );
		const parsed = JSON.parse( json );
		expect( parsed.require ).toHaveProperty(
			'yahnis-elsts/plugin-update-checker'
		);
	} );

	it( 'renders header.html template part', () => {
		const html = readFile( outputDir, 'parts/header.html' );
		expect( html ).toContain( 'site-header' );
		expect( html ).toContain( '<!-- wp:site-title /-->' );
	} );

	it( 'renders footer.html template part', () => {
		const html = readFile( outputDir, 'parts/footer.html' );
		expect( html ).toContain( 'site-footer' );
		expect( html ).toContain( 'Proudly powered by' );
	} );

	it( 'renders templates/index.html', () => {
		const html = readFile( outputDir, 'templates/index.html' );
		expect( html.length ).toBeGreaterThan( 0 );
	} );

	it( 'renders GitHub Actions workflow with slug', () => {
		const yml = readFile( outputDir, '.github/workflows/main.yml' );
		expect( yml ).toContain( 'THEME_NAME: test-theme' );
		expect( yml ).toContain( 'Build and Zip WordPress Theme' );
	} );

	it( 'GitHub Actions workflow does not contain mustache delimiters', () => {
		const yml = readFile( outputDir, '.github/workflows/main.yml' );
		expect( yml ).not.toContain( '<%' );
		expect( yml ).not.toContain( '%>' );
		expect( yml ).toContain( '${{ github.ref_name }}' );
	} );

	it( 'copies screenshot.png from theme-assets', () => {
		const stat = fs.statSync( path.join( outputDir, 'screenshot.png' ) );
		expect( stat.size ).toBeGreaterThan( 0 );
	} );

	it( 'throws if config has no getConfig method', () => {
		expect( () =>
			new ThemeScaffolder( {}, '/tmp/nowhere' ).scaffold()
		).toThrow( 'config object with a getConfig() method' );
	} );

	it( 'throws if config has no transformer method', () => {
		const bad = {
			getConfig: () => ( { defaultValues: { slug: 'x' } } ),
		};
		expect( () =>
			new ThemeScaffolder( bad, '/tmp/nowhere' ).scaffold()
		).toThrow( 'transformer' );
	} );

	it( 'throws if output dir is empty string', () => {
		const config = new ThemeTemplateConfig( 'bad' );
		const s = new ThemeScaffolder( config, '' );
		expect( () => s.scaffold() ).toThrow( 'valid output directory' );
	} );

	it( 'uses the correct slug for a different theme name', () => {
		const dir2 = scaffoldToTmp( 'my-cool-theme' );
		const css = readFile( dir2, 'style.css' );
		expect( css ).toContain( 'Text Domain:      my-cool-theme' );

		const php = readFile( dir2, 'functions.php' );
		expect( php ).toContain( "'my-cool-theme'" );
	} );
} );
