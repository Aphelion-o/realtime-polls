"use client"

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Real-time Polls
        </Link>
        <div className="flex items-center gap-4">
          <Authenticated>
            <UserButton afterSwitchSessionUrl="/" />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </Unauthenticated>
        </div>
      </div>
    </nav>
  );
}
