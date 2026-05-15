const { spawn } = require( 'child_process' );
const program = require( 'commander' );

class CLI {
	constructor( version ) {
		this.version = version;
		this.defaultValues = {
			updateURI: undefined,
			githubAccount: undefined,
		};
	}

	parseArgs( argv ) {
		program
			.allowUnknownOption()
			.version( this.version )
			.description( 'Create a new WordPress block' )
			.option( '-g, --githubAccount <slug>', 'Your GitHub account name' )
			.parse( argv );

		const options = program.opts();
		const handledKeys = Object.keys( this.defaultValues );

		// Set env vars
		if ( options.githubAccount ) {
			process.env.githubAccount = options.githubAccount;
		}

		const finalArgv = [];
		for ( let i = 0; i < argv.length; i++ ) {
			const arg = argv[ i ];

			// Check if this is a handled flag
			const isHandledFlag =
				arg === '-g' ||
				handledKeys.some(
					( key ) =>
						arg === `--${ key }` || arg.startsWith( `--${ key }=` )
				);

			if ( isHandledFlag ) {
				// If it's just the flag (not flag=value), skip the next arg (the value)
				if (
					! arg.includes( '=' ) &&
					i + 1 < argv.length &&
					! argv[ i + 1 ].startsWith( '-' )
				) {
					i++;
				}
				continue;
			}

			finalArgv.push( arg );
		}

		return finalArgv;
	}

	run( argv ) {
		const finalArgv = this.parseArgs( argv );
		const child = spawn(
			'npx',
			[ '@wordpress/create-block', ...finalArgv.slice( 2 ) ],
			{ stdio: 'inherit' }
		);

		child.on( 'error', ( error ) => {
			// eslint-disable-next-line no-console
			console.error( `Boilerplate got an error: ${ error }` );
		} );

		child.on( 'exit', ( code ) => {
			// eslint-disable-next-line no-console
			console.log( `Plugin setup complete! ${ code }` );
		} );

		return child;
	}
}

module.exports = CLI;
