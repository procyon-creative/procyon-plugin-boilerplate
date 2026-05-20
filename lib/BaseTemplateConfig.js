class BaseTemplateConfig {
	constructor( slug = 'example' ) {
		this.slug = slug;
	}

	transformer( view ) {
		return {
			...view,
			githubAccount: process.env.githubAccount,
		};
	}

	getDefaultValues() {
		throw new Error(
			'BaseTemplateConfig subclasses must implement getDefaultValues().'
		);
	}

	getVariants() {
		throw new Error(
			'BaseTemplateConfig subclasses must implement getVariants().'
		);
	}

	getConfig() {
		throw new Error(
			'BaseTemplateConfig subclasses must implement getConfig().'
		);
	}
}

module.exports = BaseTemplateConfig;
