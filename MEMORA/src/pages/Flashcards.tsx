import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers, Plus } from "lucide-react";
import { EmptySelect } from "../components/EmptySelect";
import { EmptyState, PageHead, ProgressBar } from "../components/ui";
import { ease, tap } from "../lib/motion";
import { QUALITY, schedule } from "../lib/srs";
import type { RecallLevel } from "../lib/srs";
import type { Ctx } from "./ctx";

export type FC = { index: number; flipped: boolean; setFlipped: Dispatch<SetStateAction<boolean>>; last: RecallLevel | null; rate: (l: RecallLevel) => void; move: (d: number) => void; openAdd: () => void };

const LEVELS: { id: RecallLevel; label: string }[] = [{ id: "again", label: "Again" }, { id: "hard", label: "Hard" }, { id: "good", label: "Good" }, { id: "easy", label: "Easy" }];
const cardV = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease } },
  exit: (l: RecallLevel | null) => ({ opacity: 0, x: l === "again" || l === "hard" ? -36 : l ? 36 : 0, transition: { duration: 0.18 } }),
};
const typing = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName);

export default function Flashcards({ c, fc }: { c: Ctx; fc: FC }) {
  const set = c.activeSet;
  const count = set?.cards.length ?? 0;
  const { flipped, setFlipped, rate, move } = fc;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!count || typing(e.target) || document.querySelector("[role=dialog]") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === " ") { e.preventDefault(); setFlipped((v) => !v); }
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
      else if (flipped && ["1", "2", "3", "4"].includes(e.key)) rate(LEVELS[Number(e.key) - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, flipped, rate, move, setFlipped]);

  if (!set) return <EmptySelect onCreate={c.openCreate} />;
  const add = <button className="btn" onClick={fc.openAdd}><Plus size={15} aria-hidden="true" /> Add card</button>;
  if (!count)
    return (<><PageHead title="Flashcard studio" desc={`Practice active recall with cards from ${set.title}.`} action={add} />
      <EmptyState icon={Layers} title="No flashcards yet" text="Generate a study set or add your own cards." action={<button className="btn primary" onClick={fc.openAdd}><Plus size={15} aria-hidden="true" /> Add first card</button>} /></>);

  const i = Math.min(fc.index, count - 1);
  const card = set.cards[i];
  return (
    <>
      <PageHead title="Flashcard studio" desc={`Practice active recall with ${count} cards from ${set.title}.`} action={add} />
      <div className="flash-area">
        <div className="flash-top"><span>{i + 1} <i>/</i> {count}</span><span className="tag">{card.topic || set.subject}</span></div>
        <ProgressBar value={((i + 1) / count) * 100} label="Deck progress" size="thin" />
        <AnimatePresence mode="wait" custom={fc.last}>
          <motion.div key={card.id} className="flashcard" variants={cardV} custom={fc.last} initial="initial" animate="animate" exit="exit"
            role="button" tabIndex={0} aria-pressed={flipped} aria-label={flipped ? `Answer: ${card.back}. Press space to flip back.` : `Question: ${card.front}. Press space to reveal the answer.`}
            onClick={() => setFlipped((v) => !v)} onKeyDown={(e) => e.key === "Enter" && setFlipped((v) => !v)} whileHover={{ y: -3 }}>
            <motion.div className="flash-inner" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.55, ease }} initial={false}>
              <div className="flash-face"><span className="flash-label">QUESTION / TERM</span><div className="flash-text">{card.front}</div><small>Click or press Space to reveal</small></div>
              <div className="flash-face flash-back"><span className="flash-label">ANSWER / DEFINITION</span><div className="flash-text">{card.back}</div><small>How well did you remember?</small></div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="flash-controls">
          <button className="btn" onClick={() => move(-1)}><ChevronLeft size={16} aria-hidden="true" /> Previous</button>
          <button className="btn" onClick={() => move(1)}>Next <ChevronRight size={16} aria-hidden="true" /></button>
        </div>
        <AnimatePresence>
          {flipped && (
            <motion.div className="rating-row" role="group" aria-label="Rate your recall" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2, ease }}>
              {LEVELS.map((l, n) => (
                <motion.button key={l.id} whileTap={tap} className={`rate ${l.id}`} onClick={() => rate(l.id)}>
                  {l.label}<small>{schedule(QUALITY[l.id], card.reps, card.interval, card.ease).interval}d · key {n + 1}</small>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <p className="hint">Space flips · ← → navigate · 1–4 rate after flipping</p>
      </div>
    </>
  );
}
