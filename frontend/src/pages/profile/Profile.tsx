import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LogOut, Award, MailWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useAuthStore } from "../../stores/authStore";

interface BadgeDetail { key: string; name: string; description: string; earned: boolean; }

export default function Profile() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { data } = useQuery<{ user: any; badgeDetails: BadgeDetail[] }>({ queryKey: ["profile"], queryFn: async () => (await api.get("/profile")).data.data });
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  useEffect(() => { if (data?.user) { setBio(data.user.bio || ""); setSkills((data.user.skills || []).join(", ")); } }, [data]);

  const save = async () => {
    await api.put("/profile", { bio, skills: skills.split(",").map((s) => s.trim()).filter(Boolean) });
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const doLogout = () => { logout(); navigate("/login"); };

  const resendVerification = async () => {
    try {
      const res = await api.post("/auth/resend-verification");
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not resend");
    }
  };

  return (
    <div>
      <PageHeader title="Profile" />
      {data?.user && !data.user.emailVerified && (
        <div className="mb-5 flex items-center justify-between gap-3 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-textsub">
            <MailWarning size={18} className="text-warning shrink-0" />
            <span>Your email isn't verified yet — check your inbox.</span>
          </div>
          <Button variant="secondary" onClick={resendVerification}>Resend email</Button>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold">
              {data?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-textmain text-lg">{data?.user?.name}</h3>
              <p className="text-sm text-textmuted">{data?.user?.college} · {data?.user?.branch}</p>
              <p className="text-sm text-accent font-bold mt-0.5">{data?.user?.xp} XP</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-textsub mb-1">Bio</label>
              <textarea className="w-full min-h-[70px] px-3 py-2 rounded-lg border border-borderc" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <Input label="Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
            <Button onClick={save}>Save Profile</Button>
          </div>
          <Button variant="ghost" className="mt-4 text-danger" onClick={doLogout}><LogOut size={16} className="inline mr-1" />Log Out</Button>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3"><Award size={18} className="text-accent" /><h3 className="font-bold text-textmain">Badges</h3></div>
          <div className="grid grid-cols-2 gap-2">
            {data?.badgeDetails?.map((b) => (
              <div key={b.key} className={`p-3 rounded-lg border text-center ${b.earned ? "border-accent bg-indigo-50" : "border-borderc opacity-50"}`}>
                <p className="text-sm font-semibold text-textmain">{b.name}</p>
                <p className="text-xs text-textmuted mt-0.5">{b.description}</p>
                {b.earned && <Badge tone="success">Earned</Badge>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
