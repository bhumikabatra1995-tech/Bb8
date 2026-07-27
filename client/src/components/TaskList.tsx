import { useState } from "react";
import type { Task, TaskInput } from "../lib/api";
import { CATEGORIES, EFFORT_OPTIONS } from "./TaskForm";

const EFFORT_BADGE: Record<Task["effort"], string> = {
  quick: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  medium: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  big: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, input: Partial<TaskInput>) => void;
}

export function TaskList({ tasks, onComplete, onDelete, onEdit }: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
        No tasks yet — add one small thing above to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
      {tasks.map((task) =>
        editingId === task.id ? (
          <TaskEditRow
            key={task.id}
            task={task}
            onCancel={() => setEditingId(null)}
            onSave={(input) => {
              onEdit(task.id, input);
              setEditingId(null);
            }}
          />
        ) : (
          <li key={task.id} className="flex items-center gap-3 py-3">
            <button
              onClick={() => onComplete(task.id)}
              disabled={task.completed}
              aria-label={task.completed ? "Completed" : "Mark complete"}
              className={`h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                task.completed
                  ? "bg-emerald-400 border-emerald-400 text-white"
                  : "border-slate-300 dark:border-slate-600 hover:border-indigo-400"
              }`}
            >
              {task.completed && "✓"}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm truncate ${
                  task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"
                }`}
              >
                {task.recurring && <span title="Repeats daily">🔁 </span>}
                {task.title}
              </p>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                  {task.category}
                </span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded ${EFFORT_BADGE[task.effort]}`}>
                  {task.effort}
                </span>
              </div>
            </div>

            <button
              onClick={() => setEditingId(task.id)}
              aria-label="Edit task"
              className="text-slate-400 hover:text-indigo-500 text-sm px-1"
            >
              ✎
            </button>
            <button
              onClick={() => onDelete(task.id)}
              aria-label="Delete task"
              className="text-slate-400 hover:text-rose-500 text-sm px-1"
            >
              ✕
            </button>
          </li>
        )
      )}
    </ul>
  );
}

function TaskEditRow({
  task,
  onSave,
  onCancel,
}: {
  task: Task;
  onSave: (input: Partial<TaskInput>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [effort, setEffort] = useState(task.effort);
  const [recurring, setRecurring] = useState(task.recurring);

  return (
    <li className="py-3">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onSave({ title: title.trim(), category, effort, recurring });
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={effort}
            onChange={(e) => setEffort(e.target.value as Task["effort"])}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm"
          >
            {EFFORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            Repeats daily
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="text-xs text-slate-500 px-2 py-1">
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </li>
  );
}
