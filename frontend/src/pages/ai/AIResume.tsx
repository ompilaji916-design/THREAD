import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";

interface ResumePkg {
  _id: string; projectName: string; resumeBullets: string[]; linkedinPost: string;
  interviewAnswer: string; readme: string; coverLetter: string; atsScore: number; aiGenerated: boolean;
}

export default function AIResume() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ projectName: "", projectDescription: "", techStack: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumePkg | null>(null);
  const [tab, setTab] = useState<"bullets" | "linkedin" | "interview" | "readme" | "cover">("bullets");

  const { data: history } = useQuery<ResumePkg[]>({ queryKey: ["resumes"], queryFn: async () => (await api.get("/ai/resume")).data.data });

  const generate = async () => {
    if (!form.projectName || !form.projectDescription) return toast.error("Project name and description required");
    setLoading(true);
    try {
      const res = await api.post("/ai/resume", form);
      setResult(res.data.data);
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div>
      <PageHeader title="AI Resume Builder" subtitle="Turn a project into resume bullets, a LinkedIn post, and more. +30 XP" />
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <div className="space-y-3">
            <Input label="Project Name" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-textsub mb-1">Project Description</label>
              <textarea className="w-full min-h-[90px] px-3 py-2 rounded-lg border border-borderc" value={form.projectDescription} onChange={(e) => setForm({ ...form, projectDescription: e.target.value })} />
            </div>
            <Input label="Tech Stack" placeholder="React, Node.js, MongoDB" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
            <Input label="Your Role" placeholder="Full-stack developer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <Button className="w-full" loading={loading} onClick={generate}>Generate Package</Button>
          </div>
          {history?.length ? (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-textsub mb-2">History</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((h) => <div key={h._id} className="text-sm text-textmuted p-2 bg-gray-50 rounded-lg">{h.projectName} — ATS {h.atsScore}</div>)}
              </div>
            </div>
          ) : null}
        </Card>
        {result && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1 flex-wrap">
                {(["bullets", "linkedin", "interview", "readme", "cover"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${tab === t ? "bg-accent text-white" : "bg-gray-100 text-textsub"}`}>{t}</button>
                ))}
              </div>
              <Badge tone={result.atsScore >= 80 ? "success" : "warning"}>ATS {result.atsScore}</Badge>
            </div>
            <div className="text-sm text-textsub whitespace-pre-wrap max-h-96 overflow-y-auto">
              {tab === "bullets" && result.resumeBullets.map((b, i) => <p key={i} className="mb-2">• {b}</p>)}
              {tab === "linkedin" && result.linkedinPost}
              {tab === "interview" && result.interviewAnswer}
              {tab === "readme" && result.readme}
              {tab === "cover" && result.coverLetter}
            </div>
            <Button variant="secondary" className="mt-3" onClick={() => copy(
              tab === "bullets" ? result.resumeBullets.join("\n") :
              tab === "linkedin" ? result.linkedinPost :
              tab === "interview" ? result.interviewAnswer :
              tab === "readme" ? result.readme : result.coverLetter
            )}>Copy</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
