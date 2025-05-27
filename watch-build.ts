#!/usr/bin/env bun

import { watch } from 'fs';
import { build } from 'bun';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

let isBuilding = false;

async function buildApp() {
  if (isBuilding) return;
  
  isBuilding = true;
  console.log('🔄 Rebuilding...');
  
  // Ensure dist directory exists
  if (!existsSync('./dist')) {
    await mkdir('./dist', { recursive: true });
  }

  try {
    const result = await build({
      entrypoints: ['./src/app.ts'],
      outdir: './dist',
      target: 'browser',
      format: 'esm',
      minify: false, // Don't minify in watch mode
      sourcemap: 'external',
      splitting: false,
      naming: {
        entry: 'app.js',
      },
    });

    if (result.success) {
      console.log('✅ Build completed!');
    } else {
      console.error('❌ Build failed');
      console.error(result.logs);
    }
  } catch (error) {
    console.error('❌ Build error:', error);
  } finally {
    isBuilding = false;
  }
}

// Initial build
console.log('🚀 Starting watch mode...');
await buildApp();

// Watch for changes
const watcher = watch('./src', { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.ts')) {
    console.log(`📝 File changed: ${filename}`);
    buildApp();
  }
});

console.log('👀 Watching src/ for changes...');
console.log('Press Ctrl+C to stop');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping watch mode...');
  watcher.close();
  process.exit(0);
}); 