"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreatePollForm } from "@/components/CreatePollForm";
import Link from "next/link";

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
        <ul>
          {myPolls.map((poll) => (
            <Link key={poll._id} href={`/poll/${poll._id}`}>
              <li className="border p-4 rounded mb-2 hover:bg-gray-100 cursor-pointer">
                <h3 className="text-lg font-bold">{poll.title}</h3>
                <p>{poll.description}</p>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}
