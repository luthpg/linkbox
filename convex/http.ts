import { type Bookmark, BookmarkFormSchema } from '@/types/bookmark';
import { httpRouter } from 'convex/server';
import { ZodError } from 'zod';
import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { sha256 } from './lib/utils';

const http = httpRouter();

http.route({
  path: '/api/bookmarks',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        '認証情報が不足しています。Bearerトークンが必要です。',
        {
          status: 401,
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        },
      );
    }
    const providedApiKey = authHeader.substring(7);
    const hashedProvidedApiKey = await sha256(providedApiKey);

    // APIキーの検証とConvexユーザーIDの特定
    // internalValidateApiKeyはConvexの_idを返すことを想定
    const userId = await ctx.runQuery(internal.apiKeys.internalValidateApiKey, {
      hashedApiKey: hashedProvidedApiKey,
    });

    if (!userId) {
      return new Response('無効なAPIキーです。', {
        status: 401,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    let body: { args: Bookmark };
    try {
      body = await request.json();
    } catch (e) {
      return new Response('無効なJSONボディです。', {
        status: 400,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    try {
      if (typeof body.args.tags === 'string') {
        body.args.tags = (body.args.tags as string).split(',');
      }
      const validatedData = BookmarkFormSchema.parse(body.args);

      const memoToSave =
        validatedData.memo != null && validatedData.memo !== ''
          ? validatedData.memo
          : undefined;

      const bookmarkId = await ctx.runMutation(
        internal.bookmarks.createBookmarkByApi,
        {
          userId: userId,
          url: validatedData.url,
          title: validatedData.title,
          memo: memoToSave,
          tags: validatedData.tags ?? [],
        },
      );

      return new Response(
        JSON.stringify({
          id: bookmarkId,
          message: 'Bookmark created successfully',
        }),
        {
          status: 201,
          headers: new Headers({ 'Content-Type': 'application/json' }),
        },
      );
    } catch (e) {
      if (e instanceof ZodError) {
        console.error('バリデーションエラー:', e.errors);
        return new Response(
          JSON.stringify({ error: 'バリデーションエラー', details: e.errors }),
          {
            status: 400,
            headers: new Headers({ 'Content-Type': 'application/json' }),
          },
        );
      }
      console.error('予期せぬエラー:', e);
      return new Response('サーバー内部エラーが発生しました。', {
        status: 500,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }
  }),
});

export default http;
