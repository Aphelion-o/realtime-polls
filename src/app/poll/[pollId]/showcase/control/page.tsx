"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Pause, Play, Plus, Trophy } from "lucide-react";
import { use, useEffect, useState } from "react";

export default function PresentationControlPage({ params }: { params: Promise<{ pollId: Id<"polls"> }> }) {
  const { pollId } = use(params);
  const poll = useQuery(api.polls.getPoll, { pollId });
  const me = useQuery(api.users.currentUser);
  const presentQuestion = useMutation(api.polls.presentQuestion);
  const beginVoting = useMutation(api.polls.beginVoting);
  const pauseVoting = useMutation(api.polls.pauseVoting);
  const addVotingTime = useMutation(api.polls.addVotingTime);
  const revealResults = useMutation(api.polls.revealResults);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  if (poll === undefined || me === undefined) return <div className="p-8">Loading control room…</div>;
  if (!poll || !me || me._id !== poll.createdBy) return <div className="p-8">You cannot access this page.</div>;
  const index = poll.presentationQuestionIndex;
  const question = index === undefined ? null : poll.questions[index];
  const expired = now !== null && !!poll.votingEndsAt && now >= poll.votingEndsAt;
  const voting = !!question && !poll.isVotingPaused && !expired;
  return <main className="container mx-auto max-w-3xl px-5 py-12"><div className="mb-10"><p className="text-sm font-semibold text-primary">Live poll control room</p><h1 className="mt-2 text-4xl font-bold tracking-tight">{poll.title}</h1><p className="mt-3 text-muted-foreground">This controls the separate presentation screen.</p></div><div className="grid gap-2">{poll.questions.map((item, itemIndex) => <button type="button" key={item._id} onClick={() => presentQuestion({ pollId, questionIndex: itemIndex })} className={`rounded-xl border p-4 text-left transition-colors ${itemIndex === index ? "border-primary bg-primary/10" : "hover:bg-muted"}`}><span className="mr-3 font-bold text-primary">{itemIndex + 1}</span>{item.text}</button>)}</div><section className="mt-8 grid gap-3 sm:grid-cols-2"><button type="button" className="control-button control-button-primary" disabled={!question || voting} onClick={() => beginVoting({ pollId, durationSeconds: 30 })}><Play size={18} /> Begin 30s voting</button><button type="button" className="control-button" disabled={!voting} onClick={() => pauseVoting({ pollId })}><Pause size={18} /> Pause voting</button><button type="button" className="control-button" disabled={!question || poll.showResults} onClick={() => revealResults({ pollId })}><Trophy size={18} /> Show results</button><button type="button" className="control-button" disabled={!question} onClick={() => addVotingTime({ pollId, seconds: 10 })}><Plus size={18} /> Add 10 seconds</button></section></main>;
}
