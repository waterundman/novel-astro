import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ai-novel.example.com',
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  compressHTML: true
});
