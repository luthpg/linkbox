import type { Bookmark } from '@/types/bookmark';
import { v } from 'convex/values';
import { customAlphabet } from 'nanoid';
import { mutation, query } from './_generated/server';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export const getMySharedTags = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identity.subject),
      )
      .first();
    if (!user) return [];

    return await ctx.db
      .query('sharedTags')
      .withIndex('by_user_tag', (q) => q.eq('userId', user._id))
      .collect();
  },
});

export const shareTag = mutation({
  args: { tagName: v.string() },
  handler: async (ctx, { tagName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identity.subject),
      )
      .first();
    if (!user) throw new Error('User not found');

    const existingShare = await ctx.db
      .query('sharedTags')
      .withIndex('by_user_tag', (q) =>
        q.eq('userId', user._id).eq('tagName', tagName),
      )
      .first();

    if (existingShare) {
      if (!existingShare.isPublic) {
        await ctx.db.patch(existingShare._id, { isPublic: true });
      }
      return existingShare.shareId;
    }

    const shareId = nanoid();
    await ctx.db.insert('sharedTags', {
      userId: user._id,
      tagName,
      shareId,
      isPublic: true,
    });
    return shareId;
  },
});

export const unshareTag = mutation({
  args: { tagName: v.string() },
  handler: async (ctx, { tagName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identity.subject),
      )
      .first();
    if (!user) throw new Error('User not found');

    const existingShare = await ctx.db
      .query('sharedTags')
      .withIndex('by_user_tag', (q) =>
        q.eq('userId', user._id).eq('tagName', tagName),
      )
      .first();

    if (existingShare) {
      await ctx.db.delete(existingShare._id);
    }
  },
});

export const isTagShared = query({
  args: { tagName: v.string() },
  handler: async (ctx, { tagName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identity.subject),
      )
      .first();
    if (!user) return false;

    const existingShare = await ctx.db
      .query('sharedTags')
      .withIndex('by_user_tag', (q) =>
        q.eq('userId', user._id).eq('tagName', tagName),
      )
      .first();

    return !!existingShare;
  },
});

export const getPublicBookmarksByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    const shareInfo = await ctx.db
      .query('sharedTags')
      .withIndex('by_shareId', (q) => q.eq('shareId', shareId))
      .first();

    if (!shareInfo || !shareInfo.isPublic) {
      return null;
    }

    const { userId, tagName } = shareInfo;
    const user = await ctx.db.get(userId);

    const bookmarks = await ctx.db
      .query('bookmarks')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    const sharedBookmarks = bookmarks.filter((b) => b.tags.includes(tagName));

    return {
      tagName: tagName,
      bookmarks: sharedBookmarks.map((bookmark) => ({
        id: bookmark._id.toString(),
        user_id: bookmark.userId.toString(),
        url: bookmark.url,
        title: bookmark.title,
        memo: bookmark.memo,
        tags: bookmark.tags,
        created_at: new Date(bookmark._creationTime).toISOString(),
      })) as Bookmark[],
      ownerName: user?.name,
    };
  },
});

export const getMyAllTags = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', identity.subject),
      )
      .first();
    if (!user) return [];

    const bookmarks = await ctx.db
      .query('bookmarks')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect();

    const tagSet = new Set<string>();
    for (const b of bookmarks) {
      if (Array.isArray(b.tags)) {
        for (const t of b.tags) {
          tagSet.add(t);
        }
      }
    }
    return Array.from(tagSet).sort();
  },
});
