import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  //base: './',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    selfDestroying: true,
    includeAssets: ['favicon.png'],
    manifest: {
      name: 'Satellite',
      short_name: 'Satellite',
      description: 'Nostr client',
      icons: [
        {
          src: '/favicon.png',
          sizes: '196x196',
          type: 'image/png',
          purpose: 'apple touch icon'
        }
      ]
    },
    theme_color: '#171819',
    background_color: '#171819',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    orientation: 'portrait'
  })]
});
