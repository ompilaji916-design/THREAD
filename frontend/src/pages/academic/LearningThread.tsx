import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, ThumbsUp, Bookmark, BookOpen } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";

interface Post {
  _id: string; title: string; language: string; difficulty: string; content: string;
  upvotes: string[]; bookmarkedBy: string[]; userId: { name: string; branch?: string };
}

export default function LearningThread() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", language: "", difficulty: "Beginner", content: "", mistakesMade: "", resourcesUsed: "", timeTaken: "" });

  const { data, isLoading } = useQuery<Post[]>({ queryKey: ["learning-thread"], queryFn: async () => (await api.get("/learning-thread")).data.data });

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error("Title and content required");
    try {
      const res = await api.post("/learning-thread", form);
      toast.success(res.data.message);
      setModalOpen(false);
      setForm({ title: "", language: "", difficulty: "Beginner", content: "", mistakesMade: "", resourcesUsed: "", timeTaken: "" });
      qc.invalidateQueries({ queryKey: ["learning-thread"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not publish");
    }
  };

  const upvote = async (id: string) => {
    await api.post(`/learning-thread/${id}/upvote`);
    qc.invalidateQueries({ queryKey: ["learning-thread"] });
  };
  const bookmark = async (id: string) => {
    await api.post(`/learning-thread/${id}/bookmark`);
    qc.invalidateQueries({ queryKey: ["learning-thread"] });
  };

  return (
    <div>
      <PageHeader title="Learning THREAD" subtitle="Share what you learned. Earn XP. Help someone else skip the struggle." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />Publish (+20 XP)</Button>} />

      {isLoading ? null : !data?.length ? (
        <EmptyState icon={<BookOpen size={48} />} title="No posts yet" message="Be the first to share a learning experience." ctaLabel="Publish" onCta={() => setModalOpen(true)} />
      ) : (
        <div className="space-y-4">
          {data.map((p) => (
            <Card key={p._id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge tone="accent">{p.language || "General"}</Badge>
                  <Badge tone="neutral">{p.difficulty}</Badge>
                </div>
                <span className="text-xs text-textmuted">{p.userId?.name}</span>
              </div>
              <h4 className="font-bold text-textmain mb-1">{p.title}</h4>
              <p className="text-sm text-textsub whitespace-pre-wrap line-clamp-4">{p.content}</p>
              <div className="flex items-center gap-4 mt-3">
                <button onClick={() => upvote(p._id)} className="flex items-center gap-1 text-sm text-textmuted hover:text-accent">
                  <ThumbsUp size={16} /> {p.upvotes.length}
                </button>
                <button onClick={() => bookmark(p._id)} className="flex items-center gap-1 text-sm text-textmuted hover:text-accent">
                  <Bookmark size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Publish Learning Post">
        <form onSubmit={publish} className="space-y-3">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="C, Python..." />
            <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textsub mb-1">What did you learn?</label>
            <textarea className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-borderc" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <Button type="submit" className="w-full">Publish (+20 XP)</Button>
        </form>
      </Modal>
    </div>
  );
}
