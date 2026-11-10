import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Check, Info, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ease, fadeV, popV } from "../lib/motion";

export type ToastTone = "success" | "error" | "info";
export type Toast = { id: number; msg: string; tone: ToastTone };
export type ConfirmOptions = { title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void };

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="brand">
      <svg width={small ? 28 : 32} height={small ? 28 : 32} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M20 3.5 35.5 12.4v15.2L20 36.5 4.5 27.6V12.4L20 3.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 25V15l8 7 8-7v10M20 22v7" stroke="#8B7CF6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="10.5" r="2.1" fill="#58D6DF" />
      </svg>
      {!small && <span>memora<span className="brand-dot">.</span></span>}
    </div>
  );
}

/** Counts toward `value`, re-animating from the previous value. Writes to the DOM directly so it never re-renders React. */
export function AnimatedNumber({ value, format = (n: number) => String(n) }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) { el.textContent = format(value); prev.current = value; return; }
    const controls = animate(prev.current, value, {
      duration: 0.8, ease,
      onUpdate: (v) => { prev.current = v; el.textContent = format(Math.round(v)); },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);
  return <span ref={ref} />;
}

export function Stat({ icon: Icon, label, value, format, note }: { icon: LucideIcon; label: string; value: number; format?: (n: number) => string; note: string }) {
  return (
    <div className="stat">
      <div className="stat-top"><Icon size={15} aria-hidden="true" />{label}</div>
      <strong><AnimatedNumber value={value} format={format} /></strong>
      <small>{note}</small>
    </div>
  );
}

export function ProgressBar({ value, label, tone, size }: { value: number; label: string; tone?: "warn" | "good"; size?: "thin" | "thick" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`bar ${tone || ""} ${size || ""}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }} transition={{ duration: 0.7, ease }} />
    </div>
  );
}

export function Ring({ value, label, caption }: { value: number; label: string; caption: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const gid = "ring" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className="ring" role="img" aria-label={`${label}: ${Math.round(pct)}%`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b7cf6" /><stop offset="1" stopColor="#58d6df" /></linearGradient></defs>
        <circle cx="60" cy="60" r="49" className="bg" />
        <motion.circle cx="60" cy="60" r="49" className="fg" stroke={`url(#${gid})`} pathLength={1} strokeDasharray="1" initial={{ strokeDashoffset: 1 }} animate={{ strokeDashoffset: 1 - pct / 100 }} transition={{ duration: 1, ease }} />
      </svg>
      <div><b><AnimatedNumber value={Math.round(pct)} format={(n) => `${n}%`} /></b><small>{caption}</small></div>
    </div>
  );
}

export function PageHead({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return <div className="page-head"><div><h1>{title}</h1><p>{desc}</p></div>{action}</div>;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={22} aria-hidden="true" /></div>
      <h3>{title}</h3><p>{text}</p>{action}
    </div>
  );
}

export function Spinner() { return <span className="spinner" aria-hidden="true" />; }

export function Segmented<T extends string>({ id, value, options, onChange, label }: { id: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="seg-pill" transition={{ duration: 0.25, ease }} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])';

/** Accessible modal: Escape closes, Tab is trapped, focus is restored on close. */
export function Modal({ onClose, label, narrow, children }: { onClose: () => void; label: string; narrow?: boolean; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeRef.current(); return; }
      if (e.key !== "Tab" || !box.current) return;
      const items = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); previous?.focus?.(); };
  }, []);
  return (
    <motion.div className="backdrop" variants={fadeV} initial="initial" animate="animate" exit="exit" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className={`modal ${narrow ? "narrow" : ""}`} variants={popV} style={{ outline: "none" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ModalHead({ eyebrow, title, desc, onClose }: { eyebrow: string; title: string; desc: string; onClose: () => void }) {
  return (
    <div className="modal-head">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{desc}</p></div>
      <button className="icon-btn" onClick={onClose} aria-label="Close dialog" data-tip="Close"><X size={18} /></button>
    </div>
  );
}

export function ConfirmDialog({ options, onClose }: { options: ConfirmOptions | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {options && (
        <Modal key="confirm" narrow label={options.title} onClose={onClose}>
          <h2 style={{ font: "800 19px var(--display)", letterSpacing: "-.02em", marginBottom: 8 }}>{options.title}</h2>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{options.message}</p>
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className={`btn ${options.danger ? "danger" : "primary"}`} onClick={() => { options.onConfirm(); onClose(); }}>{options.confirmLabel || "Confirm"}</button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

const toastIcon = { success: Check, error: AlertCircle, info: Info };
export function Toasts({ items }: { items: Toast[] }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = toastIcon[t.tone];
          return (
            <motion.div key={t.id} layout className={`toast ${t.tone}`} initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.22, ease }}>
              <Icon size={16} aria-hidden="true" />{t.msg}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** Animated checkbox used for checklists. */
export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  const id = useId();
  return (
    <label className="check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="box"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span>
      <span>{children}</span>
    </label>
  );
}

