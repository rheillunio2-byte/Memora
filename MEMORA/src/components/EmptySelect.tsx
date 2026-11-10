import { BookOpen, Plus } from "lucide-react";
import { EmptyState } from "./ui";

export function EmptySelect({ onCreate }: { onCreate: () => void }) {
  return <EmptyState icon={BookOpen} title="Select a study set first" text="Choose a study set from your library or create a new one to use this tool." action={<button className="btn primary" onClick={onCreate}><Plus size={15} aria-hidden="true" /> Create a study set</button>} />;
}
