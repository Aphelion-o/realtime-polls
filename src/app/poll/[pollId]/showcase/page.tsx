"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QuestionResult } from "@/components/QuestionResult";
import { NotFound } from "@/components/NotFound";
import { use } from "react";

export default function PollShowcasePage({ params }: { params: Promise<{ pollId: Id<"polls"> }> }) {
  const { pollId } = use(params);

  const poll = useQuery(api.polls.getPoll, { pollId: pollId });

  if (poll === undefined) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (poll === null) {
    return <NotFound item="poll" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">{poll.title}</h1>
        {poll.description && <p className="text-2xl text-muted-foreground mt-2">{poll.description}</p>}
      </header>

      <div className="max-w-4xl mx-auto">
        <ul className="space-y-10">
          {poll.questions.map((question) => (
            <QuestionResult key={question._id} question={question} />
          ))}
        </ul>
      </div>
    </div>
  );
}
