import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    open: true
  },

  // Settings for the tests (run with `npm test`).
  test: {
    // All test files live in the tests/ folder, next to src/.
    include: ['tests/**/*.test.{js,jsx}'],

    // Needed so Testing Library clears the page between tests.
    // Without this, each test would still see the last test's HTML.
    globals: true,

    // Tests need a fake browser, because our components render HTML.
    environment: 'jsdom',

    // Runs before every test file. Adds the extra expect(...) checks.
    setupFiles: './tests/setup.js',

    coverage: {
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{js,jsx}'],
      // main.jsx just starts the app, so there is nothing to test in it.
      exclude: ['src/main.jsx']
    }
  }
});

