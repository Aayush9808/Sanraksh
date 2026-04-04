// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const USERS_KEY = "giginsur_users";
const CURRENT_USER_KEY = "giginsur_current_user";

// ─── Backward-compat migration (gigarmor → giginsur) ─────────────────────────

function migrateOldKeys(): void {
  if (typeof window === "undefined") return;
  try {
    const oldUsers = localStorage.getItem("gigarmor_users");
    if (oldUsers && !localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, oldUsers);
      localStorage.removeItem("gigarmor_users");
    }
    const oldCurrent = localStorage.getItem("gigarmor_current_user");
    if (oldCurrent && !localStorage.getItem(CURRENT_USER_KEY)) {
      localStorage.setItem(CURRENT_USER_KEY, oldCurrent);
      localStorage.removeItem("gigarmor_current_user");
    }
  } catch {}
}

if (typeof window !== "undefined") migrateOldKeys();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== "undefined";
}

// ─── API ─────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export function saveUser(user: User): void {
  if (!isClient()) return;
  try {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable (e.g. private browsing quota exceeded)
  }
}

export function getCurrentUser(): User | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch {}
}
