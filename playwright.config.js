const { defineConfig, devices } = require( '@playwright/test' );

module.exports = defineConfig( {
	testDir: './e2e',
	testMatch: 'theme.spec.js',
	timeout: 30000,
	fullyParallel: false,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI
		? [
				[ 'github' ],
				[
					'html',
					{ outputFolder: 'e2e/results/html-report', open: 'never' },
				],
		  ]
		: [
				[ 'list' ],
				[
					'html',
					{ outputFolder: 'e2e/results/html-report', open: 'never' },
				],
		  ],
	outputDir: 'e2e/results/test-output',
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://e2e-test.lndo.site',
		headless: true,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices[ 'Desktop Chrome' ],
			},
		},
	],
} );
