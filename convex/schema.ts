import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  bookmarks: defineTable({
    userId: v.id('users'),
    url: v.string(),
    title: v.string(),
    memo: v.optional(v.string()),
    tags: v.array(v.string()),
  }).index('by_userId', ['userId']),

  apiKeys: defineTable({
    userId: v.id('users'),
    hashedApiKey: v.string(),
    name: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_hashedApiKey', ['hashedApiKey']),

  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  }).index('by_tokenIdentifier', ['tokenIdentifier']),

  sharedTags: defineTable({
    userId: v.id('users'),
    tagName: v.string(),
    shareId: v.string(),
    isPublic: v.boolean(),
  })
    .index('by_user_tag', ['userId', 'tagName'])
    .index('by_shareId', ['shareId']),
});
