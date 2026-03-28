import nextVitals from 'eslint-config-next/core-web-vitals'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.next', 'src/**']),
  ...nextVitals,
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['components/directory/DirectoryCard.tsx'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
])
