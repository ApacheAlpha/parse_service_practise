module.exports = {
	env: {
		es6: true,
		node: true,
		mocha: true,
	},
	extends: 'airbnb-base',
	root: true,
	// allowIndentationTabs: true,
	rules: {
		'no-tabs': ['error', { allowIndentationTabs: true }],
		indent: [
			'error',
			'tab',
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		quotes: [
			'error',
			'single',
		],
		semi: [
			'error',
			'never',
		],
	},
}
