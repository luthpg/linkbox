import type { OGPData } from '@/types/ogp';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

/**
 * GETリクエストハンドラ: 指定されたURLからOGP情報を取得します。
 * クライアントサイドからのCORS問題を回避するためのプロキシとして機能します。
 * @param request incoming Requestオブジェクト (URLクエリパラメータに'url'を含む)
 * @returns 抽出されたOGPデータ、またはエラーレスポンス
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'URLクエリパラメータが不足しています。' },
      { status: 400 },
    );
  }

  try {
    new URL(targetUrl);
  } catch (e) {
    return NextResponse.json({ error: '無効なURL形式です。' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(
        `Failed to fetch URL ${targetUrl}: ${response.status} ${response.statusText}`,
      );
      return NextResponse.json(
        { error: `URLのフェッチに失敗しました: ${response.statusText}` },
        { status: response.status },
      );
    }

    const html = await response.text();
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

    return NextResponse.json(ogp);
  } catch (error: any) {
    console.error(`Error processing OGP for ${targetUrl}:`, error);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'URLのフェッチがタイムアウトしました。' },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: 'OGP情報の取得中にサーバーエラーが発生しました。' },
      { status: 500 },
    );
  }
}
