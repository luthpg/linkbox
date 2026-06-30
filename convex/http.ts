import type { WebhookEvent } from '@clerk/nextjs/server';
import { httpRouter } from 'convex/server';
import { Webhook } from 'svix';
import { ZodError } from 'zod';
import { internal } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { httpAction } from '@/convex/_generated/server';
import { decodeHtmlEntities, sha256 } from '@/convex/lib/utils';
import { getOgpInfo } from '@/lib/ogp';
import { type Bookmark, BookmarkFormSchema } from '@/types/bookmark';
import type { ScraperState } from '@/types/tabelog';

const http = httpRouter();

interface BookmarkPayload {
  url: string;
  title: string;
  memo?: string;
  tags: string | string[];
}

http.route({
  path: '/api/bookmarks',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
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

    const userId = await ctx.runQuery(internal.apiKeys.internalValidateApiKey, {
      hashedApiKey: hashedProvidedApiKey,
    });

    if (!userId) {
      return new Response('無効なAPIキーです。', {
        status: 401,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    let body: { args: BookmarkPayload };
    try {
      body = await request.json();
    } catch (_e) {
      return new Response('無効なJSONボディです。', {
        status: 400,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    try {
      const response = await fetch(decodeURIComponent(body.args.url), {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.warn(
          `Failed to fetch URL ${body.args.url}: ${response.status} ${response.statusText}`,
        );
        return new Response(
          `URLのフェッチに失敗しました: ${response.statusText}`,
          {
            headers: new Headers({ 'Content-Type': 'text/plain' }),
            status: response.status,
          },
        );
      }

      const html = await response.text();
      const ogp = getOgpInfo(html);
      body.args.title = ogp.ogTitle ?? body.args.title;
      body.args.memo = ogp.ogDescription ?? body.args.memo;
    } catch (e) {
      console.warn(
        `(OGP fetch error) Failed to fetch URL ${body.args.url}: ${(e as Error).message}`,
      );
    }

    try {
      if (typeof body.args.tags === 'string') {
        body.args.tags = body.args.tags.split(',');
      }
      const validatedData = BookmarkFormSchema.parse(body.args as Bookmark);

      const memoToSave =
        validatedData.memo != null && validatedData.memo !== ''
          ? decodeHtmlEntities(validatedData.memo)
          : undefined;

      const bookmarkId = await ctx.runMutation(
        internal.bookmarks.createBookmarkByApi,
        {
          userId: userId,
          url: validatedData.url,
          title: decodeHtmlEntities(validatedData.title),
          memo: memoToSave,
          tags: validatedData.tags?.map((t) => decodeHtmlEntities(t)) ?? [],
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
        console.error('バリデーションエラー:', e.message);
        return new Response(
          JSON.stringify({ error: 'バリデーションエラー', details: e.message }),
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

http.route({
  path: '/api/tabelog',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
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

    const userId = await ctx.runQuery(internal.apiKeys.internalValidateApiKey, {
      hashedApiKey: hashedProvidedApiKey,
    });

    if (!userId) {
      return new Response('無効なAPIキーです。', {
        status: 401,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    let body: ScraperState;

    try {
      body = await request.json();
    } catch (_e) {
      return new Response('無効なJSONボディです。', {
        status: 400,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    try {
      const bookmarks = await ctx.runQuery(
        internal.bookmarks.getBookmarksByApi,
        { userId },
      );
      const bookmarkIds = await Promise.all(
        body.data.map(async ({ name, url, area, genre, rate }) => {
          let bookmarkId: string | null;
          bookmarkId = bookmarks.find((b) => b.url === url)?.id ?? null;

          if (body.withUpdate && bookmarkId != null) {
            bookmarkId = await ctx.runMutation(
              internal.bookmarks.updateBookmarkByApi,
              {
                id: bookmarkId as Id<'bookmarks'>,
                url: url,
                title: name,
                tags: [
                  ...(area ?? []).map((a) => `食べログ/${a}`),
                  ...(genre ?? []).map((g) => `食べログ/${g}`),
                ],
                memo: `食べログ評価：${rate}`,
              },
            );
            return bookmarkId;
          }
          if (bookmarkId == null) {
            bookmarkId = await ctx.runMutation(
              internal.bookmarks.createBookmarkByApi,
              {
                userId: userId,
                url: url,
                title: name,
                tags: [
                  ...(area ?? []).map((a) => `食べログ/${a}`),
                  ...(genre ?? []).map((g) => `食べログ/${g}`),
                ],
                memo: `食べログ評価：${rate}`,
              },
            );
          }
          return bookmarkId;
        }),
      );

      return new Response(
        JSON.stringify({
          ids: bookmarkIds,
          message: 'Bookmark created/updated successfully',
        }),
        {
          status: 201,
          headers: new Headers({ 'Content-Type': 'application/json' }),
        },
      );
    } catch (e) {
      if (e instanceof ZodError) {
        console.error('バリデーションエラー:', e.message);
        return new Response(
          JSON.stringify({ error: 'バリデーションエラー', details: e.message }),
          {
            status: 400,
            headers: new Headers({ 'Content-Type': 'application/json' }),
          },
        );
      }
      console.error('予期せぬエラー:', (e as Error).message);
      return new Response('サーバー内部エラーが発生しました。', {
        status: 500,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }
  }),
});

http.route({
  path: '/api/tags',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
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

    const userId = await ctx.runQuery(internal.apiKeys.internalValidateApiKey, {
      hashedApiKey: hashedProvidedApiKey,
    });

    if (!userId) {
      return new Response('無効なAPIキーです。', {
        status: 401,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    try {
      const uniqueTags = await ctx.runQuery(
        internal.bookmarks.getAllUniqueTagsForUser,
        { userId: userId },
      );

      return new Response(JSON.stringify(uniqueTags), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    } catch (e) {
      console.error('Error fetching unique tags:', e);
      return new Response('サーバー内部エラーが発生しました。', {
        status: 500,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }
  }),
});

async function validateRequest(
  req: Request,
): Promise<WebhookEvent | undefined> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  const payloadString = await req.text();
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  };

  const wh = new Webhook(webhookSecret);
  try {
    const event = wh.verify(payloadString, svixHeaders) as WebhookEvent;
    return event;
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return undefined;
  }
}

http.route({
  path: '/api/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response('Could not validate request', { status: 400 });
    }

    if (event.type === 'user.deleted') {
      const clerkUserId = event.data.id;
      if (!clerkUserId) {
        return new Response('Clerk User ID not found in webhook payload', {
          status: 400,
        });
      }
      await ctx.runMutation(internal.users.deleteUserAndData, {
        clerkUserId,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
