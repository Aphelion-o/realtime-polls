"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QuestionResult } from "@/components/QuestionResult";
import { NotFound } from "@/components/NotFound";
import { use } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function PollShowcasePage({ params }: { params: Promise<{ pollId: Id<"polls"> }> }) {
  const { pollId } = use(params);

  const poll = useQuery(api.polls.getPoll, { pollId: pollId });

  const me = useQuery(api.users.currentUser);
  const isOwner = me && poll && me._id === poll.createdBy;

  if (poll === undefined || me === undefined) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!isOwner) {
    return <div className="flex justify-center items-center h-[80vh]">You cannot access this page.</div>;
  }


  if (poll === null) {
    return <NotFound item="poll" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">{poll.title}</h1>
        {me?._id}
        {poll.description && <p className="text-2xl text-muted-foreground mt-2">{poll.description}</p>}
      </header>

      <div className="max-w-4xl mx-auto">
        <ul className="space-y-10">
          {poll.questions.map((question) => (
            <QuestionResult key={question._id} question={question} poll={poll} />
          ))}
        </ul>
      </div>
    </div>
  );
}
