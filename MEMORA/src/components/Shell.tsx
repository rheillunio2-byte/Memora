import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, Bookmark, BookOpen, ChevronRight, FileText, Flame, Grid2X2, Layers, LifeBuoy, Menu, MessageCircle, Moon, PanelLeftClose, Plus, RotateCcw, Search, Settings, Sun, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppData, Page } from "../types";
import { initialsOf } from "../lib/format";
import { ease, popV } from "../lib/motion";
import { Logo } from "./ui";

export const nav: { id: Page; label: string; icon: LucideIcon; group: string }[] = [
  { id: "dashboard", label: "Overview", icon: Grid2X2, group: "LEARN" },
  { id: "library", label: "My library", icon: BookOpen, group: "LEARN" },
  { id: "reviewer", label: "Smart reviewer", icon: FileText, group: "STUDY TOOLS" },
  { id: "flashcards", label: "Flashcards", icon: Layers, group: "STUDY TOOLS" },
  { id: "testforge", label: "TestForge", icon: Target, group: "STUDY TOOLS" },
  { id: "memoryloop", label: "MemoryLoop", icon: RotateCcw, group: "STUDY TOOLS" },
  { id: "mistakes", label: "Mistake notebook", icon: Bookmark, group: "STUDY TOOLS" },
  { id: "insights", label: "Progress", icon: BarChart3, group: "INSIGHTS" },
  { id: "ask", label: "Ask MEMORA", icon: MessageCircle, group: "INSIGHTS" },
];

type SidebarProps = { page: Page; go: (p: Page) => void; open: boolean; onClose: () => void; data: AppData; dueCount: number; onCreate: () => void; onUpgrade: () => void };

export function Sidebar({ page, go, open, onClose, data, dueCount, onCreate, onUpgrade }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Primary">
      <div className="side-top">
        <Logo />
        <button className="icon-btn only-mobile-btn" style={{ display: open ? "inline-grid" : "none" }} onClick={onClose} aria-label="Close navigation"><PanelLeftClose size={17} /></button>
      </div>
      <button className="btn primary block" style={{ justifyContent: "flex-start", marginBottom: 18 }} onClick={onCreate}><Plus size={16} aria-hidden="true" /> Create study set</button>
      <div className="side-scroll">
        <nav aria-label="Main">
          {["LEARN", "STUDY TOOLS", "INSIGHTS"].map((group) => (
            <div className="nav-group" key={group}>
              <div className="nav-label">{group}</div>
              {nav.filter((n) => n.group === group).map((item) => {
                const active = page === item.id;
                return (
                  <button key={item.id} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => go(item.id)}>
                    <span className="nav-hover" aria-hidden="true" />
                    {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ duration: 0.32, ease }} />}
                    <item.icon size={17} aria-hidden="true" /><span>{item.label}</span>
                    {item.id === "memoryloop" && dueCount > 0 && <b className="nav-count" aria-label={`${dueCount} cards due`}>{dueCount}</b>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      <div className="side-bottom">
        <div className="mini-card">
          <div className="mini-row"><span style={{ display: "flex", alignItems: "center", gap: 8 }}><Flame size={15} color="var(--amber)" aria-hidden="true" /><b>{data.streak} day streak</b></span></div>
        </div>
        <div className="mini-card">
          <div className="mini-row"><span>Plan</span><span className="tag-pill">{data.plan.toUpperCase()}</span></div>
          <div className="mini-row" style={{ marginTop: 8 }}><span>AI study sets</span><b>{data.plan === "pro" ? "Unlimited" : `${data.sets.length}/5`}</b></div>
          <button className="link-btn" style={{ marginTop: 10 }} onClick={onUpgrade}>Explore MEMORA Pro <ArrowRight size={13} aria-hidden="true" /></button>
        </div>
        <button className="profile-row" onClick={() => go("settings")}>
          <span className="avatar" aria-hidden="true">{initialsOf(data.name)}</span>
          <span className="profile-text"><b>{data.name?.trim() || "My workspace"}</b><small>Personal account</small></span>
          <ChevronRight size={15} color="var(--muted)" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

type TopbarProps = { pageTitle: string; query: string; setQuery: (v: string) => void; searchRef: RefObject<HTMLInputElement>; dark: boolean; toggleTheme: () => void; data: AppData; go: (p: Page) => void; onMenu: () => void; onUpgrade: () => void };

export function Topbar({ pageTitle, query, setQuery, searchRef, dark, toggleTheme, data, go, onMenu, onUpgrade }: TopbarProps) {
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setMenu(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("mousedown", onDown); window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [menu]);
  const pick = (fn: () => void) => () => { setMenu(false); fn(); };
  return (
    <header className="topbar">
      <div className="top-left">
        <button className="icon-btn" style={{ display: "var(--menu-display,none)" }} id="menu-btn" onClick={onMenu} aria-label="Open navigation"><Menu size={19} /></button>
        <div className="breadcrumb"><span className="crumb-root">Workspace</span><ChevronRight size={13} className="crumb-root" aria-hidden="true" /><b>{pageTitle}</b></div>
      </div>
      <div className="top-actions">
        <label className="search-box">
          <Search size={15} aria-hidden="true" />
          <input ref={searchRef} placeholder="Search your library..." aria-label="Search your library" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go("library")} />
          <kbd>Ctrl K</kbd>
        </label>
        <button className="icon-btn" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} data-tip={dark ? "Light theme" : "Dark theme"}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        <div className="menu-wrap" ref={wrap}>
          <button className="avatar" onClick={() => setMenu((v) => !v)} aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu">{initialsOf(data.name)}</button>
          <AnimatePresence>
            {menu && (
              <motion.div className="menu" role="menu" variants={popV} initial="initial" animate="animate" exit="exit">
                <div className="menu-head"><b>{data.name?.trim() || "My workspace"}</b><small>Stored in this browser</small></div>
                <button role="menuitem" onClick={pick(() => go("settings"))}><Settings size={15} aria-hidden="true" /> Settings &amp; profile</button>
                <button role="menuitem" onClick={pick(toggleTheme)}>{dark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />} {dark ? "Light theme" : "Dark theme"}</button>
                <button role="menuitem" onClick={pick(onUpgrade)}><LifeBuoy size={15} aria-hidden="true" /> Explore MEMORA Pro</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

const tabs: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Home", icon: Grid2X2 }, { id: "library", label: "Library", icon: BookOpen },
  { id: "flashcards", label: "Cards", icon: Layers }, { id: "testforge", label: "Test", icon: Target },
];

export function BottomNav({ page, go, onMore }: { page: Page; go: (p: Page) => void; onMore: () => void }) {
  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {tabs.map((t) => (
        <button key={t.id} className={page === t.id ? "active" : ""} aria-current={page === t.id ? "page" : undefined} onClick={() => go(t.id)}>
          {page === t.id && <motion.span layoutId="bn-pill" className="bn-pill" transition={{ duration: 0.28, ease }} />}
          <t.icon size={20} aria-hidden="true" /><span>{t.label}</span>
        </button>
      ))}
      <button onClick={onMore}><Menu size={20} aria-hidden="true" /><span>More</span></button>
    </nav>
  );
}
