const CLI = require( '../lib/CLI' );
const { spawn } = require( 'child_process' );

jest.mock( 'child_process', () => ( {
	spawn: jest.fn().mockReturnValue( {
		on: jest.fn(),
	} ),
} ) );

describe( 'CLI', () => {
	let cli;

	beforeEach( () => {
		cli = new CLI( '1.0.0' );
		jest.clearAllMocks();
		delete process.env.githubAccount;
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
} );
