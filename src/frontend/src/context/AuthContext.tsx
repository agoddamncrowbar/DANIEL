import { createContext } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile_picture?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  login: async () => {},
  logout: () => {},
});
