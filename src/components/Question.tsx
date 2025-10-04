"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

function getAnonSessionId() {
  if (typeof window === "undefined") return null;
  let sessionId = localStorage.getItem("anonSessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("anonSessionId", sessionId);
  }
  return sessionId;
}

export function Question({ question }: { question: { _id: Id<"questions">, text: string, options: string[] } }) {
  const votes = useQuery(api.votes.getVotes, { questionId: question._id });
  const vote = useMutation(api.votes.vote);
  const [voted, setVoted] = useState<number | null>(null);

  const totalVotes = votes ? Object.values(votes).reduce((a, b) => a + b, 0) : 0;

  async function handleVote(optionIndex: number) {
    const anonSessionId = getAnonSessionId();
    try {
      await vote({
        questionId: question._id,
        optionIndex,
        anonSessionId: anonSessionId ?? undefined,
      });
      setVoted(optionIndex);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  }

  return (
    <li className="border p-3 mb-4 rounded">
      <p className="font-medium text-lg mb-2">{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const voteCount = votes?.[index] ?? 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

          return (
            <div key={index}>
              {voted === null ? (
                <Button onClick={() => handleVote(index)} className="w-full justify-start">
                  {option}
                </Button>
              ) : (
                <div className="relative w-full h-10 border rounded overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-200"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="relative z-10 flex items-center justify-between w-full h-full px-4">
                    <span>{option}</span>
                    <span className="font-bold">{voteCount} ({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </li>
  );
}
