import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Change from 'server' to 'static'
  output: 'static',

  vite: {
    plugins: [tailwindcss()]
  }
});