"use client";

import { use } from "react";
import { useQuery } from "convex/react";
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

export default function PollPage({ params }: { params: Promise<{ pollId: Id<"polls"> }> }) {
  const {pollId} = use(params);
  const poll = useQuery(api.polls.getPoll, { pollId: pollId });
  const me = useQuery(api.users.currentUser);

  const isOwner = me && poll && me._id === poll.createdBy;

  if (poll === undefined) {
    return <div className="container mx-auto p-4">Loading poll...</div>;
  }

  if (poll === null) {
    return <NotFound item="poll" />;
  }

  return (
    <div className="container mx-auto p-4">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{poll.title}</h1>
            <p className="text-lg text-gray-600">{poll.description}</p>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <Link href={`/poll/${poll._id}/showcase`} passHref>
                <Button variant="outline">Present</Button>
              </Link>
            )}
            {isOwner && <AddQuestionForm pollId={poll._id} />}
            <ShareButton pollId={poll._id} />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-3">Questions</h2>
        {poll.questions.length === 0 && <p>No questions yet.</p>}
        <ul>
          {poll.questions.map((q) => (
            <div key={q._id} className="mb-4">
              <Question question={q} />
              {isOwner && (
                <div className="flex justify-end gap-2 mt-2">
                  <EditQuestionDialog question={q} />
                  <DeleteQuestionButton questionId={q._id} />
                </div>
              )}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
