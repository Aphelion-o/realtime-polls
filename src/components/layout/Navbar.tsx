"use client"

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Vote } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
        >
          <Vote className="w-6 h-6 text-primary" />
          <span>Real-Time Polls</span>
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
