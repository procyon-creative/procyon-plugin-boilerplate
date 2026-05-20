const fs = require( 'fs' );
const Mustache = require( 'mustache' );
const { basename, join } = require( 'path' );

class ThemeScaffolder {
	constructor( config, outputDir ) {
		this.config = config;
		this.outputDir = outputDir;
		this.templateDir = join( __dirname, '..', 'templates', 'themes' );
		this.assetDir = join( __dirname, '..', 'templates', 'theme-assets' );
	}

	scaffold() {
		const configObj = this.getConfig();
		const view = this.getTransformedView( configObj.defaultValues );

		this.templateDir = configObj.themeTemplatesPath || this.templateDir;
		this.assetDir = configObj.themeAssetPath || this.assetDir;

		this.ensureDirectoryExists(
			this.templateDir,
			'theme template directory'
		);
		this.ensureOutputDirectory();
		this.processDirectory( this.templateDir, this.outputDir, view );
		this.copyAssets();
	}

	getConfig() {
		if ( ! this.config || typeof this.config.getConfig !== 'function' ) {
			throw new Error(
				'ThemeScaffolder requires a config object with a getConfig() method.'
			);
		}

		const configObj = this.config.getConfig();

		if ( ! configObj || typeof configObj !== 'object' ) {
			throw new Error(
				'ThemeScaffolder config.getConfig() must return a configuration object.'
			);
		}

		if (
			! configObj.defaultValues ||
			typeof configObj.defaultValues !== 'object'
		) {
			throw new Error(
				'ThemeScaffolder config.getConfig() must include defaultValues.'
			);
		}

		return configObj;
	}

	getTransformedView( view ) {
		if ( typeof this.config.transformer !== 'function' ) {
			throw new Error(
				'ThemeScaffolder requires a config object with a transformer() method.'
			);
		}

		return this.config.transformer( { ...view } );
	}

	ensureOutputDirectory() {
		if ( ! this.outputDir || typeof this.outputDir !== 'string' ) {
			throw new Error(
				'ThemeScaffolder requires a valid output directory path.'
			);
		}

		this.createDirectory( this.outputDir, 'output directory' );
	}

	ensureDirectoryExists( dirPath, label ) {
		if ( ! fs.existsSync( dirPath ) ) {
			throw new Error(
				`ThemeScaffolder could not find the ${ label }: ${ dirPath }`
			);
		}

		if ( ! fs.statSync( dirPath ).isDirectory() ) {
			throw new Error(
				`ThemeScaffolder expected ${ label } to be a directory: ${ dirPath }`
			);
		}
	}

	createDirectory( dirPath, label ) {
		try {
			fs.mkdirSync( dirPath, { recursive: true } );
		} catch ( error ) {
			throw new Error(
				`ThemeScaffolder could not create ${ label } at ${ dirPath }: ${ error.message }`
			);
		}
	}

	processDirectory( srcDir, destDir, view ) {
		this.ensureDirectoryExists( srcDir, 'theme template directory' );
		this.createDirectory( destDir, 'output directory' );

		const entries = fs.readdirSync( srcDir, { withFileTypes: true } );

		for ( const entry of entries ) {
			const srcPath = join( srcDir, entry.name );
			const outputName = entry.name.endsWith( '.mustache' )
				? basename( entry.name, '.mustache' )
				: entry.name;
			const destPath = join( destDir, outputName );

			if ( entry.isDirectory() ) {
				this.processDirectory( srcPath, destPath, view );
				continue;
			}

			if ( entry.isFile() && entry.name.endsWith( '.mustache' ) ) {
				this.writeRenderedTemplate( srcPath, destPath, view );
				continue;
			}

			if ( entry.isFile() ) {
				this.copyFile( srcPath, destPath );
			}
		}
	}

	renderTemplate( templatePath, view ) {
		let template;

		try {
			template = fs.readFileSync( templatePath, 'utf8' );
		} catch ( error ) {
			throw new Error(
				`ThemeScaffolder could not read template ${ templatePath }: ${ error.message }`
			);
		}

		try {
			return Mustache.render( template, view );
		} catch ( error ) {
			throw new Error(
				`ThemeScaffolder could not render template ${ templatePath }: ${ error.message }`
			);
		}
	}

	writeRenderedTemplate( templatePath, destPath, view ) {
		const output = this.renderTemplate( templatePath, view );

		try {
			fs.writeFileSync( destPath, output );
		} catch ( error ) {
			throw new Error(
				`ThemeScaffolder could not write rendered file ${ destPath }: ${ error.message }`
			);
		}
	}

	copyAssets() {
		if ( ! fs.existsSync( this.assetDir ) ) {
			throw new Error(
				`ThemeScaffolder could not find the theme asset directory: ${ this.assetDir }`
			);
		}

		if ( ! fs.statSync( this.assetDir ).isDirectory() ) {
			throw new Error(
				`ThemeScaffolder expected theme asset directory to be a directory: ${ this.assetDir }`
			);
		}

		this.copyDirectoryContents( this.assetDir, this.outputDir );
	}

	copyDirectoryContents( srcDir, destDir ) {
		const entries = fs.readdirSync( srcDir, { withFileTypes: true } );

		for ( const entry of entries ) {
			const srcPath = join( srcDir, entry.name );
			const destPath = join( destDir, entry.name );

			if ( entry.isDirectory() ) {
				this.createDirectory( destPath, 'asset directory' );
				this.copyDirectoryContents( srcPath, destPath );
				continue;
			}

			if ( entry.isFile() ) {
				this.copyFile( srcPath, destPath );
			}
		}
	}

	copyFile( srcPath, destPath ) {
		try {
			fs.copyFileSync( srcPath, destPath );
		} catch ( error ) {
			throw new Error(
				`ThemeScaffolder could not copy ${ srcPath } to ${ destPath }: ${ error.message }`
			);
		}
	}
}

module.exports = ThemeScaffolder;
