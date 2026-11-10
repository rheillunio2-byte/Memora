import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Attempt, Page, StudyQuestion, StudySet } from "./types";
import { initialData, loadData, saveData, uid } from "./lib/storage";
import { extractFile } from "./services/extract";
import { askMemora, generateStudy } from "./services/generate";
import { QUALITY, schedule } from "./lib/srs";
import type { RecallLevel } from "./lib/srs";
import { pageV } from "./lib/motion";
import { sameAnswer } from "./lib/format";
import { BottomNav, Sidebar, Topbar, nav } from "./components/Shell";
import { ConfirmDialog, Toasts } from "./components/ui";
import type { ConfirmOptions, Toast, ToastTone } from "./components/ui";
import { AddCardModal, CreateModal, UpgradeModal } from "./components/Modals";
import type { FileMeta } from "./components/Modals";
import type { Ctx } from "./pages/ctx";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Reviewer from "./pages/Reviewer";
import Flashcards from "./pages/Flashcards";
import TestForge from "./pages/TestForge";
import MemoryLoop from "./pages/MemoryLoop";
import Mistakes from "./pages/Mistakes";
import Insights from "./pages/Insights";
import Ask from "./pages/Ask";
import Settings from "./pages/Settings";

const THEME_KEY = "memora-theme";

