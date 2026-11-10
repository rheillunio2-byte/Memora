import { ArrowRight, FileText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { StudySet } from "../types";
import { shortDate } from "../lib/format";
import { itemV, tap } from "../lib/motion";

export function SetCard({ set, onOpen, onDelete }: { set: StudySet; onOpen: () => void; onDelete: () => void }) {
  return (
    <motion.div className="set-card" variants={itemV}>
      <div className="set-top">
        <div className="row-ic"><FileText size={17} aria-hidden="true" /></div>
        <button className="icon-btn" onClick={onDelete} aria-label={`Delete ${set.title}`} data-tip="Delete study set"><Trash2 size={16} /></button>
      </div>
      <span className="set-subject">{set.subject}</span>
      <h3 title={set.title}>{set.title}</h3>
      <p>{set.terms.length} key terms · {set.questions.length} questions · {set.cards.length} flashcards</p>
      <div className="set-foot"><span>{shortDate(set.createdAt)}</span><motion.button whileTap={tap} className="link-btn" onClick={onOpen}>Open set <ArrowRight size={14} aria-hidden="true" /></motion.button></div>
    </motion.div>
  );
}
