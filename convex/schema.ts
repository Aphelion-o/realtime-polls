import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // this is UserJSON from @clerk/backend
    clerkUser: v.any(),
    color: v.string(),
  }).index("by_clerk_id", ["clerkUser.id"]),

  polls: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    presentationQuestionIndex: v.optional(v.number()),
    votingEndsAt: v.optional(v.number()),
    votingTimerId: v.optional(v.id("_scheduled_functions")),
    votingRemainingMs: v.optional(v.number()),
    hasVotingStarted: v.optional(v.boolean()),
    isVotingPaused: v.optional(v.boolean()),
    showResults: v.optional(v.boolean()),
    allowAnonymous: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["createdBy"]),

  questions: defineTable({
    pollId: v.id("polls"),
    text: v.string(),
    options: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_poll", ["pollId"]),

  votes: defineTable({
    questionId: v.id("questions"),
    userId: v.optional(v.id("users")),
    anonSessionId: v.optional(v.string()),
    optionIndex: v.number(),
    createdAt: v.number(),
  })
    .index("by_question", ["questionId"])
    .index("by_user_question", ["userId", "questionId"])
    .index("by_anon_question", ["anonSessionId", "questionId"]),
});
