import { createContext, useContext, useState, type ReactNode } from 'react';
import { profile } from './appData';
import { dataMode } from './appFile';

/**
 * The student whose data is shown. Nothing personal is written in the code: name, student number and programme come
 * from the data file (`profile`, written by the sync from DTU Learn "whoami" and the Studyplanner).
 */
export type CurrentUser = {
  name: string;
  /** Student number (DTU username), shown next to the name on the profile page. */
  studentId: string;
  /**
   * Round profile photo. Live mode: the student's own Learn photo, through the local server (memory only). Demo: none.
   * null = initials (also when the photo does not load: no photo on Learn, server stopped).
   */
  photoUrl: string | null;
  /** Degree programme, shown as the Studyplanner title. null when the Studyplanner does not give it. */
  programme: string | null;
};

const userFromData = (): CurrentUser => ({
  name: profile.name || 'Student',
  studentId: profile.studentId ?? '',
  photoUrl: dataMode === 'live' ? '/api/local/profile/photo' : null,
  programme: profile.programme,
});

type UserContextValue = { user: CurrentUser; setUser: (user: CurrentUser) => void };

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  // appData is loaded before the first render (main.tsx), so the profile is already there.
  const [user, setUser] = useState<CurrentUser>(userFromData);
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
