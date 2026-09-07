"use client"

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Vote } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function Navbar() {
  const pathname = usePathname();
  const params = useParams<{ pollId?: string }>();
  const poll = useQuery(api.polls.getPoll, params.pollId ? { pollId: params.pollId as Id<"polls"> } : "skip");
  const me = useQuery(api.users.currentUser);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (pathname.endsWith("/showcase")) return null;
  if (pathname.match(/^\/poll\/[^/]+$/) && poll?.allowAnonymous && !me) return null;
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">
            {mounted && (resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />)}
          </Button>
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
