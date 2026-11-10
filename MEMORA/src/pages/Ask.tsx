import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { PageHead, Spinner } from "../components/ui";
import { ease, tap } from "../lib/motion";
import type { Ctx } from "./ctx";

export type ChatMsg = { role: "user" | "assistant"; text: string };
export type Chat = { messages: ChatMsg[]; input: string; setInput: Dispatch<SetStateAction<string>>; send: () => void; busy: boolean };
const SUGGESTIONS = ["Explain the main idea simply", "Quiz me on the key terms", "What should I focus on first?"];

export default function Ask({ c, chat }: { c: Ctx; chat: Chat }) {
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [chat.messages.length, chat.busy]);
  const set = c.activeSet;
  return (
    <>
      <PageHead title="Ask MEMORA" desc="A study companion for the questions that move your understanding forward." action={set ? <span className="tag">SOURCE: {set.title}</span> : undefined} />
      <div className="panel chat">
        <div className="chat-top">
          <div className="chat-av"><Sparkles size={18} aria-hidden="true" /></div>
          <div><b>MEMORA Study Companion</b><small>{set ? "Using selected study source" : "No source selected · answers need a configured AI service"}</small></div>
          <span className="dot" aria-hidden="true" />
        </div>
        <div className="chat-messages" role="log" aria-live="polite" aria-label="Conversation">
          {chat.messages.map((m, i) => (
            <motion.div className={`msg ${m.role}`} key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease }}>
              <div className="bubble">{m.text.split("\n").map((l, j) => <p key={j}>{l}</p>)}</div>
            </motion.div>
          ))}
          <AnimatePresence>
            {chat.busy && <motion.div className="msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="bubble" aria-label="MEMORA is thinking"><span className="typing"><i /><i /><i /></span></div></motion.div>}
          </AnimatePresence>
          <div ref={end} />
        </div>
        {chat.messages.length === 1 && (
          <div className="suggest" aria-label="Suggested questions">{SUGGESTIONS.map((s) => <button key={s} onClick={() => { chat.setInput(s); input.current?.focus(); }}>{s}</button>)}</div>
        )}
        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); chat.send(); }}>
          <input ref={input} className="input" aria-label="Your question" value={chat.input} onChange={(e) => chat.setInput(e.target.value)} placeholder="Ask about a concept, request an example..." />
          <motion.button whileTap={tap} className="btn primary" disabled={!chat.input.trim() || chat.busy} aria-label="Send question">{chat.busy ? <Spinner /> : <ArrowRight size={16} aria-hidden="true" />}</motion.button>
        </form>
        <div className="disclaimer"><ShieldCheck size={12} aria-hidden="true" /> Answers prioritize your selected source. Verify important information against your materials.</div>
      </div>
    </>
  );
}
