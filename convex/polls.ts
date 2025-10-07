import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
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
    if (!poll) throw new Error("Poll not found");

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
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new Error("Poll not found");

    // Ensure only the owner can modify the poll
    if (poll.createdBy !== user._id) {
      throw new Error("You are not authorized to modify this poll.");
    }

    await ctx.db.patch(args.pollId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});

// Delete a poll
export const deletePoll = mutation({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new Error("Poll not found");

    // Ensure only the owner can delete the poll
    if (poll.createdBy !== user._id) {
      throw new Error("You are not authorized to delete this poll.");
    }

    // You might also want to delete associated questions and votes here
    // For now, we'll just delete the poll itself
    await ctx.db.delete(args.pollId);
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