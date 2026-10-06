import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function Signup() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", password: "", college: "", branch: "", year: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(res.data.message || "Welcome to THREAD!");
      navigate("/app");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm bg-surface border border-borderc rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h1 className="text-2xl font-extrabold text-accent mb-1">Join THREAD</h1>
        <p className="text-textmuted text-sm mb-6">Stop Struggling. Start THREADing.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input label="Full Name" required value={form.name} onChange={update("name")} />
          <Input label="Email" type="email" required value={form.email} onChange={update("email")} />
          <Input label="Password" type="password" required minLength={8} value={form.password} onChange={update("password")} placeholder="At least 8 characters, with a letter and a number" />
          <Input label="College" value={form.college} onChange={update("college")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Branch" value={form.branch} onChange={update("branch")} />
            <Input label="Year" value={form.year} onChange={update("year")} />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Create Account (+50 XP)</Button>
        </form>
        <p className="text-sm text-textmuted mt-4 text-center">
          Already have an account? <Link to="/login" className="text-accent font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
