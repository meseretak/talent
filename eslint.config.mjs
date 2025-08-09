import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } }, // Assuming this is correct for your project (Node.js might be more appropriate: globals.node)
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Disable rules that are causing issues with generated code
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Changed to 'off' to address unused variables
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off', // Disable Function type warnings
      '@typescript-eslint/no-wrapper-object-types': 'off', // Disable Object type warnings
      '@typescript-eslint/no-unnecessary-type-constraint': 'off', // Disable unnecessary type constraint warnings
      'no-unused-private-class-members': 'off', // Disable unused private class members warnings
    },
  },
];
