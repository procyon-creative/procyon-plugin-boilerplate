/**
 * Project ESLint config (flat).
 *
 * Extends @wordpress/scripts default flat config and adds project-level
 * ignores for the local scaffold-output directory.
 */

const wpScriptsConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	{ ignores: [ 'test-scaffold/**', 'wordpress/**', 'e2e/results/**' ] },
	...wpScriptsConfig,
];
