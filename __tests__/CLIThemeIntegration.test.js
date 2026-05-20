const fs = require( 'fs' );
const os = require( 'os' );
const path = require( 'path' );
const CLI = require( '../lib/CLI' );

function readFile( filePath ) {
	return fs.readFileSync( filePath, 'utf8' );
}

describe( 'CLI theme integration', () => {
	let originalCwd;
	let tmpRoot;

	beforeAll( () => {
		originalCwd = process.cwd();
		tmpRoot = fs.mkdtempSync(
			path.join( os.tmpdir(), 'procyon-cli-theme-' )
		);
		process.chdir( tmpRoot );
	} );

	afterAll( () => {
		process.chdir( originalCwd );
		fs.rmSync( tmpRoot, { recursive: true, force: true } );
		delete process.env.githubAccount;
		delete process.env.updateURI;
	} );

	it( 'scaffolds a real theme through the CLI', () => {
		const cli = new CLI( '1.0.0' );
		const slug = 'cli-theme-test';

		cli.run( [
			'node',
			'index.js',
			'--type',
			'theme',
			slug,
			'--githubAccount',
			'procyon-creative',
		] );

		const outputDir = path.join( tmpRoot, slug );
		const styleCss = path.join( outputDir, 'style.css' );
		const functionsPhp = path.join( outputDir, 'functions.php' );
		const workflow = path.join(
			outputDir,
			'.github',
			'workflows',
			'main.yml'
		);

		expect( fs.existsSync( styleCss ) ).toBe( true );
		expect( fs.existsSync( functionsPhp ) ).toBe( true );
		expect( fs.existsSync( workflow ) ).toBe( true );

		expect( readFile( styleCss ) ).toContain(
			'Text Domain:      cli-theme-test'
		);
		expect( readFile( functionsPhp ) ).toContain(
			'https://github.com/procyon-creative/cli-theme-test/'
		);
		expect( readFile( workflow ) ).toContain(
			'THEME_NAME: cli-theme-test'
		);
	} );
} );
