jest.mock( 'fs', () => ( {
	readFileSync: jest.fn(),
	writeFileSync: jest.fn(),
	existsSync: jest.fn(),
	statSync: jest.fn(),
	mkdirSync: jest.fn(),
	readdirSync: jest.fn(),
	copyFileSync: jest.fn(),
} ) );

jest.mock( 'mustache', () => ( {
	render: jest.fn(),
} ) );

const fs = require( 'fs' );
const Mustache = require( 'mustache' );
const { join } = require( 'path' );
const ThemeScaffolder = require( '../lib/ThemeScaffolder' );

const createDirent = ( name, type ) => ( {
	name,
	isDirectory: () => type === 'directory',
	isFile: () => type === 'file',
} );

describe( 'ThemeScaffolder', () => {
	let config;
	let scaffolder;

	beforeEach( () => {
		jest.clearAllMocks();

		config = {
			getConfig: jest.fn().mockReturnValue( {
				defaultValues: {
					slug: 'my-theme',
				},
				themeTemplatesPath: '/templates/themes',
				themeAssetPath: '/templates/theme-assets',
			} ),
			transformer: jest.fn( ( view ) => ( {
				...view,
				githubAccount: 'procyon',
			} ) ),
		};

		scaffolder = new ThemeScaffolder( config, '/output/theme' );
	} );

	it( 'should set config and outputDir in the constructor', () => {
		expect( scaffolder.config ).toBe( config );
		expect( scaffolder.outputDir ).toBe( '/output/theme' );
		expect( scaffolder.templateDir ).toContain(
			join( 'templates', 'themes' )
		);
		expect( scaffolder.assetDir ).toContain(
			join( 'templates', 'theme-assets' )
		);
	} );

	it( 'should call processDirectory and copyAssets during scaffold()', () => {
		jest.spyOn( scaffolder, 'ensureDirectoryExists' ).mockImplementation(
			() => {}
		);
		jest.spyOn( scaffolder, 'ensureOutputDirectory' ).mockImplementation(
			() => {}
		);
		jest.spyOn( scaffolder, 'processDirectory' ).mockImplementation(
			() => {}
		);
		jest.spyOn( scaffolder, 'copyAssets' ).mockImplementation( () => {} );

		scaffolder.scaffold();

		expect( config.getConfig ).toHaveBeenCalledTimes( 1 );
		expect( config.transformer ).toHaveBeenCalledWith( {
			slug: 'my-theme',
		} );
		expect( scaffolder.ensureDirectoryExists ).toHaveBeenCalledWith(
			'/templates/themes',
			'theme template directory'
		);
		expect( scaffolder.processDirectory ).toHaveBeenCalledWith(
			'/templates/themes',
			'/output/theme',
			{
				slug: 'my-theme',
				githubAccount: 'procyon',
			}
		);
		expect( scaffolder.copyAssets ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should throw when getConfig() receives an invalid config object', () => {
		const invalidScaffolder = new ThemeScaffolder( {}, '/output/theme' );

		expect( () => invalidScaffolder.getConfig() ).toThrow(
			'ThemeScaffolder requires a config object with a getConfig() method.'
		);
	} );

	it( 'should throw when getTransformedView() has no transformer', () => {
		const invalidScaffolder = new ThemeScaffolder(
			{
				getConfig: jest.fn(),
			},
			'/output/theme'
		);

		expect( () =>
			invalidScaffolder.getTransformedView( {
				slug: 'missing-transformer',
			} )
		).toThrow(
			'ThemeScaffolder requires a config object with a transformer() method.'
		);
	} );

	it( 'should render mustache files and copy non-template files in processDirectory()', () => {
		fs.readdirSync.mockImplementation( ( dirPath ) => {
			if ( dirPath === '/templates/themes' ) {
				return [
					createDirent( 'templates', 'directory' ),
					createDirent( 'style.css.mustache', 'file' ),
					createDirent( 'theme.json', 'file' ),
				];
			}

			if ( dirPath === '/templates/themes/templates' ) {
				return [ createDirent( 'index.html.mustache', 'file' ) ];
			}

			return [];
		} );

		jest.spyOn( scaffolder, 'ensureDirectoryExists' ).mockImplementation(
			() => {}
		);
		jest.spyOn( scaffolder, 'createDirectory' ).mockImplementation(
			() => {}
		);
		jest.spyOn( scaffolder, 'writeRenderedTemplate' ).mockImplementation(
			() => {}
		);
		jest.spyOn( scaffolder, 'copyFile' ).mockImplementation( () => {} );
		const processDirectorySpy = jest.spyOn(
			scaffolder,
			'processDirectory'
		);

		scaffolder.processDirectory( '/templates/themes', '/output/theme', {
			slug: 'my-theme',
		} );

		expect( scaffolder.writeRenderedTemplate ).toHaveBeenCalledWith(
			'/templates/themes/style.css.mustache',
			'/output/theme/style.css',
			{ slug: 'my-theme' }
		);
		expect( scaffolder.copyFile ).toHaveBeenCalledWith(
			'/templates/themes/theme.json',
			'/output/theme/theme.json'
		);
		expect( processDirectorySpy ).toHaveBeenCalledWith(
			'/templates/themes/templates',
			'/output/theme/templates',
			{ slug: 'my-theme' }
		);
		expect( scaffolder.writeRenderedTemplate ).toHaveBeenCalledWith(
			'/templates/themes/templates/index.html.mustache',
			'/output/theme/templates/index.html',
			{ slug: 'my-theme' }
		);
	} );

	it( 'should read and render templates in renderTemplate()', () => {
		fs.readFileSync.mockReturnValue( 'Hello {{ title }}' );
		Mustache.render.mockReturnValue( 'Hello Example Theme' );

		const output = scaffolder.renderTemplate(
			'/templates/themes/style.css.mustache',
			{
				title: 'Example Theme',
			}
		);

		expect( fs.readFileSync ).toHaveBeenCalledWith(
			'/templates/themes/style.css.mustache',
			'utf8'
		);
		expect( Mustache.render ).toHaveBeenCalledWith( 'Hello {{ title }}', {
			title: 'Example Theme',
		} );
		expect( output ).toBe( 'Hello Example Theme' );
	} );

	it( 'should copy assets from assetDir to outputDir', () => {
		fs.existsSync.mockReturnValue( true );
		fs.statSync.mockReturnValue( {
			isDirectory: () => true,
		} );
		jest.spyOn( scaffolder, 'copyDirectoryContents' ).mockImplementation(
			() => {}
		);

		scaffolder.copyAssets();

		expect( scaffolder.copyDirectoryContents ).toHaveBeenCalledWith(
			scaffolder.assetDir,
			scaffolder.outputDir
		);
	} );

	it( 'should copy files in copyFile()', () => {
		scaffolder.copyFile(
			'/templates/themes/theme.json',
			'/output/theme/theme.json'
		);

		expect( fs.copyFileSync ).toHaveBeenCalledWith(
			'/templates/themes/theme.json',
			'/output/theme/theme.json'
		);
	} );

	it( 'should throw when ensureDirectoryExists() receives a missing directory', () => {
		fs.existsSync.mockReturnValue( false );

		expect( () =>
			scaffolder.ensureDirectoryExists(
				'/missing/templates',
				'theme template directory'
			)
		).toThrow(
			'ThemeScaffolder could not find the theme template directory: /missing/templates'
		);
	} );

	it( 'should create directories recursively in createDirectory()', () => {
		scaffolder.createDirectory( '/output/theme', 'output directory' );

		expect( fs.mkdirSync ).toHaveBeenCalledWith( '/output/theme', {
			recursive: true,
		} );
	} );
} );
