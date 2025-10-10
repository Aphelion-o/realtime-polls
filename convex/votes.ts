import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUser } from "./users";

export const vote = mutation({
  args: {
    questionId: v.id("questions"),
    optionIndex: v.number(),
    anonSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new ConvexError("Question not found");

    const poll = await ctx.db.get(question.pollId);
    if (!poll) throw new ConvexError("Poll not found");
    if (!poll.isActive) throw new ConvexError("This pole has ended");

    const userRecord = await getCurrentUser(ctx);

    if (!poll.allowAnonymous && !userRecord) {
      throw new ConvexError("Login required to vote");
    }

    const voterKey = userRecord
      ? { userId: userRecord._id }
      : { anonSessionId: args.anonSessionId! };

    // Prevent duplicate votes
    const existing = await ctx.db
      .query("votes")
      .withIndex(userRecord ? "by_user_question" : "by_anon_question", (q) =>
        userRecord
          ? q.eq("userId", voterKey.userId!).eq("questionId", args.questionId)
          : q
              .eq("anonSessionId", args.anonSessionId!)
              .eq("questionId", args.questionId)
      )
      .unique();

    if (existing) throw new ConvexError("Already voted");

    await ctx.db.insert("votes", {
      questionId: args.questionId,
      optionIndex: args.optionIndex,
      createdAt: Date.now(),
      ...voterKey,
    });
  },
});

// Realtime votes for a question
export const getVotes = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();

    // Aggregate votes per option
    const counts: Record<number, number> = {};
    for (const v of votes) {
      counts[v.optionIndex] = (counts[v.optionIndex] ?? 0) + 1;
    }

    return counts;
  },
});

// Get the current user's vote for a question
export const getMyVote = query({
  args: {
    questionId: v.id("questions"),
    anonSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userRecord = await getCurrentUser(ctx);

    if (!userRecord && !args.anonSessionId) {
      return null;
    }

    const voterKey = userRecord
      ? { userId: userRecord._id }
      : { anonSessionId: args.anonSessionId! };

    const existingVote = await ctx.db
      .query("votes")
      .withIndex(userRecord ? "by_user_question" : "by_anon_question", (q) =>
        userRecord
          ? q.eq("userId", voterKey.userId!).eq("questionId", args.questionId)
          : q
              .eq("anonSessionId", args.anonSessionId!)
              .eq("questionId", args.questionId)
      )
      .unique();

    return existingVote;
  },
});

// Realtime votes for a question with user info
export const getVotesWithUsers = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .order("desc")
      .collect();

    return Promise.all(
      votes.map(async (vote) => {
        if (!vote.userId) {
          return {
            ...vote,
            user: null,
          };
        }
        const user = await ctx.db.get(vote.userId);
        return {
          ...vote,
          user,
        };
      })
    );
  },
});
