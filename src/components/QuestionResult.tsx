"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function QuestionResult({ question }: { question: { _id: Id<"questions">, text: string, options: string[] } }) {
  const votes = useQuery(api.votes.getVotes, { questionId: question._id });

  const totalVotes = votes ? Object.values(votes).reduce((a, b) => a + b, 0) : 0;

  return (
    <li className="border-border border rounded-lg p-6 shadow-sm">
      <p className="font-medium text-2xl mb-6">{question.text}</p>
      <div className="space-y-4">
        {question.options.map((option, index) => {
          const voteCount = votes?.[index] ?? 0;
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
            </div>
          );
        })}
      </div>
    </li>
  );
}
