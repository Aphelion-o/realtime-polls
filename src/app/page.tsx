"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreatePollForm } from "@/components/CreatePollForm";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EditPollDialog } from "@/components/EditPollDialog";
import { DeletePollButton } from "@/components/DeletePollButton";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Authenticated>
        <main className="container mx-auto p-4">
          <Content />
        </main>
      </Authenticated>
      <Unauthenticated>
        <Hero />
      </Unauthenticated>
    </>
  );
}

function Content() {
  const myPolls = useQuery(api.polls.getMyPolls);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">My Polls</h1>
          <p className="text-muted-foreground">
            Here are the polls you've created.
          </p>
        </div>
        <CreatePollForm />
      </div>

      <Separator />

      {myPolls === undefined && (
        <div className="text-center text-muted-foreground">Loading polls...</div>
      )}

      {myPolls && myPolls.length === 0 && (
        <div className="text-center text-muted-foreground">
          You haven't created any polls yet.
        </div>
      )}

      {myPolls && myPolls.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {myPolls.map((poll) => (
            <Card key={poll._id} className="flex flex-col">
              <Link href={`/poll/${poll._id}`} passHref className="flex-grow">
                <CardHeader>
                  <CardTitle className="truncate">{poll.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {poll.description}
                  </CardDescription>
                </CardHeader>
                <CardContent></CardContent>
              </Link>
              <CardFooter className="flex justify-end gap-2 pt-4">
                <EditPollDialog poll={poll} />
                <DeletePollButton pollId={poll._id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
