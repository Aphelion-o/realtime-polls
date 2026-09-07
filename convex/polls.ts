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
      presentationQuestionIndex: undefined,
      votingEndsAt: undefined,
      isVotingPaused: true,
      showResults: false,
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

export const presentQuestion = mutation({
  args: { pollId: v.id("polls"), questionIndex: v.number() },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    const questions = await ctx.db.query("questions").withIndex("by_poll", (q) => q.eq("pollId", args.pollId)).collect();
    if (args.questionIndex < 0 || args.questionIndex >= questions.length) throw new ConvexError("Question not found");
    await ctx.db.patch(args.pollId, {
      presentationQuestionIndex: args.questionIndex,
      votingEndsAt: undefined,
      isVotingPaused: true,
      showResults: false,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

export const beginVoting = mutation({
  args: { pollId: v.id("polls"), durationSeconds: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    if (poll.presentationQuestionIndex === undefined) throw new ConvexError("Present a question first");
    const duration = args.durationSeconds ?? 30;
    await ctx.db.patch(args.pollId, { isVotingPaused: false, showResults: false, votingEndsAt: Date.now() + duration * 1000, isActive: true, updatedAt: Date.now() });
  },
});

export const pauseVoting = mutation({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    await ctx.db.patch(args.pollId, { isVotingPaused: true, updatedAt: Date.now() });
  },
});

export const addVotingTime = mutation({
  args: { pollId: v.id("polls"), seconds: v.number() },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    await ctx.db.patch(args.pollId, { votingEndsAt: Math.max(Date.now(), poll.votingEndsAt ?? Date.now()) + args.seconds * 1000, isVotingPaused: false, showResults: false, updatedAt: Date.now() });
  },
});

export const revealResults = mutation({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    await ctx.db.patch(args.pollId, { isVotingPaused: true, showResults: true, updatedAt: Date.now() });
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
