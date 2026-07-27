import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup, ApiError } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { AuthLayout, AuthFields } from "./Login";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await signup(email, password);
      signIn(token, user);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Hatch your companion">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFields email={email} setEmail={setEmail} password={password} setPassword={setPassword} />
        <p className="text-xs text-slate-400">At least 8 characters.</p>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white py-2 font-medium"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-500 font-medium">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
