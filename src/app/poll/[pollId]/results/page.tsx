"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { NotFound } from "@/components/NotFound";
import { Spinner } from "@/components/ui/spinner";
import { ResultsCard } from "@/components/ResultsCard";

export default function PollResultsPage({
  params,
}: {
  params: Promise<{ pollId: Id<"polls"> }>;
}) {
  const { pollId } = use(params);
  const poll = useQuery(api.polls.getPoll, { pollId });

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
    <div className="container mx-auto p-4 sm:p-6 mt-10 max-w-3xl">
      <div className="text-center sm:text-left space-y-1 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Results: {poll.title}</h1>
        {poll.description && (
          <p className="text-muted-foreground text-base sm:text-lg">
            {poll.description}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {poll.questions.map((q) => (
          <ResultsCard key={q._id} question={q} poll={poll} />
        ))}
      </div>
    </div>
  );
}
