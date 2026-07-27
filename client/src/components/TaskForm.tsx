import { useState, type FormEvent } from "react";
import type { Effort } from "../lib/api";

const CATEGORIES = ["Life Admin", "Health", "Work/Study", "Chores", "Personal"];

const EFFORT_OPTIONS: { value: Effort; label: string }[] = [
  { value: "quick", label: "Quick win" },
  { value: "medium", label: "Medium" },
  { value: "big", label: "Big task" },
];

interface TaskFormProps {
  onAdd: (input: { title: string; category: string; effort: Effort }) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [effort, setEffort] = useState<Effort>("quick");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), category, effort });
    setTitle("");
    setEffort("quick");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's one small thing you can do?"
        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={effort}
        onChange={(e) => setEffort(e.target.value as Effort)}
        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm"
      >
        {EFFORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm font-medium"
      >
        Add task
      </button>
    </form>
  );
}
