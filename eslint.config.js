import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist/**', 'node_modules/**', '.vercel/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'lib/**/*.js'],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // teaches no-unused-vars that JSX usage counts
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  {
    // server-only shared modules (imported by /api, never by the frontend)
    files: ['lib/ai.js', 'lib/rateLimit.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['api/**/*.js', 'tests/**/*.js', '*.config.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
]
