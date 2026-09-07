"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { ConvexError } from "convex/values";

function getAnonSessionId() {
  if (typeof window === "undefined") return null;
  let sessionId = localStorage.getItem("anonSessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("anonSessionId", sessionId);
  }
  return sessionId;
}

export function Question({ question, showResults = true, audienceMode = false }: { question: { _id: Id<"questions">, text: string, options: string[] }, showResults?: boolean, audienceMode?: boolean }) {
  const anonSessionId = getAnonSessionId();
  const myVote = useQuery(api.votes.getMyVote, {
    questionId: question._id,
    anonSessionId: anonSessionId ?? undefined
  });
  const votes = useQuery(api.votes.getVotes, { questionId: question._id });
  const vote = useMutation(api.votes.vote);

  const [votedOption, setVotedOption] = useState<number | null>(null);

  useEffect(() => {
    if (myVote) {
      setVotedOption(myVote.optionIndex);
    }
  }, [myVote]);

  const totalVotes = votes ? Object.values(votes).reduce((a, b) => a + b, 0) : 0;

  async function handleVote(optionIndex: number) {
    try {
      await vote({
        questionId: question._id,
        optionIndex,
        anonSessionId: anonSessionId ?? undefined,
      });
      setVotedOption(optionIndex);
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ?
          error.data
          :
          "Unexpected error occurred";
      toast.error(errorMessage)
    }
  }

  const hasVoted = votedOption !== null;


  return (
    <div className={cn("border border-border rounded-lg p-4 space-y-4", audienceMode && "audience-question")}>
      <p className="font-medium text-lg">{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          if (hasVoted && showResults) {
            const voteCount = votes?.[index] ?? 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const isMyVote = votedOption === index;
            const isTextInsideBar = percentage === 100;

            return (
              <div key={index} className="relative w-full h-10 border rounded-md overflow-hidden">
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full bg-muted transition-all duration-500",
                    isMyVote && "bg-primary/50"
                  )}
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative z-10 flex items-center justify-between w-full h-full px-4">
                  <span className={cn("font-medium", isMyVote && "text-primary-foreground")}>
                    {option}
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      isMyVote && isTextInsideBar ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );

          }

          if (hasVoted) {
            return <div key={index} className="w-full rounded-md border border-border px-4 py-3 text-muted-foreground">{option}</div>;
          }
          return (
            <Button key={index} onClick={() => handleVote(index)} className={cn("w-full justify-start", audienceMode && "audience-option")} variant="outline">
              {option}
            </Button>
          );
        })}
      </div>
      {hasVoted && (showResults ? <p className="text-xs text-muted-foreground text-right">{totalVotes} total votes</p> : <p className="text-sm text-muted-foreground">Vote received. Results will appear when the presenter reveals them.</p>)}
    </div>
  );
}
