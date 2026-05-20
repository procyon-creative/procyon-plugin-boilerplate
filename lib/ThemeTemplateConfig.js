const { join } = require( 'path' );
const BaseTemplateConfig = require( './BaseTemplateConfig' );

const DEFAULT_THEME_TEMPLATE = 'block-theme';

class ThemeTemplateConfig extends BaseTemplateConfig {
	constructor( slug, templateName = DEFAULT_THEME_TEMPLATE ) {
		super( slug, templateName );
	}
	getDefaultValues() {
		return {
			namespace: 'procyon',
			slug: this.slug,
			textdomain: this.slug,
			domainPath: this.slug,
			title: 'Example Theme',
			description: 'An example WordPress block theme.',
			author: 'Procyon Creative - theme builder',
			version: '0.1.0',
			requiresAtLeast: '6.7',
			testedUpTo: '6.7',
			requiresPHP: '8.0',
			license: 'GPL-2.0-or-later',
			licenseURI: 'https://www.gnu.org/licenses/gpl-2.0.html',
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
			[ DEFAULT_THEME_TEMPLATE ]: {},
		};
	}

	getConfig() {
		const defaultValues = this.getDefaultValues();

		return {
			defaultValues,
			variants: this.getVariants( defaultValues ),
			themeTemplatesPath: join(
				__dirname,
				'..',
				'templates',
				'themes',
				this.templateName
			),
		};
	}
}

module.exports = ThemeTemplateConfig;
module.exports.DEFAULT_THEME_TEMPLATE = DEFAULT_THEME_TEMPLATE;
