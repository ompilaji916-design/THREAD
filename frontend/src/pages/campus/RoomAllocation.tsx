import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";

interface Allocation {
  preferences: { floor: string; acType: string; sleepSchedule: string; cleanliness: string };
  allocatedRoom: string | null; status: string;
}

export default function RoomAllocation() {
  const qc = useQueryClient();
  const { data } = useQuery<Allocation>({ queryKey: ["room-allocation"], queryFn: async () => (await api.get("/campus/room-allocation/me")).data.data });
  const [prefs, setPrefs] = useState({ floor: "Any", acType: "Any", sleepSchedule: "Early", cleanliness: "Average" });

  useEffect(() => { if (data?.preferences) setPrefs(data.preferences); }, [data]);

  const save = async () => {
    await api.put("/campus/room-allocation/preferences", prefs);
    toast.success("Preferences saved");
    qc.invalidateQueries({ queryKey: ["room-allocation"] });
  };

  return (
    <div>
      <PageHeader title="Room Allocation" subtitle="Set your preferences for compatible roommate matching." />
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge tone={data?.status === "Allocated" ? "success" : "neutral"}>{data?.status || "Waitlisted"}</Badge>
          {data?.allocatedRoom && <span className="font-bold text-textmain">Room {data.allocatedRoom}</span>}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Preferred Floor" value={prefs.floor} onChange={(e) => setPrefs({ ...prefs, floor: e.target.value })}>
            <option>Any</option><option>Ground</option><option>1st</option><option>2nd</option><option>3rd+</option>
          </Select>
          <Select label="AC Type" value={prefs.acType} onChange={(e) => setPrefs({ ...prefs, acType: e.target.value })}>
            <option>Any</option><option>AC</option><option>Non-AC</option>
          </Select>
          <Select label="Sleep Schedule" value={prefs.sleepSchedule} onChange={(e) => setPrefs({ ...prefs, sleepSchedule: e.target.value })}>
            <option>Early</option><option>Late</option>
          </Select>
          <Select label="Cleanliness" value={prefs.cleanliness} onChange={(e) => setPrefs({ ...prefs, cleanliness: e.target.value })}>
            <option>Very Tidy</option><option>Average</option><option>Relaxed</option>
          </Select>
        </div>
        <Button className="mt-4" onClick={save}>Save Preferences</Button>
      </Card>
    </div>
  );
}
