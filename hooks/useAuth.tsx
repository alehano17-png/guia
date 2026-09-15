import type { AuthUser } from "@supabase/supabase-js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

type AuthResult = {
  error: string | null;
  // true si ya quedó una sesión activa apenas se resuelve la llamada. En
  // signUp puede venir en false si el proyecto de Supabase exige
  // confirmar el correo antes de dar sesión — ahí quien llama no debe
  // navegar como si ya hubiera sesión.
  hasSession: boolean;
};

type AuthContextValue = {
  // null mientras no hay sesión (ni cargándola todavía, ni logueado).
  user: AuthUser | null;
  // true solo durante la primera lectura de sesión al montar la app —
  // después de eso, onAuthStateChange mantiene `user` al día solo.
  isLoadingSession: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Lee el nombre elegido por el usuario en el registro. Se guarda en el
// registro como options.data: { name } de supabase.auth.signUp(), lo que
// Supabase expone de vuelta en user.user_metadata.name. Todavía no se usa
// en ninguna pantalla — queda listo para el saludo de la pantalla de inicio.
export function getUserDisplayName(user: AuthUser | null): string | null {
  const name = user?.user_metadata?.name;
  return typeof name === "string" && name.trim().length > 0 ? name : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setIsLoadingSession(false);
    });

    // Mantiene `user` al día ante login, logout, y refresh de token — sin
    // esto, la sesión persistida (storage) se cargaría al abrir la app
    // pero nunca reflejaría cambios posteriores.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoadingSession(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null, hasSession: !!data.session };
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<AuthResult> => {
      const trimmedName = displayName?.trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // options.data va al metadata del usuario (auth.users.raw_user_meta_data),
        // legible después como user.user_metadata — ver getUserDisplayName arriba.
        ...(trimmedName ? { options: { data: { name: trimmedName } } } : {}),
      });
      return { error: error?.message ?? null, hasSession: !!data.session };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoadingSession, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }

  return context;
}
