import type { Task } from "../lib/api";

const EFFORT_BADGE: Record<Task["effort"], string> = {
  quick: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  medium: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  big: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
};

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
        No tasks yet — add one small thing above to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
      {tasks.map((task) => (
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
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="text-slate-400 hover:text-rose-500 text-sm px-1"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
