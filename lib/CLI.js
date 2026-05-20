const { spawn } = require( 'child_process' );
const { Command } = require( 'commander' );
const ThemeScaffolder = require( './ThemeScaffolder' );
const ThemeTemplateConfig = require( './ThemeTemplateConfig' );

class CLI {
	constructor( version ) {
		this.version = version;
		this.type = 'plugin';
		this.defaultValues = {
			updateURI: undefined,
			githubAccount: undefined,
			type: undefined,
		};
	}

	parseArgs( argv ) {
		const program = new Command();
		program
			.allowUnknownOption()
			.allowExcessArguments()
			.version( this.version )
			.description( 'Create a new WordPress block' )
			.option( '-g, --githubAccount <slug>', 'Your GitHub account name' )
			.option( '-t, --type <type>', 'Scaffold type: plugin or theme' )
			.parse( argv );

		const options = program.opts();
		const handledKeys = Object.keys( this.defaultValues );

		// Set env vars
		if ( options.githubAccount ) {
			process.env.githubAccount = options.githubAccount;
		}

		if ( options.type ) {
			this.type = options.type;
		}

		const finalArgv = [];
		for ( let i = 0; i < argv.length; i++ ) {
			const arg = argv[ i ];

			// Check if this is a handled flag
			const isHandledFlag =
				arg === '-g' ||
				arg === '-t' ||
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

		if ( this.type === 'theme' ) {
			const slug = finalArgv.slice( 2 )[ 0 ];
			const config = new ThemeTemplateConfig( slug );
			const scaffolder = new ThemeScaffolder( config, slug );
			scaffolder.scaffold();
			return scaffolder;
		}

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
