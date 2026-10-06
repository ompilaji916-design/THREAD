import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Copy } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";

interface SavedEmail { _id: string; templateType: string; tone: string; subject: string; body: string; aiGenerated: boolean; }

const TEMPLATES = ["Permission", "Apology", "Extension Request", "Recommendation Letter", "Complaint", "Thank You"];

export default function AIEmail() {
  const qc = useQueryClient();
  const [templateType, setTemplateType] = useState("Permission");
  const [tone, setTone] = useState("Formal");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SavedEmail | null>(null);

  const { data: history } = useQuery<SavedEmail[]>({ queryKey: ["saved-emails"], queryFn: async () => (await api.get("/ai/email")).data.data });

  const generate = async () => {
    if (!prompt.trim()) return toast.error("Describe your situation first");
    setLoading(true);
    try {
      const res = await api.post("/ai/email", { templateType, tone, prompt });
      setResult(res.data.data);
      qc.invalidateQueries({ queryKey: ["saved-emails"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not generate email");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div>
      <PageHeader title="AI Email Assistant" subtitle="Draft the perfect email to faculty in seconds." />
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Select label="Template" value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
              {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Tone" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Formal</option><option>Short</option><option>Urgent</option>
            </Select>
          </div>
          <label className="block text-sm font-medium text-textsub mb-1">Describe your situation</label>
          <textarea className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-borderc mb-3" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. I need 2 days leave for a family function" />
          <Button className="w-full" loading={loading} onClick={generate}>Generate Email</Button>

          {result && (
            <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-borderc">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-textmain">{result.subject}</p>
                {!result.aiGenerated && <Badge tone="neutral">Template Mode</Badge>}
              </div>
              <p className="text-sm text-textsub whitespace-pre-wrap">{result.body}</p>
              <Button variant="secondary" className="mt-3" onClick={() => copy(`${result.subject}\n\n${result.body}`)}>
                <Copy size={14} className="inline mr-1" /> Copy
              </Button>
            </div>
          )}
        </Card>
        <Card>
          <h3 className="font-bold text-textmain mb-3">Recent Emails</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {history?.length ? history.map((h) => (
              <div key={h._id} className="p-3 bg-gray-50 rounded-lg border border-borderc">
                <p className="text-sm font-semibold text-textmain">{h.subject}</p>
                <p className="text-xs text-textmuted">{h.templateType} · {h.tone}</p>
              </div>
            )) : <p className="text-sm text-textmuted">No emails generated yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
