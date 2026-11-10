import { motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import { SetCard } from "../components/SetCard";
import { EmptyState, PageHead } from "../components/ui";
import { listV, tap } from "../lib/motion";
import type { Ctx } from "./ctx";

export default function Library({ c }: { c: Ctx }) {
  const { filteredSets, query, openCreate, selectSet, go, deleteSet } = c;
  return (
    <>
      <PageHead title="Your library" desc="Every topic you turn into progress, all in one place." action={<motion.button whileTap={tap} className="btn primary" onClick={openCreate}><Plus size={15} aria-hidden="true" /> Create study set</motion.button>} />
      {filteredSets.length ? (
        <motion.div className="set-grid" variants={listV} initial="initial" animate="animate">
          {filteredSets.map((s) => <SetCard key={s.id} set={s} onOpen={() => { selectSet(s.id); go("reviewer"); }} onDelete={() => deleteSet(s.id)} />)}
        </motion.div>
      ) : (
        <EmptyState icon={BookOpen} title={query ? "No matching study sets" : "Nothing in your library yet"} text={query ? "Try another search term." : "Start with a document, class notes, or a topic you want to master."} action={<button className="btn primary" onClick={openCreate}><Plus size={15} aria-hidden="true" /> Create a study set</button>} />
      )}
    </>
  );
}
