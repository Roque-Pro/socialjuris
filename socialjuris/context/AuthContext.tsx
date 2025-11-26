"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: "cliente" | "advogado" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("socialjuris_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("socialjuris_user", JSON.stringify(userData));
    if (userData.tipo === "advogado") {
      router.push("/dashboard/advogado");
    } else if (userData.tipo === "cliente") {
      router.push("/dashboard/cliente");
    } else {
      router.push("/dashboard/admin");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("socialjuris_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
