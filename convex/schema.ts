import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  messages: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    userId: v.string(),
  }).index('by_user', ['userId']),

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
  }).index('by_tokenIdentifier', ['tokenIdentifier']),
});
