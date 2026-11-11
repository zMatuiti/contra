import { defineConfig } from '@playwright/test';
const baseURL = process.env.AURORA_BASE_URL || 'http://127.0.0.1:5173';
export default defineConfig({
  testDir: './tests', timeout: 30000, workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL, channel: 'chrome', headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: process.env.AURORA_BASE_URL ? 'npm run preview -- --host 127.0.0.1 --port 4173' : 'npm run dev -- --host 127.0.0.1', url: baseURL, reuseExistingServer: true },
});
