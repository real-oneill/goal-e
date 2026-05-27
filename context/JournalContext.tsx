import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Discipline, MonthlyGoal, Session } from '@/types';

const SESSIONS_KEY = '@journal_sessions';
const GOALS_KEY = '@journal_goals';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface JournalContextType {
  sessions: Session[];
  goals: MonthlyGoal[];
  isLoaded: boolean;
  addSession: (session: Omit<Session, 'id' | 'createdAt'>) => Promise<Session>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addGoal: (goal: Omit<MonthlyGoal, 'id' | 'createdAt'>) => Promise<MonthlyGoal>;
  updateGoal: (id: string, updates: Partial<MonthlyGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getSessionsForMonth: (month: string) => Session[];
  getGoalForMonth: (discipline: Discipline, month: string) => MonthlyGoal | undefined;
  getCurrentMonthGoals: () => MonthlyGoal[];
  getCurrentYearGoals: () => MonthlyGoal[];
}

const JournalContext = createContext<JournalContextType | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [rawSessions, rawGoals] = await Promise.all([
          AsyncStorage.getItem(SESSIONS_KEY),
          AsyncStorage.getItem(GOALS_KEY),
        ]);
        if (rawSessions) setSessions(JSON.parse(rawSessions));
        if (rawGoals) {
          const parsed: MonthlyGoal[] = JSON.parse(rawGoals);
          const migrated = parsed.map(g => ({ period: 'monthly' as const, ...g }));
          setGoals(migrated);
        }
      } catch {}
      setIsLoaded(true);
    }
    load();
  }, []);

  const persistSessions = useCallback(async (updated: Session[]) => {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  }, []);

  const persistGoals = useCallback(async (updated: MonthlyGoal[]) => {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  }, []);

  const addSession = useCallback(async (data: Omit<Session, 'id' | 'createdAt'>) => {
    const session: Session = { ...data, id: genId(), createdAt: new Date().toISOString() };
    setSessions(prev => {
      const next = [session, ...prev];
      persistSessions(next);
      return next;
    });
    return session;
  }, [persistSessions]);

  const updateSession = useCallback(async (id: string, updates: Partial<Session>) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      persistSessions(next);
      return next;
    });
  }, [persistSessions]);

  const deleteSession = useCallback(async (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      persistSessions(next);
      return next;
    });
  }, [persistSessions]);

  const addGoal = useCallback(async (data: Omit<MonthlyGoal, 'id' | 'createdAt'>) => {
    const goal: MonthlyGoal = { ...data, id: genId(), createdAt: new Date().toISOString() };
    setGoals(prev => {
      const next = [goal, ...prev];
      persistGoals(next);
      return next;
    });
    return goal;
  }, [persistGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<MonthlyGoal>) => {
    setGoals(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      persistGoals(next);
      return next;
    });
  }, [persistGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id);
      persistGoals(next);
      return next;
    });
  }, [persistGoals]);

  const getSessionsForMonth = useCallback((month: string) => {
    return sessions.filter(s => s.date.startsWith(month));
  }, [sessions]);

  const getGoalForMonth = useCallback((discipline: Discipline, month: string) => {
    return goals.find(g => g.discipline === discipline && g.month === month && g.period === 'monthly');
  }, [goals]);

  const getCurrentMonthGoals = useCallback(() => {
    const month = new Date().toISOString().slice(0, 7);
    return goals.filter(g => g.month === month && g.period === 'monthly');
  }, [goals]);

  const getCurrentYearGoals = useCallback(() => {
    const year = new Date().getFullYear().toString();
    return goals.filter(g => g.month === year && g.period === 'yearly');
  }, [goals]);

  return (
    <JournalContext.Provider value={{
      sessions, goals, isLoaded,
      addSession, updateSession, deleteSession,
      addGoal, updateGoal, deleteGoal,
      getSessionsForMonth, getGoalForMonth, getCurrentMonthGoals, getCurrentYearGoals,
    }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be inside JournalProvider');
  return ctx;
}
