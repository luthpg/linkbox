import type { ApiKey } from '@/types/api-key';
import { v } from 'convex/values';
import { customAlphabet } from 'nanoid';
import { internal } from './_generated/api';
import { internalQuery, mutation, query } from './_generated/server';
import { sha256 } from './lib/utils';

// nanoidを使ってAPIキーの一部を生成（よりランダムで安全なキーにするため）
const generateSecureId = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  32,
);

// APIキーのプレfix
const API_KEY_PREFIX = 'sk_';

/**
 * 現在認証されているユーザーのAPIキー一覧を取得するクエリ。
 */
export const getApiKeys = query({
  args: {},
  handler: async (ctx): Promise<ApiKey[] | null> => {
    // Clerkの認証情報からuserIdを取得
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
      return [];
    }

    const apiKeys = await ctx.db
      .query('apiKeys')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect();

    return apiKeys.map((key) => ({
      id: key._id.toString(),
      name: key.name,
      created_at: new Date(key._creationTime).toISOString(),
      user_id: key.userId,
      hashed_api_key: key.hashedApiKey,
    }));
  },
});

/**
 * 新しいAPIキーを生成するミューテーション。
 */
export const generateApiKey = mutation({
  args: { name: v.optional(v.string()) },
  handler: async (ctx, { name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('認証されていません。');
    }
    const clerkUserId = identity.subject;

    // ClerkのuserIdでConvexのユーザーを検索
    // ユーザーがConvexに存在しない場合、作成する内部ミューテーションを呼び出す
    let user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    if (!user) {
      // ユーザーが存在しない場合、内部ミューテーションを呼び出してユーザーを作成
      const userId = await ctx.runMutation(internal.users.createConvexUser, {
        clerkUserId: clerkUserId,
        email: identity.email || undefined,
        name: identity.name || undefined,
        pictureUrl: identity.pictureUrl || undefined,
      });
      user = (await ctx.db.get(userId))!;
    }

    const rawApiKey = API_KEY_PREFIX + generateSecureId();
    const hashedApiKey = await sha256(rawApiKey);

    const apiKeyId = await ctx.db.insert('apiKeys', {
      userId: user._id,
      hashedApiKey: hashedApiKey,
      name: name,
    });

    return {
      id: apiKeyId.toString(),
      api_key: rawApiKey,
      name: name,
      created_at: new Date(Date.now()).toISOString(),
    };
  },
});

/**
 * 指定されたIDのAPIキーを削除するミューテーション。
 */
export const deleteApiKey = mutation({
  args: { id: v.id('apiKeys') },
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

    const apiKey = await ctx.db.get(id);
    if (!apiKey || apiKey.userId !== user._id) {
      throw new Error('このAPIキーを削除する権限がありません。');
    }

    await ctx.db.delete(id);
  },
});

/**
 * 内部的に呼び出されるクエリ: ハッシュ化されたAPIキーを検証し、対応するユーザーIDを返す。
 * HTTPアクションから認証のために使用される。
 */
export const internalValidateApiKey = internalQuery({
  args: { hashedApiKey: v.string() },
  handler: async (ctx, { hashedApiKey }) => {
    const apiKey = await ctx.db
      .query('apiKeys')
      .withIndex('by_hashedApiKey', (q) => q.eq('hashedApiKey', hashedApiKey))
      .first();

    if (!apiKey) {
      return null;
    }

    return apiKey.userId; // ConvexユーザーIDを返す
  },
});
