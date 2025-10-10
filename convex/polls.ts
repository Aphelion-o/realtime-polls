import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUser, mustGetCurrentUser } from "./users";

// Create a new poll
export const createPoll = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    allowAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userRecord = await mustGetCurrentUser(ctx);

    const now = Date.now();
    const pollId = await ctx.db.insert("polls", {
      title: args.title,
      description: args.description,
      allowAnonymous: args.allowAnonymous,
      createdBy: userRecord._id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return pollId;
  },
});

// Get a single poll with its questions
export const getPoll = query({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) return null;

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();

    return { ...poll, questions };
  },
});

// Close or reopen a poll
export const togglePollStatus = mutation({
  args: { pollId: v.id("polls"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const userRecord = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== userRecord._id) throw new ConvexError("Not authorized");

    await ctx.db.patch(args.pollId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});

// Get all polls for the current user
export const getMyPolls = query({
  handler: async (ctx) => {
    const userRecord = await getCurrentUser(ctx);
    if (!userRecord) {
      return [];
    }

    return await ctx.db
      .query("polls")
      .withIndex("by_user", (q) => q.eq("createdBy", userRecord._id))
      .order("desc")
      .collect();
  },
});

// Update a poll
export const updatePoll = mutation({
  args: {
    pollId: v.id("polls"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userRecord = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== userRecord._id) throw new ConvexError("Not authorized");

    await ctx.db.patch(args.pollId, {
      title: args.title,
      description: args.description,
      updatedAt: Date.now(),
    });
  },
});

// Delete a poll
export const deletePoll = mutation({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const userRecord = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== userRecord._id) throw new ConvexError("Not authorized");

    // Find all questions in the poll
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_poll", (q) => q.eq("pollId", args.pollId))
      .collect();

    // Delete all votes for each question
    for (const q of questions) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_question", (v) => v.eq("questionId", q._id))
        .collect();
      for (const v of votes) {
        await ctx.db.delete(v._id);
      }
      // Delete the question itself
      await ctx.db.delete(q._id);
    }

    // Finally, delete the poll
    await ctx.db.delete(args.pollId);
  },
});
