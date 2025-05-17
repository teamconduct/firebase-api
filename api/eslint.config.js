const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const globals = require("globals");

const {
    fixupConfigRules,
    fixupPluginRules,
} = require("@eslint/compat");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        sourceType: "module",

        parserOptions: {
            project: ["tsconfig.json", "tsconfig.dev.json"],
        },
    },

    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        // "google",
        "plugin:@typescript-eslint/recommended",
    )),

    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        import: fixupPluginRules(_import),
    },

    rules: {
        "quotes": ["error", "single"],
        "import/no-unresolved": 0,
        "indent": ["error", 4],
        "object-curly-spacing": ["error", "always"],
        "@typescript-eslint/no-namespace": "off",
        "comma-dangle": ["error", "never"],
        "max-len": "off",
        "require-jsdoc": "off",
        "padded-blocks": "off",
        "curly": ["error", "multi-or-nest"],
        "arrow-parens": ["error", "as-needed"],
        "@typescript-eslint/no-floating-promises": "error",
        "new-cap": "off",
        "@typescript-eslint/no-inferrable-types": "off"
    },
}, globalIgnores(["lib/**/*", "generated/**/*", "coverage/**/*", ".nyc_output/**/*", "eslint.config.js", ".mocharc.js"])]);
