'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export type AuthUser = {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  name: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  /** Recharge la session depuis le serveur (après connexion/inscription). */
  refresh: () => Promise<AuthUser | null>;
  /** Déconnecte l'utilisateur et met immédiatement à jour l'état global. */
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await response.json();
      const nextUser = (data?.user as AuthUser | null) ?? null;
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Ré-synchronise quand l'onglet redevient actif (utile après une action dans un autre onglet).
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refresh]);

  const value = useMemo(
    () => ({ user, isLoading, refresh, logout }),
    [user, isLoading, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider.');
  }
  return context;
}
