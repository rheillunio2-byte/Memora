import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, BookOpen, Brain, Clock3, Flame, Lightbulb, MessageCircle, Plus, RotateCcw, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AccuracyChart } from "../components/charts";
import { SetCard } from "../components/SetCard";
import { EmptyState, Ring, Stat } from "../components/ui";
import { formatMinutes, greetingFor, pluralize, shortDate } from "../lib/format";
import { itemV, listV, tap } from "../lib/motion";
import type { Ctx } from "./ctx";

type Step = { kicker: string; title: string; text: string; cta: string; icon: LucideIcon; run: () => void };

function nextStep(c: Ctx): Step {
  const { data, dueCards, allMistakes, go, openCreate, selectSet } = c;
  if (!data.sets.length)
    return { kicker: "GET STARTED", title: "Turn what you know into what you master.", text: "Upload class notes or describe a topic. MEMORA builds a reviewer, flashcards and a practice test from it.", cta: "Create your first study set", icon: Plus, run: openCreate };
  if (dueCards.length)
    return { kicker: "UP NEXT", title: `${pluralize(dueCards.length, "card")} due for review`, text: "A short review now keeps what you have learned from fading.", cta: "Start reviewing", icon: RotateCcw, run: () => { selectSet(dueCards[0].setId); go("flashcards"); } };
  const untested = data.sets.find((s) => s.questions.length && !data.attempts.some((a) => a.setId === s.id));
  if (untested)
    return { kicker: "UP NEXT", title: `Test yourself on ${untested.title}`, text: `${pluralize(untested.questions.length, "question")} are ready. Answers stay hidden until you submit.`, cta: "Start practice test", icon: Target, run: () => { selectSet(untested.id); go("testforge"); } };
  if (allMistakes.length)
    return { kicker: "UP NEXT", title: `Learn from ${pluralize(allMistakes.length, "mistake")}`, text: "Turn missed questions into flashcards so they stick.", cta: "Open mistake notebook", icon: Lightbulb, run: () => go("mistakes") };
  return { kicker: "ON TRACK", title: "Keep the momentum going.", text: "Add another study set or take another practice test to keep improving.", cta: "New study set", icon: Plus, run: openCreate };
}

function weakestTopic(c: Ctx) {
  const t: Record<string, { correct: number; total: number }> = {};
  c.data.attempts.forEach((a) => Object.entries(a.topicScores).forEach(([k, v]) => { t[k] ??= { correct: 0, total: 0 }; t[k].correct += v.correct; t[k].total += v.total; }));
  const rows = Object.entries(t).filter(([, v]) => v.total > 0).map(([k, v]) => ({ topic: k, pct: Math.round((v.correct / v.total) * 100) })).sort((a, b) => a.pct - b.pct);
  return rows[0] && rows[0].pct < 100 ? rows[0] : null;
}