export default function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"create" | "upgrade" | "card" | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null);
  const [dark, setDark] = useState(() => { try { return localStorage.getItem(THEME_KEY) !== "light"; } catch { return true; } });
  const [activeSetId, setActiveSetId] = useState("");
  const [phase, setPhase] = useState<"idle" | "reading" | "generating">("idle");
  const [error, setError] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [topic, setTopic] = useState("");
  const [instruction, setInstruction] = useState("");
  const [sourceName, setSourceName] = useState("Prompt-based study material");
  const [count, setCount] = useState(12);
  const [difficulty, setDifficulty] = useState("Mixed");
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [lastRating, setLastRating] = useState<RecallLevel | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examIndex, setExamIndex] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examStart, setExamStart] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examFlags, setExamFlags] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([{ role: "assistant", text: "Hi! I’m MEMORA. Choose a study set from your library, then ask me to explain a concept, compare ideas, or help you understand a mistake." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => saveData(data), [data]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch { /* storage unavailable */ } document.body.style.background = dark ? "#0b0c10" : "#f6f6fa"; }, [dark]);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeSet = data.sets.find((s) => s.id === activeSetId) || data.sets[0];
  const allMistakes = data.attempts.flatMap((a) => a.mistakes.map((q) => ({ ...q, attemptId: a.id })));
  const totalQuestions = data.attempts.reduce((n, a) => n + a.total, 0);
  const correctQuestions = data.attempts.reduce((n, a) => n + a.score, 0);
  const accuracy = totalQuestions ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
  const dueCards = data.sets.flatMap((s) => s.cards.map((c) => ({ ...c, setId: s.id }))).filter((c) => c.dueAt <= Date.now());
  const filteredSets = data.sets.filter((s) => (s.title + " " + s.subject).toLowerCase().includes(query.toLowerCase()));

  const notify = useCallback((msg: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  const updateSet = useCallback((id: string, patch: Partial<StudySet>) => setData((d) => ({ ...d, sets: d.sets.map((s) => (s.id === id ? { ...s, ...patch } : s)) })), []);
  const selectSet = useCallback((id: string) => { setActiveSetId(id); setCardIndex(0); setFlipped(false); setLastRating(null); }, []);
  const go = useCallback((p: Page) => { setPage(p); setMobileOpen(false); }, []);
  const openCreate = useCallback(() => { setModal("create"); setError(""); setMobileOpen(false); }, []);
  const askConfirm = useCallback((o: ConfirmOptions) => setConfirmOpts(o), []);

  async function onFile(file?: File) {
    if (!file) return;
    setError(""); setPhase("reading");
    try {
      const result = await extractFile(file);
      setSourceText(result.text); setSourceName(file.name);
      setFileMeta({ name: file.name, pages: result.pages, warnings: result.warnings });
      notify("Document text extracted");
    } catch (e: any) { setError(e.message); } finally { setPhase("idle"); }
  }
  async function createSet() {
    setError("");
    const source = sourceText.trim() || topic.trim();
    if (source.length < 30) { setError("Add a document or write a topic prompt with at least 30 characters."); return; }
    setPhase("generating");
    try {
      const generated = await generateStudy({ text: source, topic: topic || "General study topic", instruction, count, difficulty, output: "Complete reviewer, terms, flashcards and practice questions" });
      const set: StudySet = {
        id: uid(), title: topic.trim() || sourceName.replace(/\.[^.]+$/, ""), subject: topic.trim() || "General", sourceName, sourceText: source, createdAt: Date.now(),
        reviewer: generated.reviewer, terms: generated.terms || [],
        questions: (generated.questions || []).map((q) => ({ ...q, id: q.id || uid() })),
        cards: (generated.cards || []).map((c) => ({ id: uid(), ...c, dueAt: Date.now(), interval: 0, ease: 2.5, reps: 0, status: "new" as const })),
        completedTopics: [],
      };
      setData((d) => ({ ...d, sets: [set, ...d.sets] }));
      setActiveSetId(set.id); setModal(null); setPage("reviewer"); setCardIndex(0); setFlipped(false);
      notify("Your study set is ready");
    } catch (e: any) { setError(e.message); } finally { setPhase("idle"); }
  }
  function addCard(front: string, back: string) {
    if (!activeSet) return;
    updateSet(activeSet.id, { cards: [...activeSet.cards, { id: uid(), front, back, topic: activeSet.subject, dueAt: Date.now(), interval: 0, ease: 2.5, reps: 0, status: "new" }] });
    setModal(null); notify("Flashcard added");
  }
  const rateCard = useCallback((level: RecallLevel) => {
    if (!activeSet) return;
    const card = activeSet.cards[Math.min(cardIndex, activeSet.cards.length - 1)];
    if (!card) return;
    const next = schedule(QUALITY[level], card.reps, card.interval, card.ease);
    const updated = { ...card, ...next, dueAt: Date.now() + next.interval * 86400000, status: next.interval <= 1 ? ("learning" as const) : ("review" as const) };
    updateSet(activeSet.id, { cards: activeSet.cards.map((c) => (c.id === card.id ? updated : c)) });
    setLastRating(level); setFlipped(false);
    setCardIndex((i) => (i + 1) % Math.max(1, activeSet.cards.length));
    setData((d) => ({ ...d, studyMinutes: d.studyMinutes + 1 }));
    notify(`Next review in ${next.interval} day${next.interval === 1 ? "" : "s"}`, "info");
  }, [activeSet, cardIndex, updateSet, notify]);
  const moveCard = useCallback((d: number) => {
    const n = activeSet?.cards.length || 0; if (!n) return;
    setLastRating(null); setFlipped(false); setCardIndex((i) => (Math.min(i, n - 1) + d + n) % n);
  }, [activeSet]);
  function beginExam() {
    if (!activeSet?.questions.length) { notify("Generate or add questions first", "error"); return; }
    setExamAnswers({}); setExamFlags([]); setExamIndex(0); setExamSubmitted(false); setExamStarted(true); setExamStart(Date.now());
  }
  function submitExam() {
    if (!activeSet) return;
    const mistakes: StudyQuestion[] = []; let score = 0; const topicScores: Attempt["topicScores"] = {};
    activeSet.questions.forEach((q) => {
      const ok = sameAnswer(examAnswers[q.id], q.answer);
      if (ok) score++; else mistakes.push(q);
      const t = topicScores[q.topic] || { correct: 0, total: 0 }; t.total++; if (ok) t.correct++; topicScores[q.topic] = t;
    });
    const attempt: Attempt = { id: uid(), setId: activeSet.id, title: activeSet.title, score, total: activeSet.questions.length, date: Date.now(), topicScores, duration: Math.round((Date.now() - examStart) / 60000), mistakes };
    setData((d) => ({ ...d, attempts: [attempt, ...d.attempts], studyMinutes: d.studyMinutes + attempt.duration }));
    setExamSubmitted(true); notify("Examination submitted");
  }
  function addMistakeCard(q: StudyQuestion) {
    const s = data.sets.find((x) => x.questions.some((y) => y.id === q.id));
    if (!s) { notify("Original study set was deleted", "error"); return; }
    if (s.cards.some((c) => c.front === q.question)) { notify("Already in your flashcards", "info"); return; }
    updateSet(s.id, { cards: [...s.cards, { id: uid(), front: q.question, back: q.answer, topic: q.topic, dueAt: Date.now(), interval: 0, ease: 2.5, reps: 0, status: "new" }] });
    notify("Mistake converted to a flashcard");
  }
  async function sendChat() {
    if (!chatInput.trim() || chatBusy) return;
    const q = chatInput.trim();
    setChatMessages((c) => [...c, { role: "user", text: q }]); setChatInput(""); setChatBusy(true);
    try { const a = await askMemora(q, activeSet?.sourceText || ""); setChatMessages((c) => [...c, { role: "assistant", text: a }]); }
    catch (e: any) { setChatMessages((c) => [...c, { role: "assistant", text: e.message }]); }
    finally { setChatBusy(false); }
  }
  function deleteSet(id: string) {
    const s = data.sets.find((x) => x.id === id);
    askConfirm({ title: "Delete this study set?", message: `“${s?.title ?? "This set"}” and its flashcards will be permanently removed.`, confirmLabel: "Delete", danger: true, onConfirm: () => {
      setData((d) => ({ ...d, sets: d.sets.filter((x) => x.id !== id) })); if (activeSetId === id) setActiveSetId(""); notify("Study set deleted");
    } });
  }

  const chartData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (6 - i));
    const label = day.toLocaleDateString(undefined, { weekday: "short" });
    const attempts = data.attempts.filter((a) => new Date(a.date).toDateString() === day.toDateString());
    return { day: label, accuracy: attempts.length ? Math.round(attempts.reduce((n, a) => n + (a.score / a.total) * 100, 0) / attempts.length) : 0, minutes: attempts.reduce((n, a) => n + a.duration, 0) };
  }), [data.attempts]);

  const ctx: Ctx = { data, setData, activeSet, go, openCreate, openUpgrade: () => { setModal("upgrade"); setMobileOpen(false); }, notify, confirm: askConfirm, updateSet, selectSet, deleteSet, query, filteredSets, allMistakes, totalQuestions, correctQuestions, accuracy, dueCards, chartData };
  const pageTitle = nav.find((n) => n.id === page)?.label || "Settings";
  const fc = { index: cardIndex, flipped, setFlipped, last: lastRating, rate: rateCard, move: moveCard, openAdd: () => setModal("card") };
  const exam = { answers: examAnswers, setAnswers: setExamAnswers, index: examIndex, setIndex: setExamIndex, started: examStarted, submitted: examSubmitted, flags: examFlags, setFlags: setExamFlags, start: examStart, begin: beginExam, submit: submitExam, reset: () => { setExamStarted(false); setExamSubmitted(false); } };
  const chat = { messages: chatMessages, input: chatInput, setInput: setChatInput, send: sendChat, busy: chatBusy };
  const clearAll = () => { setData(initialData); setActiveSetId(""); notify("Workspace cleared"); };

  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      <a className="skip" href="#main">Skip to content</a>
      <Sidebar page={page} go={go} open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} dueCount={dueCards.length} onCreate={openCreate} onUpgrade={ctx.openUpgrade} />
      <AnimatePresence>{mobileOpen && <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />}</AnimatePresence>
      <div className="main">
        <Topbar pageTitle={pageTitle} query={query} setQuery={setQuery} searchRef={searchRef} dark={dark} toggleTheme={() => setDark((v) => !v)} data={data} go={go} onMenu={() => setMobileOpen(true)} onUpgrade={ctx.openUpgrade} />
        <main id="main" className="content">
          <AnimatePresence mode="wait">
            <motion.div key={page} variants={pageV} initial="initial" animate="animate" exit="exit">
              {page === "dashboard" && <Dashboard c={ctx} />}
              {page === "library" && <Library c={ctx} />}
              {page === "reviewer" && <Reviewer c={ctx} />}
              {page === "flashcards" && <Flashcards c={ctx} fc={fc} />}
              {page === "testforge" && <TestForge c={ctx} exam={exam} />}
              {page === "memoryloop" && <MemoryLoop c={ctx} />}
              {page === "mistakes" && <Mistakes c={ctx} addMistakeCard={addMistakeCard} />}
              {page === "insights" && <Insights c={ctx} />}
              {page === "ask" && <Ask c={ctx} chat={chat} />}
              {page === "settings" && <Settings c={ctx} dark={dark} setDark={setDark} clearAll={clearAll} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav page={page} go={go} onMore={() => setMobileOpen(true)} />
      <AnimatePresence>
        {modal === "create" && <CreateModal key="create" onClose={() => setModal(null)} form={{ topic, setTopic, sourceText, setSourceText: (v) => { setSourceText(v); setFileMeta(null); }, instruction, setInstruction, count, setCount, difficulty, setDifficulty, fileMeta, clearFile: () => { setFileMeta(null); setSourceText(""); setSourceName("Prompt-based study material"); }, onFile, submit: createSet, error, phase }} />}
        {modal === "upgrade" && <UpgradeModal key="upgrade" onClose={() => setModal(null)} />}
        {modal === "card" && <AddCardModal key="card" onClose={() => setModal(null)} onAdd={addCard} />}
      </AnimatePresence>
      <ConfirmDialog options={confirmOpts} onClose={() => setConfirmOpts(null)} />
      <Toasts items={toasts} />
    </div>
  );
}
