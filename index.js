#!/usr/bin/env node

const CLI = require( './lib/CLI' );
const { version } = require( './package.json' );

const cli = new CLI( version );
cli.run( process.argv );
