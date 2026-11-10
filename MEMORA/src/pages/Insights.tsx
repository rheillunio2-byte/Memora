import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock3, FileText, Flame, Target, Trophy } from "lucide-react";
import { AccuracyChart, MinutesChart } from "../components/charts";
import { PageHead, ProgressBar, Stat } from "../components/ui";
import { itemV, listV } from "../lib/motion";
import type { Ctx } from "./ctx";

export default function Insights({ c }: { c: Ctx }) {
  const { data, accuracy, correctQuestions, totalQuestions, chartData } = c;
  const topics = useMemo(() => {
    const acc: Record<string, { correct: number; total: number }> = {};
    data.attempts.forEach((a) => Object.entries(a.topicScores).forEach(([k, v]) => { acc[k] ??= { correct: 0, total: 0 }; acc[k].correct += v.correct; acc[k].total += v.total; }));
    return Object.entries(acc).map(([k, v]) => ({ topic: k, pct: Math.round((v.correct / v.total) * 100), ...v })).sort((a, b) => a.pct - b.pct);
  }, [data.attempts]);
  return (
    <motion.div variants={listV} initial="initial" animate="animate">
      <motion.div variants={itemV}><PageHead title="Progress intelligence" desc="Understand your learning patterns and make your next study session count." /></motion.div>
      <motion.div variants={itemV} className="stat-grid">
        <Stat icon={Trophy} label="Overall accuracy" value={accuracy} format={(n) => `${n}%`} note={`${correctQuestions} correct of ${totalQuestions}`} />
        <Stat icon={FileText} label="Examinations" value={data.attempts.length} note="Completed attempts" />
        <Stat icon={Clock3} label="Study minutes" value={data.studyMinutes} note="Recorded from study activity" />
        <Stat icon={Flame} label="Study streak" value={data.streak} format={(n) => `${n} days`} note="Current consistency" />
      </motion.div>
      <motion.div variants={itemV} className="grid-2">
        <div className="panel"><div className="panel-head"><div><h3>Accuracy trend</h3><p className="panel-sub">Daily average based on completed exams</p></div><span className="tag">LAST 7 DAYS</span></div>
          {data.attempts.length ? <AccuracyChart data={chartData} height={250} /> : <div className="chart-empty">Your accuracy trend appears after your first examination.</div>}</div>
        <div className="panel"><h3>Topic performance</h3><p className="panel-sub" style={{ marginBottom: 16 }}>Weakest topics first, from your examination answers</p>
          {topics.length ? topics.map((t) => (
            <div className="topic" key={t.topic}><div><b>{t.topic}</b><span>{t.pct}%</span></div><ProgressBar value={t.pct} label={`${t.topic} accuracy`} tone={t.pct < 50 ? "warn" : t.pct >= 80 ? "good" : undefined} size="thin" /></div>
          )) : <div className="chart-empty">Topic insights appear after your first examination.</div>}</div>
      </motion.div>
      {data.attempts.length > 0 && <motion.div variants={itemV} className="panel" style={{ marginTop: 16 }}><div className="panel-head"><div><h3>Exam time per day</h3><p className="panel-sub">Minutes spent inside examinations</p></div></div><MinutesChart data={chartData} height={190} /></motion.div>}
      <motion.div variants={itemV} className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 6 }}>Examination history</h3>
        {data.attempts.length ? data.attempts.map((a) => (
          <div className="list-row" key={a.id}>
            <div className="row-ic"><Target size={16} aria-hidden="true" /></div>
            <div className="row-main"><b>{a.title}</b><small>{new Date(a.date).toLocaleString()} · {a.duration} min</small></div>
            <span className="row-end">{a.score}/{a.total} <small>({Math.round((a.score / a.total) * 100)}%)</small></span>
          </div>
        )) : <div className="chart-empty">Your completed exams will appear here. No sample statistics are shown.</div>}
      </motion.div>
    </motion.div>
  );
}
