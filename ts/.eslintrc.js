// https://eslint.org/docs/user-guide/configuring
module.exports = {
	'env': {
		'browser': false,
		'node': true,
		'es6': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended'
	],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 2018,
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single',
			{ 'avoidEscape': true }
		],
		'semi': [
			'error',
			'never'
		],
		'no-unused-vars': [
			'error',
			// False positive cases:
			{
				// Ignore vars starting with init cap to ignore imported types and interfaces.
				'varsIgnorePattern': '^[A-Z]',
				// Ignore function args to ignore constructor parameter properties.
				'args': 'none'
			}
		]
	}
}
