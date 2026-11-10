import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bookmark, Check, ChevronLeft, CircleHelp, Clock3, ShieldCheck, Target, Trophy, X } from "lucide-react";
import { EmptySelect } from "../components/EmptySelect";
import { PageHead, ProgressBar, Ring } from "../components/ui";
import { sameAnswer } from "../lib/format";
import { ease, itemV, listV, tap } from "../lib/motion";
import type { Ctx } from "./ctx";

export type Exam = {
  answers: Record<string, string>; setAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  index: number; setIndex: Dispatch<SetStateAction<number>>; started: boolean; submitted: boolean;
  flags: string[]; setFlags: Dispatch<SetStateAction<string[]>>; start: number;
  begin: () => void; submit: () => void; reset: () => void;
};

const clock = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
const typing = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

export default function TestForge({ c, exam }: { c: Ctx; exam: Exam }) {
  const set = c.activeSet;
  const { answers, index, started, submitted, flags } = exam;
  const [now, setNow] = useState(Date.now());
  const prev = useRef(0);
  const dir = index >= prev.current ? 1 : -1;
  useEffect(() => { prev.current = index; }, [index]);
  useEffect(() => {
    if (!started || submitted) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [started, submitted]);

  const questions = set?.questions ?? [];
  const q = questions[index];
  const requestSubmit = () => {
    const open = questions.filter((x) => !answers[x.id]?.trim()).length;
    c.confirm({
      title: "Submit your examination?", confirmLabel: "Submit examination",
      message: `${open ? `${open} question${open === 1 ? " is" : "s are"} unanswered. ` : "All questions are answered. "}You cannot change answers after submitting.`,
      onConfirm: exam.submit,
    });
  };

  useEffect(() => {
    if (!started || submitted || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target) || document.querySelector("[role=dialog]") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowRight" && index < questions.length - 1) exam.setIndex(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) exam.setIndex(index - 1);
      else if (q.choices?.length) {
        const n = e.key.length === 1 && /[a-d]/i.test(e.key) ? e.key.toLowerCase().charCodeAt(0) - 97 : Number(e.key) - 1;
        if (n >= 0 && n < q.choices.length) exam.setAnswers((a) => ({ ...a, [q.id]: q.choices![n] }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, submitted, q, index, questions.length, exam]);

  const result = useMemo(() => {
    const okMap: Record<string, boolean> = {};
    const topics: Record<string, { correct: number; total: number }> = {};
    questions.forEach((x) => {
      const ok = sameAnswer(answers[x.id], x.answer); okMap[x.id] = ok;
      const t = (topics[x.topic] ??= { correct: 0, total: 0 }); t.total++; if (ok) t.correct++;
    });
    const correct = Object.values(okMap).filter(Boolean).length;
    return { okMap, topics, correct, pct: questions.length ? Math.round((correct / questions.length) * 100) : 0 };
  }, [questions, answers]);

  if (!set) return <EmptySelect onCreate={c.openCreate} />;
  const best = c.data.attempts.filter((a) => a.setId === set.id).reduce((m, a) => Math.max(m, Math.round((a.score / a.total) * 100)), -1);
  const head = <PageHead title="TestForge" desc="Challenge your understanding. Learn from every answer." action={<span className="tag">{questions.length} QUESTIONS</span>} />;

  if (!started)
    return (<>{head}
      <motion.div className="panel exam-intro" variants={listV} initial="initial" animate="animate">
        <motion.div variants={itemV} className="big-icon"><Target size={26} aria-hidden="true" /></motion.div>
        <motion.span variants={itemV} className="eyebrow" style={{ justifyContent: "center" }}>Practice examination</motion.span>
        <motion.h2 variants={itemV}>{set.title}</motion.h2>
        <motion.p variants={itemV}>Questions are drawn from your selected study set. Answers and explanations stay hidden until you submit.</motion.p>
        <motion.div variants={itemV} className="facts"><span><CircleHelp size={15} aria-hidden="true" />{questions.length} questions</span><span><Clock3 size={15} aria-hidden="true" />Untimed · elapsed time shown</span><span><ShieldCheck size={15} aria-hidden="true" />Private results</span>{best >= 0 && <span><Trophy size={15} aria-hidden="true" />Best: {best}%</span>}</motion.div>
        <motion.button variants={itemV} whileTap={tap} className="btn primary lg" onClick={exam.begin}>Start examination <ArrowRight size={16} aria-hidden="true" /></motion.button>
      </motion.div></>);

  if (submitted)
    return (<>{head}
      <motion.div className="panel result-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        <span className="eyebrow" style={{ justifyContent: "center", marginBottom: 14 }}>Examination complete</span>
        <div style={{ display: "grid", placeItems: "center" }}><Ring value={result.pct} label="Examination score" caption="score" /></div>
        <p style={{ color: "var(--muted)", marginTop: 14 }}>You answered {result.correct} out of {questions.length} questions correctly.</p>
        <div className="result-grid">
          <div><b>{result.correct}</b><small>Correct</small></div><div><b>{questions.length - result.correct}</b><small>To review</small></div><div><b>{clock(now - exam.start)}</b><small>Elapsed</small></div>
        </div>
        {Object.keys(result.topics).length > 1 && (
          <div style={{ textAlign: "left", marginBottom: 8 }}>
            {Object.entries(result.topics).map(([k, v]) => { const p = Math.round((v.correct / v.total) * 100); return (
              <div className="topic" key={k}><div><b>{k}</b><span>{p}%</span></div><ProgressBar value={p} label={`${k} accuracy`} tone={p < 50 ? "warn" : p >= 80 ? "good" : undefined} size="thin" /></div>); })}
          </div>
        )}
        <motion.div className="review-list" variants={listV} initial="initial" animate="animate">
          {questions.map((x, n) => { const ok = result.okMap[x.id]; return (
            <motion.div variants={itemV} className={`answer ${ok ? "ok" : ""}`} key={x.id}>
              <div className="st">{ok ? <Check size={14} aria-label="Correct" /> : <X size={14} aria-label="Incorrect" />}</div>
              <div><b>{n + 1}. {x.question}</b><p>Your answer: {answers[x.id] || "Not answered"} · Correct: {x.answer}</p><small>{x.explanation}</small></div>
            </motion.div>); })}
        </motion.div>
        <button className="btn primary" onClick={exam.reset}>Back to TestForge</button>
      </motion.div></>);

  if (!q) return <>{head}<EmptySelect onCreate={c.openCreate} /></>;
  const flagged = flags.includes(q.id);
  const last = index === questions.length - 1;
  return (<>{head}
    <div className="exam-workspace">
      <div className="panel">
        <div className="exam-bar">
          <span>QUESTION {index + 1} OF {questions.length}</span>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="timer" role="timer" aria-label="Elapsed time"><Clock3 size={13} aria-hidden="true" />{clock(now - exam.start)}</span>
            <button className={`flag-btn ${flagged ? "on" : ""}`} aria-pressed={flagged} onClick={() => exam.setFlags((f) => flagged ? f.filter((x) => x !== q.id) : [...f, q.id])}><Bookmark size={13} aria-hidden="true" /> {flagged ? "Flagged" : "Flag for review"}</button>
          </span>
        </div>
        <ProgressBar value={((index + 1) / questions.length) * 100} label="Examination progress" size="thin" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={q.id} initial={{ opacity: 0, x: 24 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 * dir }} transition={{ duration: 0.2, ease }}>
            <span className="tag" style={{ marginTop: 18 }}>{q.difficulty} · {q.topic}</span>
            <h2 className="exam-question" id="q-text">{q.question}</h2>
            {q.choices?.length ? (
              <div className="choice-list" role="radiogroup" aria-labelledby="q-text">
                {q.choices.map((ch, n) => { const sel = answers[q.id] === ch; return (
                  <motion.button key={n} whileTap={tap} role="radio" aria-checked={sel} className={`choice ${sel ? "selected" : ""}`} onClick={() => exam.setAnswers((a) => ({ ...a, [q.id]: ch }))}>
                    <span className="key">{String.fromCharCode(65 + n)}</span>{ch}
                    <AnimatePresence>{sel && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ marginLeft: "auto", display: "flex" }}><Check size={16} aria-hidden="true" /></motion.span>}</AnimatePresence>
                  </motion.button>); })}
              </div>
            ) : <input className="input" aria-labelledby="q-text" placeholder="Type your answer..." value={answers[q.id] || ""} onChange={(e) => exam.setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />}
          </motion.div>
        </AnimatePresence>
        <div className="exam-nav">
          <button className="btn" disabled={index === 0} onClick={() => exam.setIndex((i) => i - 1)}><ChevronLeft size={15} aria-hidden="true" /> Previous</button>
          <motion.button whileTap={tap} className="btn primary" onClick={() => last ? requestSubmit() : exam.setIndex((i) => i + 1)}>{last ? "Submit examination" : "Next question"} <ArrowRight size={15} aria-hidden="true" /></motion.button>
        </div>
      </div>
      <aside className="panel side-nav">
        <h3>Question navigator</h3><p className="panel-sub">{questions.filter((x) => answers[x.id]?.trim()).length} of {questions.length} answered</p>
        <div className="qgrid">{questions.map((x, n) => <button key={x.id} aria-label={`Question ${n + 1}${answers[x.id] ? ", answered" : ""}${flags.includes(x.id) ? ", flagged" : ""}`} aria-current={index === n} className={`${index === n ? "current" : ""} ${answers[x.id] ? "answered" : ""} ${flags.includes(x.id) ? "flag" : ""}`} onClick={() => exam.setIndex(n)}>{n + 1}</button>)}</div>
        <div className="legend"><span><i /> Answered</span><span><i className="f" /> Flagged</span></div>
        <button className="link-btn" style={{ marginTop: 18 }} onClick={requestSubmit}>Submit examination</button>
        <p className="hint" style={{ textAlign: "left" }}>A–D or 1–4 choose · ← → navigate</p>
      </aside>
    </div></>);
}
