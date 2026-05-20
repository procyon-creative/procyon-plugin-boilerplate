const { join } = require( 'path' );
const ThemeTemplateConfig = require( '../lib/ThemeTemplateConfig' );

describe( 'ThemeTemplateConfig', () => {
	beforeEach( () => {
		delete process.env.githubAccount;
		delete process.env.updateURI;
	} );

	it( 'should initialize with a default slug', () => {
		const config = new ThemeTemplateConfig();

		expect( config.slug ).toBe( 'example' );
	} );

	it( 'should initialize with a custom slug', () => {
		const config = new ThemeTemplateConfig( 'my-theme' );

		expect( config.slug ).toBe( 'my-theme' );
	} );

	it( 'should return the expected default values shape', () => {
		process.env.updateURI = 'https://example.com/update-uri';

		const config = new ThemeTemplateConfig( 'theme-slug' );
		const defaults = config.getDefaultValues();

		expect( defaults ).toEqual(
			expect.objectContaining( {
				slug: 'theme-slug',
				title: 'Example Theme',
				description: 'An example WordPress block theme.',
				author: 'Procyon Creative - theme builder',
				wpEnv: true,
				customPackageJSON: { files: [ '[^.]*' ] },
				updateURI: 'https://example.com/update-uri',
				npmDevDependencies: [],
				customScripts: {},
			} )
		);
		expect( defaults.transformer ).toEqual( expect.any( Function ) );
	} );

	it( 'should return a block-theme variant', () => {
		const config = new ThemeTemplateConfig();

		expect( config.getVariants() ).toEqual( {
			'block-theme': {},
		} );
	} );

	it( 'should return a full config object with theme paths', () => {
		const config = new ThemeTemplateConfig( 'test-theme' );
		const fullConfig = config.getConfig();

		expect( fullConfig ).toHaveProperty( 'defaultValues' );
		expect( fullConfig ).toHaveProperty( 'variants' );
		expect( fullConfig.themeTemplatesPath ).toContain(
			join( 'templates', 'themes' )
		);
		expect( fullConfig.themeAssetPath ).toContain(
			join( 'templates', 'theme-assets' )
		);
	} );

	it( 'should inject githubAccount from the environment in transformer()', () => {
		process.env.githubAccount = 'procyon-creative';

		const config = new ThemeTemplateConfig();
		const transformed = config.transformer( { slug: 'test-theme' } );

		expect( transformed ).toEqual( {
			slug: 'test-theme',
			githubAccount: 'procyon-creative',
		} );
	} );
} );
