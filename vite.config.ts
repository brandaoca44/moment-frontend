import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiOrigin = env.VITE_API_URL && !env.VITE_API_URL.startsWith('/') ? new URL(env.VITE_API_URL).origin : '';
  // Styles remain inline because the current React UI uses inline styles.
  // Scripts cannot run inline or from third-party origins in a production build.
  const csp = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob: ${apiOrigin}; font-src 'self'; connect-src 'self' ${apiOrigin}; object-src 'none'; base-uri 'self'; form-action 'self'`;
  const security: Plugin = {
    name: 'moment-browser-security', apply: 'build',
    transformIndexHtml: { order: 'post', handler: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }] },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '_headers', source: `/*\n  Content-Security-Policy: ${csp}; frame-ancestors 'none'\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n` });
    },
  };
  return {
  plugins: [react(), security],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: { headers: { 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' } },
  };
})
