import { useState, type FormEvent } from "react";
import type { Effort, TaskInput } from "../lib/api";

export const CATEGORIES = ["Life Admin", "Health", "Work/Study", "Chores", "Personal"];

export const EFFORT_OPTIONS: { value: Effort; label: string }[] = [
  { value: "quick", label: "Quick win" },
  { value: "medium", label: "Medium" },
  { value: "big", label: "Big task" },
];

interface TaskFormProps {
  onAdd: (input: TaskInput) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [effort, setEffort] = useState<Effort>("quick");
  const [recurring, setRecurring] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), category, effort, recurring });
    setTitle("");
    setEffort("quick");
    setRecurring(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 select-none">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="rounded border-slate-300 dark:border-slate-600"
        />
        Repeats daily
      </label>
    </form>
  );
}
