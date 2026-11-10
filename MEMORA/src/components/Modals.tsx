import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CloudUpload, FileText, ShieldCheck, Sparkles, X } from "lucide-react";
import { Modal, ModalHead, Spinner } from "./ui";
import { ease } from "../lib/motion";

export type FileMeta = { name: string; pages: number; warnings: string[] };
export type CreateForm = {
  topic: string; setTopic: (v: string) => void; sourceText: string; setSourceText: (v: string) => void;
  instruction: string; setInstruction: (v: string) => void; count: number; setCount: (v: number) => void;
  difficulty: string; setDifficulty: (v: string) => void; fileMeta: FileMeta | null; clearFile: () => void;
  onFile: (f?: File) => void; submit: () => void; error: string; phase: "idle" | "reading" | "generating";
};

export function CreateModal({ form, onClose }: { form: CreateForm; onClose: () => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const f = form;
  const generating = f.phase === "generating";
  return (
    <Modal label="Create a study set" onClose={onClose}>
      <ModalHead eyebrow="MEMORA STUDIO" title="Create a study set" desc="Bring your materials. Leave with a plan to master them." onClose={onClose} />
      <AnimatePresence mode="wait" initial={false}>
        {generating ? (
          <motion.div key="processing" className="processing" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}><Sparkles size={16} color="var(--accent-text)" aria-hidden="true" /> Building your study set…</div>
            <p className="panel-sub">Reading your material and drafting the reviewer, flashcards and questions. Longer documents take longer.</p>
            <div className="indeterminate" />
            <div className="skeleton" style={{ height: 14, width: "70%" }} /><div className="skeleton" style={{ height: 14, width: "92%" }} /><div className="skeleton" style={{ height: 14, width: "55%" }} />
            {f.error && <div className="error-box" role="alert">{f.error}</div>}
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <label className="field-label" htmlFor="topic">Study topic or subject <span>OPTIONAL IF UPLOADING</span></label>
            <input id="topic" className="input" value={f.topic} onChange={(e) => f.setTopic(e.target.value)} placeholder="e.g. Philippine Constitution, Biology, Set Theory" />
            <div className="field-label" id="material-label">Your learning material</div>
            {f.fileMeta ? (
              <div className="file-chip">
                <div className="row-ic"><FileText size={16} aria-hidden="true" /></div>
                <div style={{ flex: 1, minWidth: 0 }}><b>{f.fileMeta.name}</b><small>{f.fileMeta.pages} page(s) or slides extracted</small></div>
                <button className="icon-btn" onClick={f.clearFile} aria-label="Remove file" data-tip="Remove file"><X size={16} /></button>
              </div>
            ) : (
              <div className={`upload ${over ? "over" : ""}`} role="button" tabIndex={0} aria-labelledby="material-label" onClick={() => file.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), file.current?.click())}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); f.onFile(e.dataTransfer.files[0]); }}>
                <input ref={file} type="file" hidden accept=".pdf,.docx,.pptx,.txt" onChange={(e) => { f.onFile(e.target.files?.[0]); e.target.value = ""; }} />
                {f.phase === "reading" ? <><Spinner /><b>Extracting text…</b></> : <><CloudUpload size={22} aria-hidden="true" /><b>Drop a document here, or browse files</b><span>PDF, DOCX, PPTX or TXT · Up to 20 MB</span></>}
              </div>
            )}
            {f.fileMeta?.warnings.map((w, i) => <div className="warning" key={i}>{w}</div>)}
            <div className="or"><span>OR PASTE YOUR NOTES / PROMPT</span></div>
            <textarea className="input" style={{ height: 110 }} aria-label="Notes or prompt" value={f.sourceText} onChange={(e) => f.setSourceText(e.target.value)} placeholder="Paste your lesson, notes, or a detailed instruction such as: Create a comprehensive reviewer about the Philippine Constitution..." />
            {f.sourceText.length > 0 && <div className="panel-sub" style={{ marginTop: 6 }}>{f.sourceText.length.toLocaleString()} characters{f.sourceText.length > 160000 ? " · only the first 160,000 are used" : ""}</div>}
            <label className="field-label" htmlFor="instruction">Additional instructions</label>
            <input id="instruction" className="input" value={f.instruction} onChange={(e) => f.setInstruction(e.target.value)} placeholder="Focus on definitions, key concepts, and exam-worthy facts..." />
            <div className="form-row">
              <div><label className="field-label" htmlFor="count">Questions</label><select id="count" className="input" value={f.count} onChange={(e) => f.setCount(Number(e.target.value))}>{[5, 10, 12, 20, 30, 50].map((n) => <option key={n} value={n}>{n} questions</option>)}</select></div>
              <div><label className="field-label" htmlFor="difficulty">Difficulty</label><select id="difficulty" className="input" value={f.difficulty} onChange={(e) => f.setDifficulty(e.target.value)}><option>Mixed</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
            </div>
            {f.error && <div className="error-box" role="alert">{f.error}</div>}
            <div className="modal-actions">
              <button className="btn" onClick={onClose}>Cancel</button>
              <button className="btn primary" disabled={f.phase !== "idle"} onClick={f.submit}><Sparkles size={15} aria-hidden="true" /> Generate study set</button>
            </div>
            <p className="footnote"><ShieldCheck size={12} aria-hidden="true" /> Source-grounded generation · AI requires a server-side Gemini API key.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal label="MEMORA Pro preview" onClose={onClose}>
      <ModalHead eyebrow="MEMORA STUDIO" title="Go further with Pro" desc="A preview of the expanded learning experience." onClose={onClose} />
      <div className="plans">
        <div className="plan"><span>MEMORA FREE</span><h3>$0 <small>/ forever</small></h3><p>Everything you need to start building better study habits.</p>
          <ul><li><Check aria-hidden="true" /> 5 AI study sets</li><li><Check aria-hidden="true" /> Manual flashcards and practice tests</li><li><Check aria-hidden="true" /> Basic progress insights</li></ul></div>
        <div className="plan feat"><span>MEMORA PRO · PREVIEW</span><h3>Coming soon</h3><p>Designed for students who want more room to grow.</p>
          <ul><li><Check aria-hidden="true" /> Higher AI generation limits</li><li><Check aria-hidden="true" /> Advanced reviewer exports</li><li><Check aria-hidden="true" /> Expanded analytics and storage</li></ul>
          <small className="panel-sub">No payment is collected in this preview.</small></div>
        <button className="btn full" onClick={onClose}>Back to workspace</button>
      </div>
    </Modal>
  );
}

export function AddCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (front: string, back: string) => void }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const submit = (e: FormEvent) => { e.preventDefault(); if (front.trim() && back.trim()) onAdd(front.trim(), back.trim()); };
  return (
    <Modal label="Add a flashcard" narrow onClose={onClose}>
      <ModalHead eyebrow="FLASHCARD STUDIO" title="Add a card" desc="Write the prompt and the answer you want to recall." onClose={onClose} />
      <form onSubmit={submit}>
        <label className="field-label" htmlFor="card-front">Question or term</label>
        <input id="card-front" className="input" autoFocus value={front} onChange={(e) => setFront(e.target.value)} />
        <label className="field-label" htmlFor="card-back">Answer or definition</label>
        <textarea id="card-back" className="input" style={{ height: 90 }} value={back} onChange={(e) => setBack(e.target.value)} />
        <div className="modal-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!front.trim() || !back.trim()}>Add card</button></div>
      </form>
    </Modal>
  );
}
