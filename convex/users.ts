import { v } from 'convex/values';
import { internal } from './_generated/api';
// convex/users.ts
import { internalMutation, mutation, query } from './_generated/server';

/**
 * 現在認証されているユーザーのConvexユーザー情報を取得するクエリ。
 * ClerkのuserIdを基にConvexのユーザーを検索または作成します。
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Clerkの認証情報からuserIdを取得
    // ctx.auth.getUserIdentity() は ClerkProviderWithConvex によってClerkの認証情報を提供します。
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null; // 認証されていない
    }

    // ClerkのuserIdはidentity.subject (JWTのsubクレーム) に格納される
    const clerkUserId = identity.subject;

    // ClerkのuserIdでConvexのユーザーを検索
    let user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', clerkUserId),
      )
      .first();

    // ユーザーがConvexに存在しない場合、作成するミューテーションを呼び出す
    // クエリ内でミューテーションを直接呼び出すことはできないため、内部ミューテーションを`ctx.runMutation`で呼び出す
    if (!user) {
      // 内部ミューテーションを呼び出してユーザーを作成
      // internalは_generated/apiからインポートする
      const userId = await ctx.runMutation(internal.users.createConvexUser, {
        clerkUserId: clerkUserId,
        email: identity.email || undefined, // Clerkから提供されるメールアドレスがあれば
        name: identity.name || undefined, // Clerkから提供される名前があれば
        pictureUrl: identity.pictureUrl || undefined, // Clerkから提供される画像URLがあれば
      });
      // 作成されたユーザーを再取得
      user = (await ctx.db.get(userId))!;
    }

    return user; // ユーザーオブジェクトを返す (Convexの_id, _creationTimeなどを含む)
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
  handler: async (ctx, { clerkUserId, email, name, pictureUrl }) => {
    // 新しいユーザーをusersテーブルに挿入
    const userId = await ctx.db.insert('users', {
      tokenIdentifier: clerkUserId, // ClerkのuserIdをConvexのtokenIdentifierとして保存
      email: email,
      name: name,
      pictureUrl: pictureUrl,
    });
    return userId; // 新しく作成されたConvexユーザーのIDを返す
  },
});

/**
 * ユーザー情報の更新クエリ (例: 名前やプロフィール画像など、ClerkにないカスタムデータをConvexに保存する場合)
 */
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    // その他のプロフィールフィールド
  },
  handler: async (ctx, { name }) => {
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
    });
  },
});
