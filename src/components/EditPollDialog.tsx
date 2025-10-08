"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

export function EditPollDialog({ poll }: { poll: { _id: Id<"polls">, title: string, description?: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description ?? "");
  const updatePoll = useMutation(api.polls.updatePoll);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updatePoll({ pollId: poll._id, title, description });
      toast.success("Poll updated successfully");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof ConvexError
          ?
          error.data
          :
          "Unexpected error occurred";
      toast.error(errorMessage);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
