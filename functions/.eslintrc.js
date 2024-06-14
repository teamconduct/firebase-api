module.exports = {
    root: true,
    env: {
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'google',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        sourceType: 'module'
    },
    ignorePatterns: [
        '/lib/**/*', // Ignore built files.
        '/generated/**/*' // Ignore generated files.
    ],
    plugins: [
        '@typescript-eslint',
        'import'
    ],
    rules: {
        'quotes': ['error', 'single'],
        'import/no-unresolved': 0,
        'indent': ['error', 4],
        'object-curly-spacing': ['error', 'always'],
        '@typescript-eslint/no-namespace': 'off',
        'comma-dangle': ['error', 'never'],
        'max-len': 'off',
        'require-jsdoc': 'off',
        'padded-blocks': 'off',
        'curly': ['error', 'multi-or-nest'],
        'arrow-parens': ['error', 'as-needed'],
    }
};
