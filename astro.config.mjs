// @ts-check
import { defineConfig } from 'astro/config';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

// Two very different jobs, two very different runtimes:
//
// 1. The PUBLIC site should be plain static HTML — fast, cheap to host
//    (Cloudflare Pages / Netlify / any static host), zero server needed.
//
// 2. The KEYSTATIC ADMIN UI (/keystatic) needs a real Node.js process to
//    read/write content — either your local disk (dev) or the GitHub API
//    (production, "github" storage mode).
//
// We therefore only load the Keystatic integration outside of production
// builds. Locally, `npm run dev` gives you the full editor at /keystatic
// (local mode — writes straight to disk, you commit/push yourself).
//
// For a live, in-browser editor for a client (no local dev, no terminal),
// deploy a *separate* small SSR deployment of this same repo to a
// Node-friendly host (Vercel is the well-trodden path — see README.md).
// Do NOT try to run Keystatic's GitHub-mode admin UI on Cloudflare
// Workers: its file-reading layer does not play well with the Workers
// runtime sandbox as of this writing.
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  output: isDev ? 'server' : 'static',
  integrations: isDev ? [react(), keystatic()] : [],
});
