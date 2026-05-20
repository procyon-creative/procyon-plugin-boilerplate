const CLI = require( '../lib/CLI' );
const { spawn } = require( 'child_process' );
const ThemeScaffolder = require( '../lib/ThemeScaffolder' );

jest.mock( 'child_process', () => ( {
	spawn: jest.fn().mockReturnValue( {
		on: jest.fn(),
	} ),
} ) );

jest.mock( '../lib/ThemeScaffolder', () =>
	jest.fn().mockImplementation( () => ( {
		scaffold: jest.fn(),
	} ) )
);

describe( 'CLI', () => {
	let cli;

	beforeEach( () => {
		cli = new CLI( '1.0.0' );
		jest.clearAllMocks();
		delete process.env.githubAccount;
		delete process.env.type;
	} );

	it( 'should parse --githubAccount correctly', () => {
		const argv = [ 'node', 'index.js', '--githubAccount', 'nick' ];
		const finalArgv = cli.parseArgs( argv );

		expect( process.env.githubAccount ).toBe( 'nick' );
		expect( finalArgv ).not.toContain( '--githubAccount' );
		expect( finalArgv ).not.toContain( 'nick' );
	} );

	it( 'should parse -g correctly', () => {
		const argv = [ 'node', 'index.js', '-g', 'nick' ];
		const finalArgv = cli.parseArgs( argv );

		expect( process.env.githubAccount ).toBe( 'nick' );
		expect( finalArgv ).not.toContain( '-g' );
		expect( finalArgv ).not.toContain( 'nick' );
	} );

	it( 'should pass through other arguments', () => {
		const argv = [ 'node', 'index.js', 'my-block', '--interactive' ];
		const finalArgv = cli.parseArgs( argv );

		expect( finalArgv ).toContain( 'my-block' );
		expect( finalArgv ).toContain( '--interactive' );
	} );

	it( 'should call spawn with npx create-block', () => {
		const argv = [ 'node', 'index.js', 'test-block' ];
		cli.run( argv );

		expect( spawn ).toHaveBeenCalledWith(
			'npx',
			[ '@wordpress/create-block', 'test-block' ],
			{ stdio: 'inherit' }
		);
	} );

	it( 'should parse --type theme and remove it from the final argv', () => {
		const argv = [ 'node', 'index.js', '--type', 'theme', 'my-theme' ];
		const finalArgv = cli.parseArgs( argv );

		expect( cli.type ).toBe( 'theme' );
		expect( finalArgv ).toEqual( [ 'node', 'index.js', 'my-theme' ] );
	} );

	it( 'should not spawn create-block when running with --type theme', () => {
		const argv = [ 'node', 'index.js', '--type', 'theme', 'my-theme' ];

		cli.run( argv );

		expect( spawn ).not.toHaveBeenCalled();
	} );

	it( 'should use ThemeScaffolder when running with --type theme', () => {
		const argv = [ 'node', 'index.js', '--type', 'theme', 'my-theme' ];

		cli.run( argv );

		expect( ThemeScaffolder ).toHaveBeenCalledTimes( 1 );
		expect(
			ThemeScaffolder.mock.results[ 0 ].value.scaffold
		).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should keep plugin behavior when running with --type plugin', () => {
		const argv = [ 'node', 'index.js', '--type', 'plugin', 'test-block' ];

		cli.run( argv );

		expect( spawn ).toHaveBeenCalledWith(
			'npx',
			[ '@wordpress/create-block', 'test-block' ],
			{ stdio: 'inherit' }
		);
	} );
} );
