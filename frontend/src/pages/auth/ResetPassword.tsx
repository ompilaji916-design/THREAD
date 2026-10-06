import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      toast.success(res.data.message || "Password reset!");
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.error || "This link may have expired. Request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-borderc rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h1 className="text-2xl font-extrabold text-accent mb-1">Set a new password</h1>
        <p className="text-textmuted text-sm mb-6">At least 8 characters, with a letter and a number.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="New password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirm new password" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Reset password</Button>
        </form>
        <p className="text-sm text-textmuted mt-4 text-center">
          <Link to="/login" className="text-accent font-semibold">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
