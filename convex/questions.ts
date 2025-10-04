import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a question to a poll
export const addQuestion = mutation({
  args: {
    pollId: v.id("polls"),
    text: v.string(),
    options: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new Error("Poll not found");

    const now = Date.now();
    const questionId = await ctx.db.insert("questions", {
      pollId: args.pollId,
      text: args.text,
      options: args.options,
      createdAt: now,
    });

    return questionId;
  },
});

// Get all questions for a poll
export const getQuestions = query({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();
  },
});
