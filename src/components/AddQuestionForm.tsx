"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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

export function AddQuestionForm({ pollId }: { pollId: Id<"polls"> }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const addQuestion = useMutation(api.questions.addQuestion);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text || !options) return;

    const optionsArray = options.split(",").map((s) => s.trim());
    if (optionsArray.length < 2) {
      alert("Please provide at least two options, separated by commas.");
      return;
    }

    await addQuestion({ pollId, text, options: optionsArray });
    setIsOpen(false);
    setText("");
    setOptions("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Question</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="text" className="text-right">
                Question
              </Label>
              <Input
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="options" className="text-right">
                Options
              </Label>
              <Input
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="col-span-3"
                placeholder="Enter options, separated by commas"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Question</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
