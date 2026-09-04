import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function ltaApiDevPlugin(): Plugin {
  return {
    name: 'lta-api-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/lta')) {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const service = urlObj.searchParams.get('service') || 'CarParkAvailabilityv2';
          const apiKey =
            (req.headers['accountkey'] as string) ||
            (req.headers['AccountKey'] as string) ||
            (req.headers['x-api-key'] as string) ||
            process.env.LTA_API_KEY ||
            process.env.LTA_ACCOUNT_KEY ||
            process.env.VITE_LTA_API_KEY ||
            '';

          if (!apiKey) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(
              JSON.stringify({
                status: 'warning',
                message: 'No LTA API Key configured in environment (LTA_API_KEY).',
                value: [],
                source: 'fallback_needed',
              })
            );
            return;
          }

          try {
            const ltaUrl = `https://datamall2.mytransport.sg/ltaodataservice/${service}`;
            const upstream = await fetch(ltaUrl, {
              headers: {
                AccountKey: apiKey,
                accept: 'application/json',
              },
            });
            const data = await upstream.json();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: err?.message || 'LTA request failed' }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ltaApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
