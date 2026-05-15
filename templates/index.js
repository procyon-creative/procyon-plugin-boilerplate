/**
 * External template configuration for block creation.
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/packages-create-block-external-template/
 */
const TemplateConfig = require( '../lib/TemplateConfig' );

// get the argument for block slug
const slug = process.argv.slice( 2 )[ 0 ] || 'example';
const config = new TemplateConfig( slug );

module.exports = config.getConfig();
