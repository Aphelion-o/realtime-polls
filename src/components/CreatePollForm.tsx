'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  allowAnonymous: z.boolean(),
});

export function CreatePollForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [createError, setCreateError] = useState<string>();
  const createPoll = useMutation(api.polls.createPoll);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      allowAnonymous: false,
    },
    validators: {
      onChange: createPollSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createPoll(value);
        form.reset();
        setIsOpen(false);
        setCreateError(undefined);
      } catch (err: any) {
        setCreateError(err.message ?? 'Failed to create poll.');
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Poll</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Poll</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-6">
            {/* Title */}
            <form.Field name="title">
              {field => (
                <div className="grid gap-2 text-left">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value)}
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

            {/* Description */}
            <form.Field name="description">
              {field => (
                <div className="grid gap-2 text-left">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={field.state.value ?? ''}
                    onChange={e => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Optional description"
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

            {/* Allow Anonymous */}
            <form.Field name="allowAnonymous">
              {field => (
                <div className="flex items-center gap-2 justify-end">
                  <Checkbox
                    id="allowAnonymous"
                    checked={field.state.value}
                    onCheckedChange={checked =>
                      field.handleChange(Boolean(checked))
                    }
                  />
                  <Label htmlFor="allowAnonymous">
                    Allow anonymous votes
                  </Label>
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter className="flex-col gap-3">
            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <div className="flex w-full justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              )}
            </form.Subscribe>

            {createError && (
              <Label className="text-destructive mt-2 text-sm">
                {createError}
              </Label>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
