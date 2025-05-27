#!/usr/bin/env bun

import { build } from 'bun';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

async function buildApp() {
  console.log('🚀 Starting build process...');

  // Ensure dist directory exists
  if (!existsSync('./dist')) {
    await mkdir('./dist', { recursive: true });
    console.log('📁 Created dist directory');
  }

  try {
    const result = await build({
      entrypoints: ['./src/app.ts'],
      outdir: './dist',
      target: 'browser',
      format: 'esm',
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production' ? 'external' : 'none',
      splitting: false, // Keep everything in one bundle
      naming: {
        entry: 'app.js', // Output as app.js
      },
    });

    if (result.success) {
      console.log('✅ Build completed successfully!');
      console.log(`📦 Output: ${result.outputs.map(o => o.path).join(', ')}`);
    } else {
      console.error('❌ Build failed');
      console.error(result.logs);
    }
  } catch (error) {
    console.error('❌ Build error:', error);
    process.exit(1);
  }
}

// Run the build
buildApp(); 