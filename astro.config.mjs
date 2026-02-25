import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    // Specify Node.js 18 as the runtime
    runtime: 'nodejs18.x'
  }),
});