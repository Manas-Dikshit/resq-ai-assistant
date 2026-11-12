import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type Role = "admin" | "user" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInAdmin: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(session ? "user" : null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(session ? "user" : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const ADMIN_EMAIL = "ADMIN";
  const ADMIN_PASSWORD = "123456";
  const USER_EMAIL = "admin@gmail.com";
  const USER_PASSWORD = "123456";

  const mockUser = {
    id: "admin-local",
    email: "ADMIN",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    confirmation_token: null,
    confirmation_sent_at: null,
    email_change_token_current: null,
    email_change_token_new: null,
    email_change_confirm_status: 0,
    email_change: null,
    invited_at: null,
    recovery_token: null,
    reauthentication_token: null,
    phone: "",
    phone_change: "",
    phone_change_token: null,
    phone_change_sent_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
    role: "authenticated",
    identities: [],
    session_id: "",
    last_sign_in_at: new Date().toISOString(),
  } as unknown as User;

  const mockSession = {
    access_token: "admin-local-token",
    refresh_token: "admin-local-refresh",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: mockUser,
  } as unknown as Session;

  const userMockUser = {
    id: "user-local",
    email: "admin@gmail.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    confirmation_token: null,
    confirmation_sent_at: null,
    email_change_token_current: null,
    email_change_token_new: null,
    email_change_confirm_status: 0,
    email_change: null,
    invited_at: null,
    recovery_token: null,
    reauthentication_token: null,
    phone: "",
    phone_change: "",
    phone_change_token: null,
    phone_change_sent_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
    role: "authenticated",
    identities: [],
    session_id: "",
    last_sign_in_at: new Date().toISOString(),
  } as unknown as User;

  const userMockSession = {
    access_token: "user-local-token",
    refresh_token: "user-local-refresh",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: userMockUser,
  } as unknown as Session;

  const signIn = async (email: string, password: string) => {
    if (email === USER_EMAIL && password === USER_PASSWORD) {
      setUser(userMockUser);
      setSession(userMockSession);
      setRole("user");
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setRole("user");
    return { error: error as Error | null };
  };

  const signInAdmin = async (email: string, password: string) => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return { error: new Error("Invalid admin ID or password") };
    }
    setUser(mockUser);
    setSession(mockSession);
    setRole("admin");
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setRole(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signInAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
