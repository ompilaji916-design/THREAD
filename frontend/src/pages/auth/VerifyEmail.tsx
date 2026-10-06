import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    api.get(`/auth/verify-email/${token}`)
      .then((res) => { setStatus("success"); setMessage(res.data.message); })
      .catch((err) => { setStatus("error"); setMessage(err?.response?.data?.error || "This link is invalid or has expired."); });
  }, [token]);

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-borderc rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 text-center">
        <h1 className="text-2xl font-extrabold text-accent mb-4">THREAD</h1>
        {status === "loading" && <p className="text-textsub">Verifying your email...</p>}
        {status === "success" && (
          <>
            <p className="text-success font-semibold mb-4">{message}</p>
            <Link to="/app"><Button className="w-full">Go to dashboard</Button></Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-danger font-semibold mb-4">{message}</p>
            <Link to="/app/profile"><Button variant="secondary" className="w-full">Go to profile to resend</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}
