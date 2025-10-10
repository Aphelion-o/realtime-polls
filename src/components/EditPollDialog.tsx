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

// ✅ Schema for validation
const editPollSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
});

export function EditPollDialog({
  poll,
}: {
  poll: { _id: Id<"polls">; title: string; description?: string | null };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const updatePoll = useMutation(api.polls.updatePoll);

  const form = useForm({
    defaultValues: {
      title: poll.title,
      description: poll.description ?? "",
    },
    validators: {
      onChange: editPollSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updatePoll({
          pollId: poll._id,
          title: value.title,
          description: value.description,
        });
        toast.success("Poll updated successfully");
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
          <DialogTitle>Edit Poll</DialogTitle>
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
            {/* Title Field */}
            <form.Field name="title">
              {(field) => (
                <div className="grid gap-2 text-left">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Enter poll title"
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

            {/* Description Field */}
            <form.Field name="description">
              {(field) => (
                <div className="grid gap-2 text-left">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Optional description"
                  />
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
