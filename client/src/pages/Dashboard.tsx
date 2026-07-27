import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../lib/AuthContext";
import { getPet, getTasks, createTask, completeTask, deleteTask, renamePet } from "../lib/api";
import type { PetState, Task, Effort } from "../lib/api";
import { PetWidget } from "../components/PetWidget";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

export function Dashboard() {
  const { token, user, signOut } = useAuth();
  const [pet, setPet] = useState<PetState | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    const [petData, taskData] = await Promise.all([getPet(token), getTasks(token)]);
    setPet(petData);
    setTasks(taskData);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(() => setCelebration(null), 2200);
    return () => clearTimeout(timeout);
  }, [celebration]);

  if (!token) return null;

  async function handleAdd(input: { title: string; category: string; effort: Effort }) {
    const task = await createTask(token!, input);
    setTasks((prev) => [task, ...prev]);
  }

  async function handleComplete(id: string) {
    const { task, pet: updatedPet } = await completeTask(token!, id);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    setPet(updatedPet);
    setCelebration("Nice work! Your pet is thriving 🎉");
  }

  async function handleDelete(id: string) {
    await deleteTask(token!, id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleRename(name: string) {
    const updated = await renamePet(token!, name);
    setPet(updated);
  }

  const incomplete = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Your day, one small win at a time</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <button onClick={signOut} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Log out
          </button>
        </header>

        {celebration && (
          <div className="mb-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-2 text-center">
            {celebration}
          </div>
        )}

        {loading || !pet ? (
          <p className="text-center text-slate-400 py-12">Loading…</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <PetWidget pet={pet} onRename={handleRename} />

            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-sm p-5">
              <TaskForm onAdd={handleAdd} />

              <div className="mt-4">
                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">To do ({incomplete.length})</h2>
                <TaskList tasks={incomplete} onComplete={handleComplete} onDelete={handleDelete} />
              </div>

              {completed.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Done today ({completed.length})
                  </h2>
                  <TaskList tasks={completed} onComplete={handleComplete} onDelete={handleDelete} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
