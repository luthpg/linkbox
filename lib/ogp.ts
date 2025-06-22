import type { OGPData } from '@/types/ogp';
import * as cheerio from 'cheerio';

export const getOgpInfo = (html: string) => {
  const $ = cheerio.load(html);

  const ogp: OGPData = {};

  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr('property');
    const content = $(element).attr('content');

    if (property && content) {
      switch (property) {
        case 'og:title':
          ogp.ogTitle = content;
          break;
        case 'og:description':
          ogp.ogDescription = content;
          break;
        case 'og:image':
          ogp.ogImage = content;
          break;
        case 'og:url':
          ogp.ogUrl = content;
          break;
        case 'og:site_name':
          ogp.ogSiteName = content;
          break;
      }
    }
  });

  // OGP情報が見つからない場合、title/descriptionを取得するフォールバック
  if (!ogp.ogTitle) {
    ogp.ogTitle = $('title').text();
  }
  if (!ogp.ogDescription) {
    ogp.ogDescription = $('meta[name="description"]').attr('content');
  }

  return ogp;
};
