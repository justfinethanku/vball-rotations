import { defineConfig } from '@playwright/test';

const port = Number(process.env.TEST_PORT || 30959);
export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: { baseURL: `http://127.0.0.1:${port}`, viewport: { width: 1280, height: 900 } },
  webServer: {
    command: `npm run ${process.env.TEST_SERVER === 'production' ? 'start' : 'dev'} -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120000,
    env: { CIRCLE_NODE_TOTAL: '2', RAYON_NUM_THREADS: '2' },
  },
});
