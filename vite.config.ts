import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins:[preact(),tailwindcss()], base:process.env.GITHUB_PAGES === 'true' ? '/rustpixel-academy/' : '/', build:{target:'es2022'}, server:{port:5173} });
