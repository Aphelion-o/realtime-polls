"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { Presentation } from "lucide-react";
import { use, useEffect, useState } from "react";

function Clock({ endsAt, remainingMs, hasStarted, showResults }: { endsAt?: number; remainingMs?: number; hasStarted?: boolean; showResults?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(timer); }, []);
  const milliseconds = endsAt && now ? Math.max(0, endsAt - now) : remainingMs ?? 0;
  const seconds = Math.ceil(milliseconds / 1000);
  const label = showResults ? "RESULTS" : endsAt && seconds > 0 ? "VOTING" : remainingMs && remainingMs > 0 ? "PAUSED" : hasStarted ? "ENDED" : "READY";
  return <div className="present-clock"><span>{label}</span><strong>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</strong></div>;
}

function LiveResults({ question }: { question: { _id: Id<"questions">; options: string[] } }) {
  const votes = useQuery(api.votes.getVotes, { questionId: question._id });
  const total = Object.values(votes ?? {}).reduce((sum, count) => sum + count, 0);
  return <div className="present-results">{question.options.map((option, index) => { const count = votes?.[index] ?? 0; const percent = total ? Math.round((count / total) * 100) : 0; return <div className="result-row" key={option}><div><span>{option}</span><b>{percent}%</b></div><div className="result-track"><i style={{ width: `${percent}%` }} /></div></div>; })}<p>{total} response{total === 1 ? "" : "s"}</p></div>;
}

export default function PollShowcasePage({ params }: { params: Promise<{ pollId: Id<"polls"> }> }) {
  const { pollId } = use(params);
  const poll = useQuery(api.polls.getPoll, { pollId });
  if (poll === undefined) return <div className="flex h-screen items-center justify-center bg-[#130b22]"><Spinner className="size-8 text-white" /></div>;
  const index = poll?.presentationQuestionIndex;
  const question = index === undefined ? null : poll?.questions[index];
  const voting = !!question && !poll?.isVotingPaused && !!poll?.votingEndsAt;
  const prompt = voting ? "Cast your vote now" : poll?.hasVotingStarted ? "Voting ended. Waiting for the presenter to reveal results" : "Waiting for the presenter to begin voting";
  return <main className="present-mode present-only"><div className="present-aurora" /><section className="present-stage">
    {question && poll ? <><div className="present-meta"><span>QUESTION {(index ?? 0) + 1} / {poll.questions.length}</span><Clock endsAt={poll.votingEndsAt} remainingMs={poll.votingRemainingMs} hasStarted={poll.hasVotingStarted} showResults={poll.showResults} /></div><h1>{question.text}</h1>{poll.showResults ? <LiveResults question={question} /> : <div className="present-options">{question.options.map((option, optionIndex) => <div key={option} className="present-option"><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</div>)}</div>}{!poll.showResults && <p className="present-prompt">{prompt}</p>}</> : <div className="present-empty"><Presentation size={54} /><h1>{poll?.title ?? "Poll"}</h1><p>The next question will appear here when the presenter is ready.</p></div>}
  </section></main>;
}
