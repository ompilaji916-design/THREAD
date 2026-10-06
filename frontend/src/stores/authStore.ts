import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  college?: string;
  branch?: string;
  year?: string;
  bio?: string;
  skills?: string[];
  avatar?: string;
  xp: number;
  loginStreak: number;
  badges?: string[];
  emergencyContact?: { name: string; phone: string };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const storedToken = localStorage.getItem("thread_token");
const storedUser = localStorage.getItem("thread_user");

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
  login: (token, user) => {
    localStorage.setItem("thread_token", token);
    localStorage.setItem("thread_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("thread_token");
    localStorage.removeItem("thread_user");
    set({ token: null, user: null, isAuthenticated: false });
  },
  updateUser: (partial) => {
    const merged = { ...get().user, ...partial } as User;
    localStorage.setItem("thread_user", JSON.stringify(merged));
    set({ user: merged });
  },
}));
