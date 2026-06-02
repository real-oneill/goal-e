import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthlyGoal, Session } from '@/types';

const DEVICE_TOKEN_KEY = '@device_token';
const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? 'goal-e.replit.app'}`;

function generateToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateDeviceToken(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing) return existing;
  const token = generateToken();
  await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
  return token;
}

export async function pullFromServer(
  token: string,
): Promise<{ sessions: Session[]; goals: MonthlyGoal[] } | null> {
  try {
    const resp = await fetch(
      `${API_BASE}/api/sync/pull?token=${encodeURIComponent(token)}`,
    );
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function pushToServer(
  token: string,
  sessions: Session[],
  goals: MonthlyGoal[],
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, sessions, goals }),
    });
  } catch {
    // fire-and-forget — never crash the app on sync failure
  }
}
