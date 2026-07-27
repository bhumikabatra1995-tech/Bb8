import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../lib/AuthContext";
import { getPet, getTasks, createTask, completeTask, deleteTask, renamePet, updateTask, ApiError } from "../lib/api";
import type { PetState, Task, TaskInput } from "../lib/api";
import { PetWidget } from "../components/PetWidget";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

export function Dashboard() {
  const { token, user, signOut } = useAuth();
  const [pet, setPet] = useState<PetState | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [petData, taskData] = await Promise.all([getPet(token), getTasks(token)]);
      setPet(petData);
      setTasks(taskData);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(() => setCelebration(null), 2200);
    return () => clearTimeout(timeout);
  }, [celebration]);

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timeout);
  }, [error]);

  if (!token) return null;

  async function handleAdd(input: TaskInput) {
    try {
      const task = await createTask(token!, input);
      setTasks((prev) => [task, ...prev]);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleComplete(id: string) {
    try {
      const { task, pet: updatedPet } = await completeTask(token!, id);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      setPet(updatedPet);
      setCelebration("Nice work! Your pet is thriving 🎉");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTask(token!, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleEdit(id: string, input: Partial<TaskInput>) {
    try {
      const task = await updateTask(token!, id, input);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleRename(name: string) {
    try {
      const updated = await renamePet(token!, name);
      setPet(updated);
    } catch (err) {
      setError(errorMessage(err));
    }
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
        {error && (
          <div className="mb-4 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-sm px-4 py-2 text-center">
            {error}
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
                <TaskList tasks={incomplete} onComplete={handleComplete} onDelete={handleDelete} onEdit={handleEdit} />
              </div>

              {completed.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Done today ({completed.length})
                  </h2>
                  <TaskList tasks={completed} onComplete={handleComplete} onDelete={handleDelete} onEdit={handleEdit} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
