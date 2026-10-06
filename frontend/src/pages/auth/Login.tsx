import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(res.data.message || "Welcome back!");
      navigate("/app");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-borderc rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h1 className="text-2xl font-extrabold text-accent mb-1">THREAD</h1>
        <p className="text-textmuted text-sm mb-6">Log in to continue your streak.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <div className="text-right">
            <Link to="/forgot-password" className="text-accent text-sm font-medium">Forgot password?</Link>
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Log In</Button>
        </form>
        <p className="text-sm text-textmuted mt-4 text-center">
          New to THREAD? <Link to="/signup" className="text-accent font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
