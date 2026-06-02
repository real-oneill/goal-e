import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Discipline, MonthlyGoal, Session } from '@/types';
import {
  getOrCreateDeviceToken,
  pullFromServer,
  pushToServer,
} from '@/services/syncService';

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
  const deviceTokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [rawSessions, rawGoals, token] = await Promise.all([
          AsyncStorage.getItem(SESSIONS_KEY),
          AsyncStorage.getItem(GOALS_KEY),
          getOrCreateDeviceToken(),
        ]);

        deviceTokenRef.current = token;

        let localSessions: Session[] = rawSessions ? JSON.parse(rawSessions) : [];
        let localGoals: MonthlyGoal[] = rawGoals
          ? (JSON.parse(rawGoals) as MonthlyGoal[]).map(g => ({
              period: 'monthly' as const,
              ...g,
            }))
          : [];

        setSessions(localSessions);
        setGoals(localGoals);
        setIsLoaded(true);

        // Pull from server and merge in the background
        const remote = await pullFromServer(token);
        if (remote) {
          const localSessionIds = new Set(localSessions.map(s => s.id));
          const localGoalIds = new Set(localGoals.map(g => g.id));

          const newSessions = remote.sessions.filter(s => !localSessionIds.has(s.id));
          const newGoals = remote.goals
            .map(g => ({ period: 'monthly' as const, ...g }))
            .filter(g => !localGoalIds.has(g.id));

          if (newSessions.length > 0 || newGoals.length > 0) {
            const mergedSessions = [...localSessions, ...newSessions];
            const mergedGoals = [...localGoals, ...newGoals];

            await Promise.all([
              AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(mergedSessions)),
              AsyncStorage.setItem(GOALS_KEY, JSON.stringify(mergedGoals)),
            ]);

            setSessions(mergedSessions);
            setGoals(mergedGoals);
            localSessions = mergedSessions;
            localGoals = mergedGoals;
          }

          // Push merged state back so server is always up to date
          await pushToServer(token, localSessions, localGoals);
        }
      } catch {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  const syncPush = useCallback((updatedSessions: Session[], updatedGoals: MonthlyGoal[]) => {
    const token = deviceTokenRef.current;
    if (token) {
      pushToServer(token, updatedSessions, updatedGoals);
    }
  }, []);

  const persistSessions = useCallback(async (updated: Session[], currentGoals: MonthlyGoal[]) => {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    syncPush(updated, currentGoals);
  }, [syncPush]);

  const persistGoals = useCallback(async (currentSessions: Session[], updated: MonthlyGoal[]) => {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
    syncPush(currentSessions, updated);
  }, [syncPush]);

  // Keep stable refs to current state for use inside callbacks
  const sessionsRef = useRef(sessions);
  const goalsRef = useRef(goals);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);
  useEffect(() => { goalsRef.current = goals; }, [goals]);

  const addSession = useCallback(async (data: Omit<Session, 'id' | 'createdAt'>) => {
    const session: Session = { ...data, id: genId(), createdAt: new Date().toISOString() };
    setSessions(prev => {
      const next = [session, ...prev];
      persistSessions(next, goalsRef.current);
      return next;
    });
    return session;
  }, [persistSessions]);

  const updateSession = useCallback(async (id: string, updates: Partial<Session>) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      persistSessions(next, goalsRef.current);
      return next;
    });
  }, [persistSessions]);

  const deleteSession = useCallback(async (id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      persistSessions(next, goalsRef.current);
      return next;
    });
  }, [persistSessions]);

  const addGoal = useCallback(async (data: Omit<MonthlyGoal, 'id' | 'createdAt'>) => {
    const goal: MonthlyGoal = { ...data, id: genId(), createdAt: new Date().toISOString() };
    setGoals(prev => {
      const next = [goal, ...prev];
      persistGoals(sessionsRef.current, next);
      return next;
    });
    return goal;
  }, [persistGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<MonthlyGoal>) => {
    setGoals(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      persistGoals(sessionsRef.current, next);
      return next;
    });
  }, [persistGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id);
      persistGoals(sessionsRef.current, next);
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
