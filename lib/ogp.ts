import type { OGPData } from '@/types/ogp';
import * as cheerio from 'cheerio';

const getMetaContent = (
  $: cheerio.CheerioAPI,
  property: string,
): string | undefined => {
  return (
    $(`meta[property="${property}"]`).attr('content') ||
    $(`meta[name="${property}"]`).attr('content')
  );
};

export const getOgpInfo = (html: string) => {
  const $ = cheerio.load(html);

  const ogp: OGPData = {
    ogTitle: getMetaContent($, 'og:title') || $('title').text(),
    ogDescription:
      getMetaContent($, 'og:description') || getMetaContent($, 'description'),
    ogImage: getMetaContent($, 'og:image'),
    ogUrl: getMetaContent($, 'og:url'),
    ogSiteName: getMetaContent($, 'og:site_name'),
  };

  return ogp;
};
