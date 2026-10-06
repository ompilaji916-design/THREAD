import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Bookmark, ShoppingBag } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuthStore } from "../../stores/authStore";

interface Item { _id: string; title: string; price: number; category: string; condition: string; isSold: boolean; userId: { _id: string; name: string }; savedBy: string[]; }

export default function Marketplace() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", price: "", category: "Other", condition: "Good", description: "" });

  const { data } = useQuery<Item[]>({ queryKey: ["marketplace"], queryFn: async () => (await api.get("/campus/marketplace")).data.data });

  const list = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) return toast.error("Title and price required");
    try {
      await api.post("/campus/marketplace", { ...form, price: Number(form.price) });
      toast.success("Listed!");
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Could not list"); }
  };

  const save = async (id: string) => { await api.post(`/campus/marketplace/${id}/save`); qc.invalidateQueries({ queryKey: ["marketplace"] }); };
  const markSold = async (id: string) => { await api.patch(`/campus/marketplace/${id}/sold`); toast.success("Marked sold! +15 XP"); qc.invalidateQueries({ queryKey: ["marketplace"] }); };

  return (
    <div>
      <PageHeader title="Marketplace" subtitle="Buy and sell with fellow students." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />List Item</Button>} />
      {!data?.length ? (
        <EmptyState icon={<ShoppingBag size={48} />} title="No listings yet" message="List something to get started." ctaLabel="List Item" onCta={() => setModalOpen(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <Card key={item._id} className={item.isSold ? "opacity-50" : ""}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-textmain">{item.title}</h4>
                <button onClick={() => save(item._id)}><Bookmark size={16} className="text-textmuted" /></button>
              </div>
              <p className="text-accent font-extrabold">₹{item.price}</p>
              <div className="flex gap-2 mt-2">
                <Badge tone="neutral">{item.category}</Badge>
                <Badge tone="neutral">{item.condition}</Badge>
                {item.isSold && <Badge tone="danger">Sold</Badge>}
              </div>
              <p className="text-xs text-textmuted mt-2">by {item.userId?.name}</p>
              {!item.isSold && item.userId?._id === user?._id && (
                <Button variant="secondary" className="w-full mt-3" onClick={() => markSold(item._id)}>Mark Sold</Button>
              )}
            </Card>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="List an Item">
        <form onSubmit={list} className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Books</option><option>Electronics</option><option>Furniture</option><option>Clothing</option><option>Other</option>
            </Select>
            <Select label="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
            </Select>
          </div>
          <Button type="submit" className="w-full">List Item</Button>
        </form>
      </Modal>
    </div>
  );
}
