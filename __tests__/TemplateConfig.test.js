const TemplateConfig = require( '../lib/TemplateConfig' );
const { join } = require( 'path' );

describe( 'TemplateConfig', () => {
	it( 'should initialize with a default slug', () => {
		const config = new TemplateConfig();
		expect( config.slug ).toBe( 'example' );
	} );

	it( 'should initialize with a custom slug', () => {
		const config = new TemplateConfig( 'my-block' );
		expect( config.slug ).toBe( 'my-block' );
	} );

	it( 'should return correct default values', () => {
		const config = new TemplateConfig( 'test-slug' );
		const defaults = config.getDefaultValues();
		expect( defaults.slug ).toBe( 'test-slug' );
		expect( defaults.namespace ).toBe( 'procyon' );
		expect( defaults.folderName ).toBe( join( 'src', 'test-slug' ) );
	} );

	it( 'should transform view with githubAccount from env', () => {
		process.env.githubAccount = 'test-user';
		const config = new TemplateConfig();
		const view = { name: 'test' };
		const transformed = config.transformer( view );
		expect( transformed.githubAccount ).toBe( 'test-user' );
		expect( transformed.name ).toBe( 'test' );
	} );

	it( 'should return full config object with paths', () => {
		const config = new TemplateConfig( 'test' );
		const fullConfig = config.getConfig();
		expect( fullConfig ).toHaveProperty( 'defaultValues' );
		expect( fullConfig ).toHaveProperty( 'variants' );
		expect( fullConfig.pluginTemplatesPath ).toContain(
			join( 'templates', 'plugin-templates' )
		);
	} );
} );
