"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { Question } from "@/components/Question";
import { ShareButton } from "@/components/ShareButton";

export default function PollPage({ params }: { params: { pollId: Id<"polls"> } }) {
  const unwrappedParams = use(params);
  const poll = useQuery(api.polls.getPoll, { pollId: unwrappedParams.pollId });
  const me = useQuery(api.users.currentUser);

  const isOwner = me && poll && me._id === poll.createdBy;

  return (
    <div className="container mx-auto p-4">
      {poll === undefined && <div>Loading poll...</div>}
      {poll === null && <div>Poll not found.</div>}
      {poll && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{poll.title}</h1>
              <p className="text-lg text-gray-600">{poll.description}</p>
            </div>
            <div className="flex gap-2">
              {isOwner && <AddQuestionForm pollId={poll._id} />}
              <ShareButton pollId={poll._id} />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-3">Questions</h2>
          {poll.questions.length === 0 && <p>No questions yet.</p>}
          <ul>
            {poll.questions.map((q) => (
              <Question key={q._id} question={q} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
