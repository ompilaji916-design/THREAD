import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, PackageSearch } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";

interface Item { _id: string; type: string; itemName: string; description: string; category: string; location: string; status: string; }

export default function LostFound() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"lost" | "found">("lost");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: "lost", itemName: "", description: "", category: "Other", location: "" });

  const { data } = useQuery<Item[]>({ queryKey: ["lost-found", tab], queryFn: async () => (await api.get(`/campus/lost-found?type=${tab}`)).data.data });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName) return toast.error("Item name required");
    try {
      const res = await api.post("/campus/lost-found", form);
      toast.success(res.data.message);
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["lost-found"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Could not submit"); }
  };

  return (
    <div>
      <PageHeader title="Lost & Found" subtitle="Report or find lost items — auto-matched by category and name." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />Report Item</Button>} />
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("lost")} className={`px-3 py-1.5 rounded-full text-sm font-medium ${tab === "lost" ? "bg-accent text-white" : "bg-white border border-borderc"}`}>Lost</button>
        <button onClick={() => setTab("found")} className={`px-3 py-1.5 rounded-full text-sm font-medium ${tab === "found" ? "bg-accent text-white" : "bg-white border border-borderc"}`}>Found</button>
      </div>
      {!data?.length ? (
        <EmptyState icon={<PackageSearch size={48} />} title={`No ${tab} items`} message="Report one to get started." ctaLabel="Report Item" onCta={() => setModalOpen(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <Card key={item._id}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-textmain">{item.itemName}</h4>
                {item.status === "matched" && <Badge tone="accent">Possible Match</Badge>}
              </div>
              <p className="text-sm text-textmuted">{item.description}</p>
              <p className="text-xs text-textmuted mt-2">📍 {item.location}</p>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Report Item">
        <form onSubmit={submit} className="space-y-3">
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="lost">I lost something</option><option value="found">I found something</option>
          </Select>
          <Input label="Item Name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <textarea className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-borderc" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" className="w-full">Submit Report</Button>
        </form>
      </Modal>
    </div>
  );
}
