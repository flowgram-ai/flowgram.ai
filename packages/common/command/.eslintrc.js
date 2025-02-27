const { defineConfig } = require('@flowgram.ai/eslint-config');

module.exports = defineConfig({
  preset: 'web',
  packageRoot: __dirname,
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ExportAllDeclaration',
        message:
          'Do not re-export everything from another modules, you should explicitly specify the members to be exported.',
      },
    ],
  },
});
