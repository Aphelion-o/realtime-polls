"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export function ResultsCard({
  question,
  poll
}: {
  question: { _id: Id<"questions">, text: string, options: string[] },
  poll: Doc<"polls">
}) {
  const votes = useQuery(api.votes.getVotesWithUsers, { questionId: question._id });

  const voteCounts =
    votes?.reduce((acc, vote) => {
      acc[vote.optionIndex] = (acc[vote.optionIndex] ?? 0) + 1;
      return acc;
    }, {} as Record<number, number>) ?? {};

  const totalVotes = votes?.length ?? 0;

  return (
    <div className="border-border border rounded-lg p-6 shadow-sm">
      <p className="font-medium text-2xl mb-6">{question.text}</p>
      <div className="space-y-4">
        {question.options.map((option, index) => {
          const voteCount = voteCounts[index] ?? 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-lg">
                <span>{option}</span>
                <span className="font-bold">{voteCount}</span>
              </div>
              <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              {!poll.allowAnonymous && (
                <div className="pt-2">
                  {voteCount != 0 && (
                      <>
                        <h4 className="font-semibold">Voters:</h4>
                        <ul className="list-disc list-inside">
                          {votes
                            ?.filter(v => v.optionIndex === index)
                            .map(v => (
                              <li key={v._id} className="text-sm text-muted-foreground">
                                {v.user?.clerkUser.first_name ?? v.user?.clerkUser.username ?? "Anonymous"}
                              </li>
                            ))}
                        </ul>
                      </>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
