import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'fb-shop-auth',
    }
  )
);
