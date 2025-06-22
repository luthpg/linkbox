import type { Bookmark } from '@/types/bookmark';
import { v } from 'convex/values';
import { internal } from './_generated/api'; // internal api をインポート
import type { Id } from './_generated/dataModel';
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import { decodeHtmlEntities } from './lib/utils';

/**
 * 現在認証されているユーザーのブックマーク一覧を取得するクエリ。
 */
export const getBookmarks = query({
  args: {},
  handler: async (ctx): Promise<Bookmark[] | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // 認証されていない場合はnullを返す
    }
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    if (!user) {
      // ユーザーがConvexに存在しない場合、（通常はgetCurrentUserが事前に作成するため稀だが）エラー
      return [];
    }

    const bookmarks = await ctx.db
      .query('bookmarks')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    return bookmarks.map((b) => ({
      ...b,
      id: b._id.toString(),
      user_id: b.userId.toString(),
      created_at: new Date(b._creationTime).toISOString(),
    }));
  },
});

/**
 * 指定されたIDの単一のブックマークを取得するクエリ。
 */
export const getBookmark = query({
  args: { id: v.id('bookmarks') },
  handler: async (ctx, { id }): Promise<Bookmark | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // 認証されていない場合はnullを返す
    }
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    if (!user) {
      throw new Error('ユーザーが見つかりませんでした。');
    }

    const bookmark = await ctx.db.get(id);
    if (!bookmark || bookmark.userId !== user._id) {
      return null; // 見つからないか、権限がない場合はnullを返す
    }

    return {
      id: bookmark._id.toString(),
      user_id: bookmark.userId.toString(),
      url: bookmark.url,
      title: bookmark.title,
      memo: bookmark.memo,
      tags: bookmark.tags,
      created_at: new Date(bookmark._creationTime).toISOString(),
    };
  },
});

export const getFilteredBookmarks = query({
  args: {
    tag: v.optional(v.string()),
  },
  handler: async (ctx, { tag }): Promise<Bookmark[] | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    if (!user) {
      return [];
    }

    const bookmarksQuery = ctx.db
      .query('bookmarks')
      .withIndex('by_userId', (q) => q.eq('userId', user._id));

    if (tag) {
      const allBookmarks = await bookmarksQuery.order('desc').collect();
      const filtered = allBookmarks.filter((b) => b.tags.includes(tag));
      return filtered.map((b) => ({
        ...b,
        id: b._id.toString(),
        user_id: b.userId.toString(),
        created_at: new Date(b._creationTime).toISOString(),
      }));
    }

    const bookmarks = await bookmarksQuery.order('desc').collect();
    return bookmarks.map((b) => ({
      ...b,
      id: b._id.toString(),
      user_id: b.userId.toString(),
      created_at: new Date(b._creationTime).toISOString(),
    }));
  },
});

/**
 * 新しいブックマークを作成するミューテーション (GUIから呼び出し用)。
 */
export const createBookmark = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    memo: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, { url, title, memo, tags }): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('認証されていません。');
    }
    const clerkUserId = identity.subject;

    let user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    if (!user) {
      const userId: Id<'users'> = await ctx.runMutation(
        internal.users.createConvexUser,
        {
          clerkUserId: clerkUserId,
          email: identity.email || undefined,
          name: identity.name || undefined,
          pictureUrl: identity.pictureUrl || undefined,
        },
      );
      const newUser = await ctx.db.get(userId);
      if (!newUser) {
        throw new Error('ユーザーの作成に失敗しました。');
      }
      user = newUser;
    }

    const newBookmarkId: Id<'bookmarks'> = await ctx.db.insert('bookmarks', {
      userId: user._id,
      url,
      title: decodeHtmlEntities(title),
      memo: memo != null ? decodeHtmlEntities(memo) : memo,
      tags: tags.map((t) => decodeHtmlEntities(t)),
    });
    return newBookmarkId.toString();
  },
});

/**
 * 既存のブックマークを更新するミューテーション。
 */
export const updateBookmark = mutation({
  args: {
    id: v.id('bookmarks'),
    url: v.string(),
    title: v.string(),
    memo: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, { id, url, title, memo, tags }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('認証されていません。');
    }
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    if (!user) {
      throw new Error('ユーザーが見つかりませんでした。');
    }

    const bookmark = await ctx.db.get(id);
    if (!bookmark || bookmark.userId !== user._id) {
      throw new Error('このブックマークを更新する権限がありません。');
    }

    await ctx.db.patch(id, {
      url,
      title: decodeHtmlEntities(title),
      memo: memo != null ? decodeHtmlEntities(memo) : memo,
      tags: tags.map((t) => decodeHtmlEntities(t)),
    });
  },
});

/**
 * 指定されたIDのブックマークを削除するミューテーション。
 */
export const deleteBookmark = mutation({
  args: { id: v.id('bookmarks') },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('認証されていません。');
    }
    const clerkUserId = identity.subject;

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    if (!user) {
      throw new Error('ユーザーが見つかりませんでした。');
    }

    const bookmark = await ctx.db.get(id);
    if (!bookmark || bookmark.userId !== user._id) {
      throw new Error('このブックマークを削除する権限がありません。');
    }

    await ctx.db.delete(id);
  },
});

/**
 * HTTPアクション (APIキー認証) から呼び出される、ブックマーク作成用の内部ミューテーション。
 * 認証済みのユーザーIDを直接受け取る。
 */
export const createBookmarkByApi = internalMutation({
  args: {
    userId: v.id('users'), // APIキーで認証されたユーザーのConvex ID
    url: v.string(),
    title: v.string(),
    memo: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, { userId, url, title, memo, tags }) => {
    const newBookmarkId = await ctx.db.insert('bookmarks', {
      userId: userId,
      url,
      title: decodeHtmlEntities(title),
      memo: memo != null ? decodeHtmlEntities(memo) : memo,
      tags: tags.map((t) => decodeHtmlEntities(t)),
    });
    return newBookmarkId.toString();
  },
});

/**
 * 内部クエリ: 指定されたConvexユーザーIDに紐づく全てのブックマークから、
 * ユニークなタグのリストを取得します。
 * HTTPアクションから認証後に呼び出されることを想定しています。
 */
export const getAllUniqueTagsForUser = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    const bookmarks = await ctx.db
      .query('bookmarks')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    const uniqueTags = new Set<string>();
    for (const bookmark of bookmarks) {
      for (const tag of bookmark.tags) {
        uniqueTags.add(tag);
      }
    }

    // Setを配列に変換して返す
    return Array.from(uniqueTags).sort();
  },
});
