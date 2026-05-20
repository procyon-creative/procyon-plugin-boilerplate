const { join } = require( 'path' );
const BaseTemplateConfig = require( './BaseTemplateConfig' );

class PluginTemplateConfig extends BaseTemplateConfig {
	getDefaultValues() {
		return {
			namespace: 'procyon',
			slug: this.slug,
			title: 'Example Block',
			description: 'An example block from my heart to yours.',
			dashicon: 'heart',
			author: 'Procyon Creative - block builder',
			wpEnv: true,
			folderName: join( 'src', this.slug ),
			domainPath: this.slug,
			supports: {
				align: true,
				color: true,
				typography: {
					fontSize: true,
					lineHeight: true,
					textAlign: true,
				},
				shadow: true,
				spacing: {
					margin: true,
					padding: true,
					blockGap: true,
				},
			},
			customPackageJSON: { files: [ '[^.]*' ] },
			updateURI: process.env.updateURI,
			viewScript: null,
			viewScriptModule: 'file:./view.js',
			render: 'file:./render.php',
			example: {},
			npmDevDependencies: [ '@procyon-creative/plugin-updater' ],
			customScripts: {
				prestart: 'if [ ! -d vendor ]; then composer install; fi',
				prebuild: 'if [ ! -d vendor ]; then composer install; fi',
				build: 'wp-scripts build --experimental-modules',
				start: 'wp-scripts start --experimental-modules',
				'update-version': `plugin-updater ${ this.slug }`,
			},
			transformer: ( view ) => this.transformer( view ),
		};
	}

	getVariants( defaultValues ) {
		return {
			default: {},
			interactive: {
				description: 'An interactive block with the Interactivity API.',
				npmDependencies: [
					...( defaultValues?.npmDevDependencies
						? defaultValues.npmDevDependencies
						: [] ),
					'@wordpress/interactivity',
				],
				blockTemplatesPath: join(
					__dirname,
					'..',
					'templates',
					'block-templates'
				),
				supports: {
					...defaultValues.supports,
					interactivity: true,
					ariaLabel: true,
				},
			},
		};
	}

	getConfig() {
		const defaultValues = this.getDefaultValues();
		return {
			defaultValues,
			variants: this.getVariants( defaultValues ),
			pluginTemplatesPath: join(
				__dirname,
				'..',
				'templates',
				'plugins'
			),
			blockTemplatesPath: join(
				__dirname,
				'..',
				'templates',
				'block-templates'
			),
			assetPath: join( __dirname, '..', 'templates', 'plugin-assets' ),
		};
	}
}

module.exports = PluginTemplateConfig;
module.exports.PluginTemplateConfig = PluginTemplateConfig;
