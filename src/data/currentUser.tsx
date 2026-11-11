import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * The student who is logged in. For now the login is fake, so everyone sees the author's profile.
 * When a real login exists, call `setUser` after login (or replace DEFAULT_USER) and the whole app updates.
 */
export type CurrentUser = {
  name: string;
  /** Round profile photo. null = show initials instead. */
  photoUrl: string | null;
};

const DEFAULT_USER: CurrentUser = {
  name: 'Nicola Davalli',
  photoUrl: '/images/profile-photo.png',
};

type UserContextValue = { user: CurrentUser; setUser: (user: CurrentUser) => void };

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(DEFAULT_USER);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useCurrentUser must be used inside <UserProvider>');
  return ctx;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
