"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { Question } from "@/components/Question";
import { Button } from "@/components/ui/button";

export default function PollPage({ params }: { params: { pollId: Id<"polls"> } }) {
  const poll = useQuery(api.polls.getPoll, { pollId: params.pollId });
  const me = useQuery(api.users.currentUser);

  const isOwner = me && poll && me._id === poll.createdBy;

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    alert("Poll link copied to clipboard!");
  }

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
              <Button onClick={handleShare}>Share</Button>
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
