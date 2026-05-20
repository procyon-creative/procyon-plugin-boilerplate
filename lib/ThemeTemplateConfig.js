const { join } = require( 'path' );
const BaseTemplateConfig = require( './BaseTemplateConfig' );

class ThemeTemplateConfig extends BaseTemplateConfig {
	getDefaultValues() {
		return {
			slug: this.slug,
			title: 'Example Theme',
			description: 'An example WordPress block theme.',
			author: 'Procyon Creative - theme builder',
			wpEnv: true,
			customPackageJSON: { files: [ '[^.]*' ] },
			updateURI: process.env.updateURI,
			npmDevDependencies: [],
			customScripts: {},
			transformer: ( view ) => this.transformer( view ),
		};
	}

	getVariants() {
		return {
			'block-theme': {},
		};
	}

	getConfig() {
		const defaultValues = this.getDefaultValues();

		return {
			defaultValues,
			variants: this.getVariants( defaultValues ),
			themeTemplatesPath: join( __dirname, '..', 'templates', 'themes' ),
			themeAssetPath: join(
				__dirname,
				'..',
				'templates',
				'theme-assets'
			),
		};
	}
}

module.exports = ThemeTemplateConfig;
