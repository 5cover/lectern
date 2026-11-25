import { defineConfig } from 'vitest/config'

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: '@5cover/lectern',
    },
  },
  resolve: {
    alias: [{ find: /^@5cover\/lectern\/jsx-dev-runtime$/, replacement: './src/jsx-runtime.ts' }],
  },
  test: {
    include: ['test/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
})
