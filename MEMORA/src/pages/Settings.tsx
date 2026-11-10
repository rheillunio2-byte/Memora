import { Trash2 } from "lucide-react";
import { PageHead, Segmented } from "../components/ui";
import { initialsOf } from "../lib/format";
import type { Ctx } from "./ctx";

export default function Settings({ c, dark, setDark, clearAll }: { c: Ctx; dark: boolean; setDark: (v: boolean) => void; clearAll: () => void }) {
  const { data, setData, confirm } = c;
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "memora-workspace.json"; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <PageHead title="Settings" desc="Make MEMORA work the way you learn." />
      <div className="grid-even">
        <div className="stack">
          <div className="panel">
            <h3>Profile</h3><p className="panel-sub">Used for your greeting. Stored only in this browser.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
              <span className="avatar" style={{ width: 48, height: 48, fontSize: 16 }} aria-hidden="true">{initialsOf(data.name)}</span>
              <div style={{ flex: 1 }}>
                <label className="field-label" htmlFor="display-name" style={{ margin: "0 0 6px" }}>Display name</label>
                <input id="display-name" className="input" maxLength={40} placeholder="Your name" value={data.name || ""} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="panel">
            <h3>Learning preferences</h3><p className="panel-sub">Set a daily study target that feels achievable.</p>
            <label className="field-label" htmlFor="goal">Daily study goal <b style={{ color: "var(--text)" }}>{data.dailyGoal} minutes</b></label>
            <input id="goal" type="range" min="10" max="180" step="5" value={data.dailyGoal} onChange={(e) => setData((d) => ({ ...d, dailyGoal: Number(e.target.value) }))} />
            <div className="range-labels"><span>10 min</span><span>3 hours</span></div>
            <div className="setting"><div><b>Appearance</b><small>Switch between dark and light workspace</small></div>
              <Segmented id="theme" label="Theme" value={dark ? "dark" : "light"} onChange={(v) => setDark(v === "dark")} options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} /></div>
          </div>
        </div>
        <div className="panel">
          <h3>Data &amp; privacy</h3><p className="panel-sub">Your workspace is stored locally in this browser.</p>
          <div className="setting"><div><b>Export workspace</b><small>Download your study sets and results as JSON.</small></div><button className="btn" onClick={exportData}>Export data</button></div>
          <div className="setting"><div><b>Clear all workspace data</b><small>This permanently removes local study materials and results.</small></div>
            <button className="btn danger" onClick={() => confirm({ title: "Clear all workspace data?", message: "This permanently removes every study set, flashcard and result stored in this browser.", confirmLabel: "Clear data", danger: true, onConfirm: clearAll })}><Trash2 size={14} aria-hidden="true" /> Clear data</button></div>
        </div>
      </div>
    </>
  );
}
