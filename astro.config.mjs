import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://cnusergroup.github.io',
  // GitHub Pages 部署时使用 base URL
  base: process.env.CI ? '/cnusergroup-website' : '/',
  output: 'static',
  build: {
    assets: 'assets'
  },
  compressHTML: true
});