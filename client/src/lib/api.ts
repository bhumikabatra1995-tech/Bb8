const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? `Request failed with status ${res.status}`);
  }
  return body as T;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export function signup(email: string, password: string) {
  return request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export type Effort = "quick" | "medium" | "big";

export interface Task {
  id: string;
  title: string;
  category: string;
  effort: Effort;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface PetState {
  id: string;
  name: string;
  xp: number;
  level: number;
  stage: "egg" | "hatchling" | "kid" | "teen" | "adult";
  xpIntoLevel: number;
  xpForNextLevel: number;
  happiness: number;
  streak: number;
  lastCompletedDate: string | null;
}

export function getTasks(token: string) {
  return request<Task[]>("/tasks", {}, token);
}

export function createTask(token: string, input: { title: string; category: string; effort: Effort }) {
  return request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }, token);
}

export function completeTask(token: string, id: string) {
  return request<{ task: Task; pet: PetState }>(`/tasks/${id}/complete`, { method: "POST" }, token);
}

export function deleteTask(token: string, id: string) {
  return request<void>(`/tasks/${id}`, { method: "DELETE" }, token);
}

export function getPet(token: string) {
  return request<PetState>("/pet", {}, token);
}

export function renamePet(token: string, name: string) {
  return request<PetState>("/pet/name", { method: "PATCH", body: JSON.stringify({ name }) }, token);
}
