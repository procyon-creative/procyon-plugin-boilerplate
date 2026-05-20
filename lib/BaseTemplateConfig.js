class BaseTemplateConfig {
	constructor( slug = 'example', templateName = null ) {
		this.slug = slug;
		this.templateName = templateName;
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
