import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 60_000, // wall-clock tests flake under load
    include: ['packages/*/src/**/*.test.ts', 'packages/*/test/**/*.test.ts', 'tools/**/*.test.ts'],
  },
});
