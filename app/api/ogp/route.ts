import { getOgpInfo } from '@/lib/ogp';
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
    new URL(decodeURIComponent(targetUrl));
  } catch (e) {
    return NextResponse.json({ error: '無効なURL形式です。' }, { status: 400 });
  }

  try {
    const response = await fetch(decodeURIComponent(targetUrl), {
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
    const ogp = getOgpInfo(html);

    return NextResponse.json(ogp);
  } catch (error) {
    console.error(`Error processing OGP for ${targetUrl}:`, error);
    if ((error as Error).name === 'AbortError') {
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
