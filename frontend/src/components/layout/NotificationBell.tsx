import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiResponse } from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuthStore } from "../../stores/authStore";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get<ApiResponse<{ items: NotificationItem[]; unreadCount: number }>>("/notifications")).data.data,
  });

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.emit("identify", user._id);
    const handler = () => qc.invalidateQueries({ queryKey: ["notifications"] });
    socket.on("notification:new", handler);
    return () => { socket.off("notification:new", handler); };
  }, [user, qc]);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100"
      >
        <Bell size={20} className="text-textsub" />
        {!!data?.unreadCount && (
          <span className="absolute top-1.5 right-1.5 bg-danger text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-borderc rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-borderc">
            <span className="font-semibold text-sm">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-accent font-medium">Mark all read</button>
          </div>
          {!data?.items?.length ? (
            <p className="text-sm text-textmuted p-4">No notifications yet.</p>
          ) : (
            data.items.map((n) => (
              <div key={n._id} className={`px-4 py-3 border-b border-borderc last:border-0 ${!n.isRead ? "bg-indigo-50/40" : ""}`}>
                <p className="text-sm font-medium text-textmain">{n.title}</p>
                <p className="text-xs text-textmuted mt-0.5">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
