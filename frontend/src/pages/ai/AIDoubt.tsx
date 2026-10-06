import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HelpCircle } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";

interface Doubt {
  _id: string; question: string; language: string; simpleExplanation: string; realWorldAnalogy: string;
  codeExample: string; stepByStep: string; rememberThis: string; commonMistakes: string;
}

export default function AIDoubt() {
  const qc = useQueryClient();
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("C");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Doubt | null>(null);

  const { data: history } = useQuery<Doubt[]>({ queryKey: ["doubt-history"], queryFn: async () => (await api.get("/ai/doubt/history")).data.data });

  const ask = async () => {
    if (!question.trim()) return toast.error("Type your doubt first");
    setLoading(true);
    try {
      const res = await api.post("/ai/doubt", { question, language });
      setResult(res.data.data);
      qc.invalidateQueries({ queryKey: ["doubt-history"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not get an answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="AI Doubt Solver" subtitle="Ask like a junior asking a senior — get a senior-level answer." />
      <Card className="mb-5">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <textarea className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-borderc" placeholder="What's confusing you?" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="w-32">
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>C</option><option>Python</option><option>Java</option><option>HTML/CSS</option>
            </Select>
          </div>
        </div>
        <Button loading={loading} onClick={ask}>Ask</Button>
      </Card>

      {result && (
        <Card className="mb-5 space-y-3">
          <div><p className="text-xs font-bold text-textmuted uppercase mb-1">Simple Explanation</p><p className="text-sm text-textsub">{result.simpleExplanation}</p></div>
          <div><p className="text-xs font-bold text-textmuted uppercase mb-1">Real-World Analogy</p><p className="text-sm text-textsub">{result.realWorldAnalogy}</p></div>
          <div><p className="text-xs font-bold text-textmuted uppercase mb-1">Code Example</p><pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">{result.codeExample}</pre></div>
          <div><p className="text-xs font-bold text-textmuted uppercase mb-1">Step by Step</p><p className="text-sm text-textsub whitespace-pre-wrap">{result.stepByStep}</p></div>
          <div><p className="text-xs font-bold text-textmuted uppercase mb-1">Remember This</p><p className="text-sm text-textsub">{result.rememberThis}</p></div>
          <div><p className="text-xs font-bold text-textmuted uppercase mb-1">Common Mistakes</p><p className="text-sm text-textsub">{result.commonMistakes}</p></div>
        </Card>
      )}

      <h3 className="font-bold text-textmain mb-3">Recent Doubts (last 10)</h3>
      {!history?.length ? (
        <EmptyState icon={<HelpCircle size={40} />} title="No doubts yet" message="Ask your first question above." />
      ) : (
        <div className="space-y-2">
          {history.map((h) => <Card key={h._id} className="!p-3"><p className="text-sm font-medium text-textmain">{h.question}</p></Card>)}
        </div>
      )}
    </div>
  );
}
