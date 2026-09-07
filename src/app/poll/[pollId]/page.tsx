"use client";

import { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { Question } from "@/components/Question";
import { ShareButton } from "@/components/ShareButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditQuestionDialog } from "@/components/EditQuestionDialog";
import { DeleteQuestionButton } from "@/components/DeleteQuestionButton";
import { NotFound } from "@/components/NotFound";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

export default function PollPage({
  params,
}: {
  params: Promise<{ pollId: Id<"polls"> }>;
}) {
  const { pollId } = use(params);
  const poll = useQuery(api.polls.getPoll, { pollId });
  const me = useQuery(api.users.currentUser);
  const togglePollStatus = useMutation(api.polls.togglePollStatus);

  const isOwner = me && poll && me._id === poll.createdBy;

  if (poll === undefined) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (poll === null) {
    return <NotFound item="poll" />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 mt-10 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">{poll.title}</h1>
          {poll.description && (
            <p className="text-muted-foreground text-base sm:text-lg">
              {poll.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {isOwner && (
            <Button
              variant="outline"
              onClick={() =>
                togglePollStatus({ pollId: poll._id, isActive: !poll.isActive })
              }
              className="w-full sm:w-auto"
            >
              {poll.isActive ? "End Poll" : "Restart Poll"}
            </Button>
          )}
          {isOwner && (
            <Link href={`/poll/${poll._id}/results`} passHref>
              <Button variant="outline" className="w-full sm:w-auto">
                Results
              </Button>
            </Link>
          )}
          {isOwner && (
            <Link href={`/poll/${poll._id}/showcase`} passHref>
              <Button variant="outline" className="w-full sm:w-auto">
                Present
              </Button>
            </Link>
          )}
          {isOwner && <AddQuestionForm pollId={poll._id} />}
          <ShareButton pollId={poll._id} />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Questions Section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-center sm:text-left">
          Questions
        </h2>

        {poll.questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No questions yet.
          </p>
        ) : (
          <div className="space-y-6">
            {(isOwner ? poll.questions : poll.presentationQuestionIndex === undefined ? [] : [poll.questions[poll.presentationQuestionIndex]]).filter(Boolean).map((q) => (
              <div key={q._id} className="pb-4 last:border-0">
                <Question question={q} showResults={isOwner || !!poll.showResults} />
                {isOwner && (
                  <div className="flex justify-end gap-2 mt-3">
                    <EditQuestionDialog question={q} />
                    <DeleteQuestionButton questionId={q._id} />
                  </div>
                )}
              </div>
            ))}
            {!isOwner && poll.presentationQuestionIndex === undefined && <p className="text-center text-muted-foreground py-8">The presenter will open a question shortly.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
