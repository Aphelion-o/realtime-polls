"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
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
import { toast } from "sonner";
import { ConvexError } from "convex/values";

export const editQuestionSchema = z.object({
  text: z.string().min(1, "Question is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least two options required"),
});

export function EditQuestionDialog({
  question,
}: {
  question: { _id: Id<"questions">; text: string; options: string[] };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const updateQuestion = useMutation(api.questions.updateQuestion);

  const form = useForm({
    defaultValues: {
      text: question.text,
      options: question.options,
    },
    validators: {
      onChange: editQuestionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateQuestion({
          questionId: question._id,
          text: value.text,
          options: value.options,
        });
        toast.success("Question updated successfully");
        setIsOpen(false);
        form.reset();
      } catch (error) {
        console.error(error);
        const errorMessage =
          error instanceof ConvexError ? error.data : "Unexpected error occurred";
        toast.error(errorMessage);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-2">
            {/* Question Field */}
            <form.Field name="text">
              {(field) => (
                <div className="grid gap-2 text-left">
                  <Label htmlFor="text">Question</Label>
                  <Input
                    id="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Enter your question"
                  />
                  {field.getMeta().isTouched &&
                    field.state.meta.errors?.[0] && (
                      <Label className="text-destructive mt-1 text-sm">
                        {field.state.meta.errors[0]?.message ??
                          field.state.meta.errors[0]}
                      </Label>
                    )}
                </div>
              )}
            </form.Field>

            {/* Dynamic Options Field */}
            <form.Field name="options">
              {(field) => (
                <div className="grid gap-3 text-left">
                  <Label>Options</Label>
                  {field.state.value.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...field.state.value];
                          newOptions[i] = e.target.value;
                          field.handleChange(newOptions);
                        }}
                        onBlur={field.handleBlur}
                        placeholder={`Option ${i + 1}`}
                      />
                      {field.state.value.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newOptions = field.state.value.filter(
                              (_, idx) => idx !== i
                            );
                            field.handleChange(newOptions);
                          }}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      field.handleChange([...field.state.value, ""])
                    }
                  >
                    + Add Option
                  </Button>
                  {field.getMeta().isTouched &&
                    field.state.meta.errors?.[0] && (
                      <Label className="text-destructive mt-1 text-sm">
                        {field.state.meta.errors[0]?.message ??
                          field.state.meta.errors[0]}
                      </Label>
                    )}
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter className="flex-col gap-3">
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </form.Subscribe>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
