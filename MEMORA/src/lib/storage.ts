import type { AppData } from "../types";
const KEY = "memora-v1";
export const initialData:AppData = { sets:[], attempts:[], notes:{}, dailyGoal:30, studyMinutes:0, streak:0, lastStudyDate:"", plan:"free", name:"" };
export function loadData():AppData {
  try { const raw=localStorage.getItem(KEY); return raw?{...initialData,...JSON.parse(raw)}:initialData; }
  catch { return initialData; }
}
export function saveData(data:AppData){ localStorage.setItem(KEY,JSON.stringify(data)); }
export function uid(){ return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`; }