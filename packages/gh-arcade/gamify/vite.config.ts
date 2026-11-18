import { defineConfig } from 'vite';
import { readdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gamePages } from '../build/game-pages.ts';
import registry from '../games/registry.json' with { type: 'json' };

const root = resolve(import.meta.dirname, '..');
const OUT = resolve(root, '../../public/arcade');

function discoverGames(): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const d of readdirSync(resolve(root, 'games'), { withFileTypes: true })) {
    const html = resolve(root, 'games', d.name, 'index.html');
    if (d.isDirectory() && !d.name.startsWith('_') && existsSync(html)) entries[d.name] = html;
  }
  return entries;
}

export default defineConfig({
  root,
  base: '/arcade/',
  resolve: { alias: { 'virtual:pwa-register': resolve(root, 'gamify/pwa-stub.ts') } },
  build: {
    outDir: OUT,
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: discoverGames(),
      output: { manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : undefined) },
    },
  },
  plugins: [
    gamePages(registry),
    { name: 'gamify:registry', closeBundle() { copyFileSync(resolve(root, 'games/registry.json'), resolve(OUT, 'registry.json')); } },
  ],
});
