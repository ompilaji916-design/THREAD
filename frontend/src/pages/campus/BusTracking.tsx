import { useQuery } from "@tanstack/react-query";
import { Bus } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";

interface Route { _id: string; routeName: string; stops: { name: string; etaMinutes: number }[]; seatOccupancy: string; delayMinutes: number; }

export default function BusTracking() {
  const { data } = useQuery<Route[]>({
    queryKey: ["bus-routes"],
    queryFn: async () => (await api.get("/campus/bus-routes")).data.data,
    refetchInterval: 15000,
  });

  const occupancyTone: Record<string, "success" | "warning" | "danger"> = { Low: "success", Medium: "warning", Full: "danger" };

  return (
    <div>
      <PageHeader title="Bus Tracking" subtitle="Live shuttle location, occupancy, and delays." />
      {!data?.length ? (
        <EmptyState icon={<Bus size={48} />} title="No routes configured" message="Bus routes will appear here once added by campus admin." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.map((r) => (
            <Card key={r._id}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-textmain">{r.routeName}</h4>
                <Badge tone={occupancyTone[r.seatOccupancy]}>{r.seatOccupancy} occupancy</Badge>
              </div>
              {r.delayMinutes > 0 && <p className="text-sm text-danger mb-2">Delayed by {r.delayMinutes} min</p>}
              <div className="space-y-1">
                {r.stops.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm text-textsub">
                    <span>{s.name}</span><span className="text-textmuted">ETA {s.etaMinutes} min</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
