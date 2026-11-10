import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, FileText, ShieldCheck, Target } from "lucide-react";
import { EmptySelect } from "../components/EmptySelect";
import { CheckRow, PageHead, ProgressBar } from "../components/ui";
import { shortDate } from "../lib/format";
import { ease } from "../lib/motion";
import type { StudySet } from "../types";
import type { Ctx } from "./ctx";

type Section = { title: string; sub: boolean; lines: string[] };
const CHECKLIST = ["Read the full reviewer", "Recall key definitions", "Practice questions", "Review mistakes"];

function parse(md: string): Section[] {
  const out: Section[] = [];
  let cur: Section = { title: "", sub: false, lines: [] };
  for (const line of md.split("\n")) {
    const m = /^(#{1,3})\s+(.*)$/.exec(line);
    if (m) {
      if (cur.title || cur.lines.some((l) => l.trim())) out.push(cur);
      cur = { title: m[2], sub: m[1].length > 1, lines: [] };
    } else cur.lines.push(line);
  }
  out.push(cur);
  return out.filter((s) => s.title || s.lines.some((l) => l.trim()));
}

function Inline({ text }: { text: string }) {
  return <>{text.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}</>;
}

function Body({ lines }: { lines: string[] }) {
  return (
    <div className="md">
      {lines.map((line, i) => {
        if (!line.trim()) return null;
        if (/^[-*]\s/.test(line)) return <p key={i} className="li"><Inline text={line.slice(2)} /></p>;
        return <p key={i}><Inline text={line} /></p>;
      })}
    </div>
  );
}

function Tabs({ active, set, c }: { active: "reviewer"; set: StudySet; c: Ctx }) {
  const items: { id: "reviewer" | "flashcards" | "testforge"; label: string; count?: number }[] = [
    { id: "reviewer", label: "Reviewer" }, { id: "flashcards", label: "Flashcards", count: set.cards.length }, { id: "testforge", label: "Questions", count: set.questions.length },
  ];
  return (
    <div className="tabs" role="tablist">
      {items.map((t) => (
        <button key={t.id} role="tab" aria-selected={t.id === active} className={t.id === active ? "on" : ""} onClick={() => t.id !== active && c.go(t.id)}>
          {t.label}{t.count !== undefined && <span>{t.count}</span>}
          {t.id === active && <motion.span layoutId="tab-line" className="tab-line" transition={{ duration: 0.3, ease }} />}
        </button>
      ))}
    </div>
  );
}

function ReviewerView({ c, set }: { c: Ctx; set: StudySet }) {
  const sections = parse(set.reviewer);
  const [closed, setClosed] = useState<Record<number, boolean>>({});
  const titled = sections.map((s, i) => (s.title ? i : -1)).filter((i) => i >= 0);
  const allClosed = titled.length > 0 && titled.every((i) => closed[i]);
  const done = CHECKLIST.filter((x) => set.completedTopics.includes(x)).length;
  return (
    <>
      <PageHead title={set.title} desc={`${set.subject} · Created ${shortDate(set.createdAt)}`} action={<button className="btn" onClick={() => c.go("testforge")}><Target size={15} aria-hidden="true" /> Practice test</button>} />
      <Tabs active="reviewer" set={set} c={c} />
      <div className="review-layout">
        <article className="paper">
          <div className="paper-meta">
            <span className="lhs"><FileText size={14} aria-hidden="true" /> STUDY REVIEWER</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>{set.sourceName}
              {titled.length > 1 && <button className="link-btn" onClick={() => setClosed(allClosed ? {} : Object.fromEntries(titled.map((i) => [i, true])))}>{allClosed ? "Expand all" : "Collapse all"}</button>}
            </span>
          </div>
          {sections.map((s, i) => {
            if (!s.title) return <Body key={i} lines={s.lines} />;
            const isOpen = !closed[i];
            return (
              <section className="sec" key={i}>
                <button className={`sec-btn ${s.sub ? "sub" : ""}`} aria-expanded={isOpen} aria-controls={`sec-${i}`} onClick={() => setClosed((x) => ({ ...x, [i]: !x[i] }))}>
                  <ChevronRight size={16} aria-hidden="true" /><h3>{s.title}</h3>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`sec-${i}`} className="sec-body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease }}>
                      <Body lines={s.lines} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            );
          })}
          <div className="source-note"><ShieldCheck size={15} aria-hidden="true" /><span>Generated from <b>{set.sourceName}</b>. Review the source if a detail needs verification.</span></div>
        </article>
        <aside className="stack">
          <div className="panel">
            <h3>Key terms</h3><p className="panel-sub">{set.terms.length} concepts to remember</p>
            <div style={{ marginTop: 8 }}>{set.terms.slice(0, 8).map((t, i) => <div className="term" key={i}><b>{t.term}</b><p>{t.definition}</p></div>)}</div>
          </div>
          <div className="panel">
            <div className="panel-head" style={{ marginBottom: 10 }}><h3>Study checklist</h3><span className="tag">{done}/{CHECKLIST.length}</span></div>
            <ProgressBar value={(done / CHECKLIST.length) * 100} label="Checklist progress" size="thin" tone="good" />
            <div style={{ marginTop: 6 }}>
              {CHECKLIST.map((x) => (
                <CheckRow key={x} checked={set.completedTopics.includes(x)} onChange={(v) => c.updateSet(set.id, { completedTopics: v ? [...set.completedTopics, x] : set.completedTopics.filter((t) => t !== x) })}>{x}</CheckRow>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default function Reviewer({ c }: { c: Ctx }) {
  if (!c.activeSet) return <EmptySelect onCreate={c.openCreate} />;
  return <ReviewerView key={c.activeSet.id} c={c} set={c.activeSet} />;
}
