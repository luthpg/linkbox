import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { internalMutation, mutation, query } from './_generated/server';

/**
 * 現在認証されているユーザーのConvexユーザー情報を取得するクエリ。
 * ClerkのuserIdを基にConvexのユーザーを検索または作成します。
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
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
      return null;
    }

    return user;
  },
});

/**
 * 内部ミューテーション: 新しいConvexユーザーを作成する。
 * `getCurrentUser` クエリからユーザーが存在しない場合に呼び出される。
 */
export const createConvexUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { clerkUserId, email, name, pictureUrl },
  ): Promise<Id<'users'>> => {
    const userId = await ctx.db.insert('users', {
      tokenIdentifier: clerkUserId,
      email: email,
      name: name,
      pictureUrl: pictureUrl,
    });
    return userId;
  },
});

/**
 * ユーザー情報の更新クエリ (例: 名前やプロフィール画像など、ClerkにないカスタムデータをConvexに保存する場合)
 */
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, { name, email, pictureUrl }) => {
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

    await ctx.db.patch(user._id, {
      name: name,
      email: email,
      pictureUrl: pictureUrl,
    });
  },
});
