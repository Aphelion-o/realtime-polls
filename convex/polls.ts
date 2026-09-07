import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
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
      votingRemainingMs: undefined,
      hasVotingStarted: false,
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
      votingRemainingMs: undefined,
      hasVotingStarted: false,
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
    if (!Number.isFinite(duration) || duration <= 0) throw new ConvexError("Voting duration must be positive");
    const now = Date.now();
    const votingEndsAt = now + duration * 1000;
    await ctx.db.patch(args.pollId, {
      isVotingPaused: false,
      showResults: false,
      hasVotingStarted: true,
      votingRemainingMs: undefined,
      votingEndsAt,
      isActive: true,
      updatedAt: now,
    });
    await ctx.scheduler.runAt(votingEndsAt, internal.polls.finishVoting, { pollId: args.pollId, votingEndsAt });
  },
});

export const pauseVoting = mutation({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    if (poll.presentationQuestionIndex === undefined || poll.isVotingPaused || !poll.votingEndsAt) {
      throw new ConvexError("Voting is not running");
    }
    const now = Date.now();
    await ctx.db.patch(args.pollId, {
      isVotingPaused: true,
      votingEndsAt: undefined,
      votingRemainingMs: Math.max(0, poll.votingEndsAt - now),
      updatedAt: now,
    });
  },
});

export const addVotingTime = mutation({
  args: { pollId: v.id("polls"), seconds: v.number() },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    if (poll.presentationQuestionIndex === undefined) throw new ConvexError("Present a question first");
    if (!Number.isFinite(args.seconds) || args.seconds <= 0) throw new ConvexError("Time to add must be positive");
    const now = Date.now();
    const remainingMs = poll.isVotingPaused
      ? poll.votingRemainingMs ?? 0
      : Math.max(0, (poll.votingEndsAt ?? now) - now);
    const votingEndsAt = now + remainingMs + args.seconds * 1000;
    await ctx.db.patch(args.pollId, {
      votingEndsAt,
      votingRemainingMs: undefined,
      hasVotingStarted: true,
      isVotingPaused: false,
      showResults: false,
      isActive: true,
      updatedAt: now,
    });
    await ctx.scheduler.runAt(votingEndsAt, internal.polls.finishVoting, { pollId: args.pollId, votingEndsAt });
  },
});

export const revealResults = mutation({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (poll.createdBy !== user._id) throw new ConvexError("Not authorized");
    if (!poll.hasVotingStarted) throw new ConvexError("Start voting before showing results");
    if (poll.votingEndsAt && Date.now() < poll.votingEndsAt) throw new ConvexError("Wait until voting time has ended");
    if (poll.votingRemainingMs && poll.votingRemainingMs > 0) throw new ConvexError("Resume voting or wait until time has ended");
    await ctx.db.patch(args.pollId, { isVotingPaused: true, votingEndsAt: undefined, votingRemainingMs: 0, showResults: true, updatedAt: Date.now() });
  },
});

// A scheduled close makes the end of voting a shared server-side transition.
// Older jobs become harmless when a presenter pauses, extends, or restarts voting.
export const finishVoting = internalMutation({
  args: { pollId: v.id("polls"), votingEndsAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll || poll.votingEndsAt !== args.votingEndsAt) return null;
    await ctx.db.patch(args.pollId, {
      isVotingPaused: true,
      votingEndsAt: undefined,
      votingRemainingMs: 0,
      updatedAt: Date.now(),
    });
    return null;
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
