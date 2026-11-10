import { motion } from "framer-motion";
import { ArrowRight, Bookmark, Check, Lightbulb, RotateCcw, Target, X } from "lucide-react";
import { EmptyState, PageHead, Stat } from "../components/ui";
import { itemV, listV } from "../lib/motion";
import type { Ctx } from "./ctx";

export default function Mistakes({ c, addMistakeCard }: { c: Ctx; addMistakeCard: (q: Ctx["allMistakes"][number]) => void }) {
  const { allMistakes, data, accuracy, go } = c;
  const inCards = (q: Ctx["allMistakes"][number]) => data.sets.some((s) => s.questions.some((y) => y.id === q.id) && s.cards.some((x) => x.front === q.question));
  return (
    <>
      <PageHead title="Mistake notebook" desc="Every wrong answer is a clue to what you can master next." />
      <div className="stat-grid">
        <Stat icon={Bookmark} label="Total mistakes" value={allMistakes.length} note="Across your attempts" />
        <Stat icon={RotateCcw} label="Exams completed" value={data.attempts.length} note="Practice history" />
        <Stat icon={Target} label="Accuracy" value={accuracy} format={(n) => `${n}%`} note="All-time average" />
        <Stat icon={Lightbulb} label="Topics to revisit" value={new Set(allMistakes.map((q) => q.topic)).size} note="Unique weak areas" />
      </div>
      {allMistakes.length ? (
        <motion.div className="panel" style={{ padding: "6px 18px" }} variants={listV} initial="initial" animate="animate">
          {allMistakes.map((q, i) => { const done = inCards(q); return (
            <motion.div variants={itemV} className="mistake" key={`${q.id}-${i}`}>
              <div className="mark"><X size={15} aria-hidden="true" /></div>
              <div className="mistake-body"><span className="tag">{q.topic}</span><b>{q.question}</b><p>Correct answer: <strong>{q.answer}</strong></p><small>{q.explanation}</small></div>
              <button className="btn sm" disabled={done} onClick={() => addMistakeCard(q)}>{done ? <><Check size={13} aria-hidden="true" /> In flashcards</> : "Make card"}</button>
            </motion.div>); })}
        </motion.div>
      ) : (
        <EmptyState icon={Bookmark} title="No mistakes to learn from yet" text="Complete a TestForge examination. Incorrect answers and explanations will be collected here automatically." action={<button className="btn primary" onClick={() => go("testforge")}>Go to TestForge <ArrowRight size={15} aria-hidden="true" /></button>} />
      )}
    </>
  );
}
