"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative isolate min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Gradient Blobs */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/3 h-[60rem] w-[80rem] -translate-x-1/2 -translate-y-1/2 rotate-[30deg] bg-gradient-to-tr from-pink-400/40 via-purple-400/30 to-indigo-400/40 opacity-30 animate-pulse"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 72.5% 32.5%, 60.2% 62.4%, 47.5% 58.3%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%)",
          }}
        />
      </div>

      {/* Hero Content */}
      <motion.div
        className="mx-auto max-w-3xl px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          Create and Share Polls in Real Time
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Engage your audience with live polls, get instant feedback, and
          visualize results beautifully as they happen.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <SignInButton mode="modal">
            <Button
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform duration-200"
            >
              Get Started
            </Button>
          </SignInButton>
        </div>
      </motion.div>

      {/* Bottom Gradient */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[40rem] overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[60rem] w-[80rem] -translate-x-1/2 -translate-y-1/2 rotate-[15deg] bg-gradient-to-tr from-indigo-400 via-purple-300 to-pink-400 opacity-20"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 72.5% 32.5%, 60.2% 62.4%, 47.5% 58.3%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%)",
          }}
        />
      </div>
    </section>
  );
}
