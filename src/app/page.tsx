// src/app/page.tsx

"use client";

import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreatePollForm } from "@/components/CreatePollForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Doc } from "../../convex/_generated/dataModel";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Real-time Polls</h1>
        <Authenticated>
          <UserButton afterSignOutUrl="/" />
        </Authenticated>
        <Unauthenticated>
          <SignInButton mode="modal" />
        </Unauthenticated>
      </header>
      <main>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <div className="text-center">
            <h2 className="text-xl">Welcome!</h2>
            <p>Sign in to create and manage your polls.</p>
          </div>
        </Unauthenticated>
      </main>
    </div>
  );
}

function Content() {
  const myPolls = useQuery(api.polls.getMyPolls);
  const deletePoll = useMutation(api.polls.deletePoll);
  const togglePollStatus = useMutation(api.polls.togglePollStatus);

  function handleDelete(pollId: Doc<"polls">["_id"]) {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      deletePoll({ pollId });
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Polls</h2>
        <CreatePollForm />
      </div>

      {myPolls === undefined && <div>Loading polls...</div>}

      {myPolls && myPolls.length === 0 && (
        <p>You haven't created any polls yet.</p>
      )}

      {myPolls && myPolls.length > 0 && (
        <ul className="space-y-4">
          {myPolls.map((poll) => (
            <li
              key={poll._id}
              className="border p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <Link href={`/poll/${poll._id}`} className="flex-grow">
                <div className="hover:underline">
                  <h3 className="text-lg font-bold">{poll.title}</h3>
                  <p className="text-gray-600">{poll.description}</p>
                  <p className="text-sm mt-2">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        poll.isActive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {poll.isActive ? "Active" : "Closed"}
                    </span>
                  </p>
                </div>
              </Link>
              <div className="flex gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  onClick={() =>
                    togglePollStatus({ pollId: poll._id, isActive: !poll.isActive })
                  }
                >
                  {poll.isActive ? "Close" : "Reopen"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(poll._id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}