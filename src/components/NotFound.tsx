"use client";

import Link from "next/link";
import { Button } from "./ui/button";

export function NotFound({ item }: { item: string }) {
  return (
    <div className="container mx-auto text-center py-12">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p className="text-muted-foreground mt-2">
        The {item} you are looking for does not exist or has been deleted.
      </p>
      <Button asChild className="mt-4">
        <Link href="/">Go to Homepage</Link>
      </Button>
    </div>
  );
}
