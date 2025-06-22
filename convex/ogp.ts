import { getOgpInfo } from '@/lib/ogp';
import type { OGPData } from '@/types/ogp';
import { v } from 'convex/values';
import { action } from './_generated/server';

export const fetchOgp = action({
  args: { url: v.string() },
  handler: async (ctx, { url }): Promise<OGPData> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated. Cannot fetch OGP data.');
    }

    try {
      new URL(decodeURIComponent(url));
    } catch (e) {
      console.error('Invalid URL format:', url);
      throw new Error('Invalid URL format.');
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'linkbox-ogp-fetcher/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();
      const ogp = getOgpInfo(html);

      return ogp;
    } catch (error) {
      console.error(`Error processing OGP for ${url}:`, error);
      if (
        (error as Error).name === 'TimeoutError' ||
        (error as Error).name === 'AbortError'
      ) {
        throw new Error('URL fetch timed out.');
      }
      throw new Error('Server error while fetching OGP data.');
    }
  },
});
