import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'linkbox',
    short_name: 'linkbox',
    description: 'あなたのブックマークを次々に保存',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2b7fff',
    icons: [
      {
        src: '/android-chrome-36x36.png',
        sizes: '36x36',
        type: 'image/png',
      },
      {
        src: '/android-chrome-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/android-chrome-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/android-chrome-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/android-chrome-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/android-chrome-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/android-chrome-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-256x256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: '/android-chrome-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
