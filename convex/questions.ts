import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { mustGetCurrentUser } from "./users";

// Add a question to a poll
export const addQuestion = mutation({
  args: {
    pollId: v.id("polls"),
    text: v.string(),
    options: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");

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

// Update a question
export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    text: v.string(),
    options: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userRecord = await mustGetCurrentUser(ctx);
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new ConvexError("Question not found");

    const poll = await ctx.db.get(question.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== userRecord._id) throw new ConvexError("Not authorized");

    await ctx.db.patch(args.questionId, {
      text: args.text,
      options: args.options,
    });
  },
});

// Delete a question
export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const userRecord = await mustGetCurrentUser(ctx);
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new ConvexError("Question not found");

    const poll = await ctx.db.get(question.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== userRecord._id) throw new ConvexError("Not authorized");

    // Delete all votes for the question
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_question", (v) => v.eq("questionId", args.questionId))
      .collect();
    for (const v of votes) {
      await ctx.db.delete(v._id);
    }

    // Delete the question itself
    await ctx.db.delete(args.questionId);
  },
});
