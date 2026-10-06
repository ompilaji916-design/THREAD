import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-borderc rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h1 className="text-2xl font-extrabold text-accent mb-1">Reset your password</h1>
        {sent ? (
          <>
            <p className="text-textsub text-sm mt-4">
              If an account exists with that email, a reset link is on its way. Check your inbox
              (and spam folder) — the link expires in 30 minutes.
            </p>
            <Link to="/login" className="text-accent font-semibold text-sm mt-4 inline-block">Back to log in</Link>
          </>
        ) : (
          <>
            <p className="text-textmuted text-sm mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
              {error && <p className="text-danger text-sm">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
            </form>
            <p className="text-sm text-textmuted mt-4 text-center">
              <Link to="/login" className="text-accent font-semibold">Back to log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
