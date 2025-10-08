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

export function EditQuestionDialog({ question }: { question: { _id: Id<"questions">, text: string, options: string[] } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(question.text);
  const [options, setOptions] = useState(question.options.join("\n"));
  const updateQuestion = useMutation(api.questions.updateQuestion);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateQuestion({
        questionId: question._id,
        text,
        options: options.split("\n").filter(o => o.trim() !== ""),
      });
      toast.success("Question updated successfully" );
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
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Input id="text" value={text} onChange={(e) => setText(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="options">Options (one per line)</Label>
            <textarea
              id="options"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              required
              className="w-full h-32 p-2 border rounded"
            />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
