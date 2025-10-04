"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// NOTE: This component assumes you have shadcn components available.
// You need to set up Button, Dialog, Input, Label, Checkbox from shadcn/ui.
// For example, by running:
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add dialog
// npx shadcn-ui@latest add input
// npx shadcn-ui@latest add label
// npx shadcn-ui@latest add checkbox

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function CreatePollForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const createPoll = useMutation(api.polls.createPoll);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    await createPoll({ title, description, allowAnonymous });
    setIsOpen(false);
    setTitle("");
    setDescription("");
    setAllowAnonymous(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Poll</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Poll</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Checkbox
                id="allowAnonymous"
                checked={allowAnonymous}
                onCheckedChange={(checked) => setAllowAnonymous(Boolean(checked))}
              />
              <Label htmlFor="allowAnonymous">Allow anonymous votes</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}