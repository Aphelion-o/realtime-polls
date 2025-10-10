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
import { Spinner } from "@/components/ui/spinner";

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
    <div className="space-y-10 mt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My Polls</h1>
          <p className="text-muted-foreground">
            Manage and track the polls you've created.
          </p>
        </div>
        <CreatePollForm />
      </div>

      <Separator />

      {/* Loading State */}
      {myPolls === undefined && (
        <div className="flex h-[80vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      )}


      {/* Empty State */}
      {myPolls && myPolls.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg font-medium">No polls yet</p>
          <p className="mt-1 text-sm">Start by creating your first poll.</p>
        </div>
      )}

      {/* Poll Grid */}
      {myPolls && myPolls.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myPolls.map((poll) => (
            <Card
              key={poll._id}
              className="group flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <Link href={`/poll/${poll._id}`} passHref className="flex-grow">
                <CardHeader>
                  <CardTitle className="truncate group-hover:text-foreground/90">
                    {poll.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                    {poll.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground/80">
                    Created {new Date(poll.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Link>
              <CardFooter className="flex justify-end gap-2 border-t pt-3">
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
