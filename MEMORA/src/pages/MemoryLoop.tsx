import { motion } from "framer-motion";
import { ArrowRight, Brain, Check, Clock3, Layers, RotateCcw } from "lucide-react";
import { AnimatedNumber, EmptyState, PageHead, ProgressBar, Stat } from "../components/ui";
import { pluralize } from "../lib/format";
import { itemV, listV, tap } from "../lib/motion";
import type { Ctx } from "./ctx";

export default function MemoryLoop({ c }: { c: Ctx }) {
  const { data, dueCards, selectSet, go } = c;
  const all = data.sets.flatMap((s) => s.cards);
  return (
    <>
      <PageHead title="MemoryLoop" desc="Spaced repetition puts the right idea in front of you at the right time." />
      <div className="loop-hero">
        <div>
          <span className="eyebrow">Your daily review</span>
          <h2>Small reviews.<br /><em>Stronger memory.</em></h2>
          <p>Cards are scheduled using an SM-2-inspired interval and ease-factor system.</p>
          <motion.button whileTap={tap} className="btn primary" onClick={() => { if (dueCards[0]) { selectSet(dueCards[0].setId); go("flashcards"); } else go("library"); }}>
            {dueCards.length ? "Review due cards" : "Open library"} <ArrowRight size={15} aria-hidden="true" />
          </motion.button>
        </div>
        <div className="ring" style={{ width: 150, height: 150 }} role="img" aria-label={`${pluralize(dueCards.length, "card")} due today`}>
          <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="49" className="bg" /></svg>
          <div><b style={{ fontSize: 38 }}><AnimatedNumber value={dueCards.length} /></b><small>cards due today</small></div>
        </div>
      </div>
      <div className="stat-grid">
        <Stat icon={Layers} label="Total cards" value={all.length} note="Across all collections" />
        <Stat icon={Clock3} label="Due now" value={dueCards.length} note="Ready for review" />
        <Stat icon={Check} label="Mature cards" value={all.filter((x) => x.interval >= 21).length} note="21+ day intervals" />
        <Stat icon={Brain} label="Learning cards" value={all.filter((x) => x.status !== "review").length} note="Still building recall" />
      </div>
      <div className="panel">
        <div className="panel-head"><div><h3>Review collections</h3><p className="panel-sub">Progress is the share of cards you have reviewed at least once.</p></div></div>
        {data.sets.length === 0 ? <EmptyState icon={RotateCcw} title="No collections yet" text="Create a study set to start building your review schedule." /> : (
          <motion.div variants={listV} initial="initial" animate="animate">
            {data.sets.map((s) => {
              const due = s.cards.filter((x) => x.dueAt <= Date.now()).length;
              const seen = s.cards.length ? Math.round((s.cards.filter((x) => x.status !== "new").length / s.cards.length) * 100) : 0;
              return (
                <motion.div variants={itemV} className="rowline" key={s.id}>
                  <div className="row-ic"><Layers size={16} aria-hidden="true" /></div>
                  <div className="row-main"><b>{s.title}</b><small>{pluralize(s.cards.length, "card")} · {seen}% reviewed</small></div>
                  <ProgressBar value={seen} label={`${s.title} reviewed`} size="thin" tone="good" />
                  <span className={`badge ${due ? "" : "quiet"}`}>{due} due</span>
                  <button className="link-btn" onClick={() => { selectSet(s.id); go("flashcards"); }}>Study <ArrowRight size={14} aria-hidden="true" /></button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
