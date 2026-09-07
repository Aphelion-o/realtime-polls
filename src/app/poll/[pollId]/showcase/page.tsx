"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { NotFound } from "@/components/NotFound";
import { Spinner } from "@/components/ui/spinner";
import { Pause, Play, Plus, Presentation, Trophy } from "lucide-react";
import { use, useEffect, useState } from "react";

function Clock({ endsAt, paused }: { endsAt?: number; paused?: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(timer); }, []);
  const seconds = Math.max(0, Math.ceil(((endsAt ?? now) - now) / 1000));
  return <div className="present-clock"><span>{paused ? "PAUSED" : "VOTING"}</span><strong>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</strong></div>;
}

function LiveResults({ question }: { question: { _id: Id<"questions">; options: string[] } }) {
  const votes = useQuery(api.votes.getVotes, { questionId: question._id });
  const total = Object.values(votes ?? {}).reduce((sum, count) => sum + count, 0);
  return <div className="present-results">{question.options.map((option, index) => { const count = votes?.[index] ?? 0; const percent = total ? Math.round((count / total) * 100) : 0; return <div className="result-row" key={option}><div><span>{option}</span><b>{percent}%</b></div><div className="result-track"><i style={{ width: `${percent}%` }} /></div></div>; })}<p>{total} response{total === 1 ? "" : "s"}</p></div>;
}

export default function PollShowcasePage({ params }: { params: Promise<{ pollId: Id<"polls"> }> }) {
  const { pollId } = use(params);
  const poll = useQuery(api.polls.getPoll, { pollId });
  const me = useQuery(api.users.currentUser);
  const presentQuestion = useMutation(api.polls.presentQuestion);
  const beginVoting = useMutation(api.polls.beginVoting);
  const pauseVoting = useMutation(api.polls.pauseVoting);
  const addVotingTime = useMutation(api.polls.addVotingTime);
  const revealResults = useMutation(api.polls.revealResults);
  if (poll === undefined || me === undefined) return <div className="flex h-screen items-center justify-center bg-[#130b22]"><Spinner className="size-8 text-white" /></div>;
  if (!poll || !me || me._id !== poll.createdBy) return poll === null ? <NotFound item="poll" /> : <div className="flex h-screen items-center justify-center">You cannot access this page.</div>;
  const index = poll.presentationQuestionIndex;
  const question = index === undefined ? null : poll.questions[index];
  const isExpired = !!poll.votingEndsAt && Date.now() >= poll.votingEndsAt;
  const voting = !!question && !poll.isVotingPaused && !isExpired;
  const next = index === undefined ? 0 : Math.min(index + 1, poll.questions.length - 1);
  return <main className="present-mode"><div className="present-aurora" /><section className="present-stage">
    {question ? <><div className="present-meta"><span>QUESTION {(index ?? 0) + 1} / {poll.questions.length}</span><Clock endsAt={poll.votingEndsAt} paused={!voting} /></div><h1>{question.text}</h1>{poll.showResults ? <LiveResults question={question} /> : <div className="present-options">{question.options.map((option, optionIndex) => <div key={option} className="present-option"><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</div>)}</div>} {!poll.showResults && <p className="present-prompt">{voting ? "Cast your vote now" : isExpired ? "Time is up. The presenter will reveal the results." : "Waiting for the presenter to begin voting"}</p>}</> : <div className="present-empty"><Presentation size={54} /><h1>{poll.title}</h1><p>Choose a question below when you are ready to bring the audience in.</p></div>}
  </section><aside className="present-console"><div className="console-title"><span>Presenter controls</span><strong>{poll.title}</strong></div><div className="question-picker">{poll.questions.map((item, itemIndex) => <button type="button" key={item._id} className={itemIndex === index ? "active" : ""} onClick={() => presentQuestion({ pollId, questionIndex: itemIndex })}><span>{itemIndex + 1}</span>{item.text}</button>)}</div><div className="console-actions"><button type="button" className="console-primary" disabled={!question || voting} onClick={() => beginVoting({ pollId, durationSeconds: 30 })}><Play size={18} /> Begin 30s voting</button><button type="button" disabled={!voting} onClick={() => pauseVoting({ pollId })}><Pause size={18} /> Pause voting</button><button type="button" disabled={!question || poll.showResults} onClick={() => revealResults({ pollId })}><Trophy size={18} /> Show results</button><button type="button" disabled={!question} onClick={() => addVotingTime({ pollId, seconds: 10 })}><Plus size={18} /> Add 10 seconds</button></div>{question && index !== poll.questions.length - 1 && <button type="button" className="next-question" onClick={() => presentQuestion({ pollId, questionIndex: next })}>Set up next question <span>→</span></button>}</aside></main>;
}
