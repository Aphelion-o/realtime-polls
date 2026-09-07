"use client";

import { use, useEffect, useState } from "react";
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
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

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

  const selectedQuestion = poll.presentationQuestionIndex === undefined ? null : poll.questions[poll.presentationQuestionIndex];
  const remainingSeconds = poll.votingEndsAt && now ? Math.max(0, Math.ceil((poll.votingEndsAt - now) / 1000)) : Math.ceil((poll.votingRemainingMs ?? 0) / 1000);
  const votingOpen = !!selectedQuestion && !poll.isVotingPaused && !!poll.votingEndsAt && remainingSeconds > 0;

  return (
    <div className={isOwner ? "container mx-auto p-4 sm:p-6 mt-10 max-w-3xl" : "audience-vote-page"}>
      {/* Header */}
      {isOwner && <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
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
          {isOwner && (
            <Link href={`/poll/${poll._id}/showcase/control`} passHref>
              <Button variant="outline" className="w-full sm:w-auto">
                Control room
              </Button>
            </Link>
          )}
          {isOwner && <AddQuestionForm pollId={poll._id} />}
          <ShareButton pollId={poll._id} />
        </div>
      </div>}

      {isOwner && <Separator className="my-6" />}

      {/* Questions Section */}
      <div>
        {!isOwner && <div className="audience-poll-status" aria-live="polite"><div><span>{votingOpen ? "VOTING LIVE" : poll.showResults ? "RESULTS READY" : "LIVE POLL"}</span><strong>{poll.title}</strong></div><div className="audience-timer"><small>{votingOpen ? "TIME LEFT" : poll.isVotingPaused && remainingSeconds > 0 ? "PAUSED" : "WAITING"}</small><b>{String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:{String(remainingSeconds % 60).padStart(2, "0")}</b></div></div>}
        {isOwner && <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-center sm:text-left">Questions</h2>}

        {poll.questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No questions yet.
          </p>
        ) : (
          <div className="space-y-6">
            {(isOwner ? poll.questions : poll.presentationQuestionIndex === undefined ? [] : [poll.questions[poll.presentationQuestionIndex]]).filter(Boolean).map((q) => (
              <div key={q._id} className="pb-4 last:border-0">
                <Question question={q} showResults={isOwner || !!poll.showResults} audienceMode={!isOwner} votingOpen={isOwner || votingOpen} />
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
