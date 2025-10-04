import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const vote = mutation({
  args: {
    questionId: v.id("questions"),
    optionIndex: v.number(),
    anonSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const poll = await ctx.db.get(question.pollId);
    if (!poll) throw new Error("Poll not found");
    if (!poll.isActive) throw new Error("Poll is closed");

    const userRecord = await getCurrentUser(ctx);

    if (!poll.allowAnonymous && !userRecord) {
      throw new Error("Login required to vote");
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

    if (existing) throw new Error("Already voted");

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