export default function Dashboard({ c }: { c: Ctx }) {
  const { data, dueCards, accuracy, totalQuestions, chartData, go, openCreate, selectSet, deleteSet } = c;
  const step = nextStep(c);
  const weak = weakestTopic(c);
  const goalPct = Math.min(100, Math.round((data.studyMinutes / data.dailyGoal) * 100));
  const firstName = data.name?.trim().split(/\s+/)[0];
  const upcoming = data.sets.map((s) => ({ s, due: s.cards.filter((x) => x.dueAt <= Date.now()).length })).filter((x) => x.due > 0);
  const nextDue = data.sets.flatMap((s) => s.cards).filter((x) => x.dueAt > Date.now()).sort((a, b) => a.dueAt - b.dueAt)[0];
  const quick: { icon: LucideIcon; label: string; note: string; run: () => void }[] = [
    { icon: Plus, label: "New study set", note: "Upload or prompt", run: openCreate },
    { icon: RotateCcw, label: "Review cards", note: `${dueCards.length} due`, run: () => { if (dueCards[0]) { selectSet(dueCards[0].setId); go("flashcards"); } else go("memoryloop"); } },
    { icon: Target, label: "Practice test", note: "TestForge", run: () => go("testforge") },
    { icon: MessageCircle, label: "Ask MEMORA", note: "Study companion", run: () => go("ask") },
  ];
  const recs = [
    weak && { text: <>Revisit <b>{weak.topic}</b>. Your accuracy there is {weak.pct}%.</> },
    dueCards.length > 0 && { text: <>You have <b>{pluralize(dueCards.length, "card")}</b> ready for review.</> },
    data.studyMinutes < data.dailyGoal && data.sets.length > 0 && { text: <>You are <b>{data.dailyGoal - data.studyMinutes} min</b> away from your study goal.</> },
  ].filter(Boolean) as { text: ReactNode }[];

  return (
    <motion.div variants={listV} initial="initial" animate="animate">
      <motion.div variants={itemV} className="greet">
        <div>
          <div className="eyebrow"><span className="dot" /> Your learning space</div>
          <h1>{greetingFor(new Date().getHours())}{firstName ? <>, <em>{firstName}</em></> : ""}.</h1>
          <p>{dueCards.length ? `${pluralize(dueCards.length, "card")} due for review today.` : data.sets.length ? "You are all caught up on reviews." : "Start by creating your first study set."}</p>
        </div>
        <motion.button whileTap={tap} className="btn primary" onClick={openCreate}><Plus size={16} aria-hidden="true" /> New study set</motion.button>
      </motion.div>

      <motion.section variants={itemV} className="featured" aria-label="Next step">
        <div className="featured-copy">
          <span className="eyebrow"><Sparkles size={13} aria-hidden="true" /> {step.kicker}</span>
          <h2>{step.title}</h2><p>{step.text}</p>
          <div className="featured-actions">
            <motion.button whileTap={tap} className="btn primary lg" onClick={step.run}><step.icon size={16} aria-hidden="true" /> {step.cta}</motion.button>
          </div>
        </div>
        <div className="featured-side">
          <Ring value={goalPct} label="Study goal progress" caption="of daily goal" />
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{data.studyMinutes} / {data.dailyGoal} min<br /><button className="link-btn" onClick={() => go("settings")}>Edit goal</button></div>
        </div>
      </motion.section>

      <motion.div variants={itemV} className="stat-strip" role="group" aria-label="Learning statistics">
        <Stat icon={BookOpen} label="Study sets" value={data.sets.length} note="Your knowledge library" />
        <Stat icon={Target} label="Test accuracy" value={accuracy} format={(n) => `${n}%`} note={totalQuestions ? `${totalQuestions} questions answered` : "No tests taken yet"} />
        <Stat icon={Clock3} label="Study time" value={data.studyMinutes} format={formatMinutes} note="Time invested so far" />
        <Stat icon={Flame} label="Current streak" value={data.streak} format={(n) => `${n} days`} note="Consistency builds mastery" />
      </motion.div>

      <motion.div variants={itemV} className="quick-grid">
        {quick.map((q) => (
          <motion.button whileTap={tap} className="quick" key={q.label} onClick={q.run}>
            <span className="ic"><q.icon size={16} aria-hidden="true" /></span><span><b>{q.label}</b><small>{q.note}</small></span>
          </motion.button>
        ))}
      </motion.div>

      <motion.div variants={itemV} className="section-head">
        <div><h3>Pick up where you left off</h3><p className="panel-sub">Your recent learning materials</p></div>
        <button className="link-btn" onClick={() => go("library")}>View library <ArrowRight size={14} aria-hidden="true" /></button>
      </motion.div>
      {data.sets.length === 0 ? (
        <motion.div variants={itemV}><EmptyState icon={BookOpen} title="Your library starts here" text="Upload class notes or describe a topic. MEMORA will turn it into a complete study set." action={<button className="btn primary" onClick={openCreate}><Plus size={15} aria-hidden="true" /> Create a study set</button>} /></motion.div>
      ) : (
        <motion.div className="set-grid" variants={listV}>{data.sets.slice(0, 3).map((s) => <SetCard key={s.id} set={s} onOpen={() => { selectSet(s.id); go("reviewer"); }} onDelete={() => deleteSet(s.id)} />)}</motion.div>
      )}

      <motion.div variants={itemV} className="grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="panel-head"><div><h3>Learning activity</h3><p className="panel-sub">Examination accuracy this week</p></div><span className="tag">LAST 7 DAYS</span></div>
          {data.attempts.length ? <AccuracyChart data={chartData} /> : <div className="chart-empty"><Activity size={20} aria-hidden="true" /><span>Your learning activity will appear here after your first test.</span></div>}
        </div>
        <div className="stack">
          <div className="panel">
            <div className="panel-head"><div><h3>Upcoming reviews</h3><p className="panel-sub">Spaced-repetition schedule</p></div><Brain size={18} color="var(--accent-text)" aria-hidden="true" /></div>
            {upcoming.length ? upcoming.map(({ s, due }) => (
              <button key={s.id} className="list-row" onClick={() => { selectSet(s.id); go("flashcards"); }}>
                <div className="row-main"><b>{s.title}</b><small>{pluralize(s.cards.length, "card")}</small></div><span className="badge">{due} due</span>
              </button>
            )) : <p className="panel-sub">{nextDue ? `Nothing due now. Next review ${shortDate(nextDue.dueAt)}.` : "No reviews scheduled yet. Rate flashcards to schedule them."}</p>}
          </div>
          <div className="panel">
            <div className="panel-head"><div><h3>Study recommendations</h3><p className="panel-sub">Based on your activity</p></div><Lightbulb size={18} color="var(--amber)" aria-hidden="true" /></div>
            {recs.length ? recs.map((r, i) => <div className="rec" key={i}><Sparkles size={14} aria-hidden="true" /><span>{r.text}</span></div>) : <p className="panel-sub">Recommendations appear as you study and take tests.</p>}
          </div>
        </div>
      </motion.div>

      {data.attempts.length > 0 && (
        <motion.div variants={itemV} className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head"><div><h3>Recent activity</h3><p className="panel-sub">Your latest examinations</p></div><button className="link-btn" onClick={() => go("insights")}>All progress <ArrowRight size={14} aria-hidden="true" /></button></div>
          {data.attempts.slice(0, 4).map((a) => (
            <div className="list-row" key={a.id}>
              <div className="row-ic"><Target size={16} aria-hidden="true" /></div>
              <div className="row-main"><b>{a.title}</b><small>{shortDate(a.date)} · {a.duration} min</small></div>
              <span className="row-end">{a.score}/{a.total} <small>({Math.round((a.score / a.total) * 100)}%)</small></span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
