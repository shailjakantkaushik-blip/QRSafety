"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export const SessionContext = createContext<{ user: any | null }>({ user: null });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth.user || null);
    }
    fetchUser();
  }, []);

  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
