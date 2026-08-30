// src/store/authStore.js
import { create } from "zustand";

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessions: [],
  sessionsMeta: null,
  sessionStats: null,
};

const authStore = (set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setSession: (session) =>
    set({
      session,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  setSessions: (sessions, meta) =>
    set({
      sessions,
      sessionsMeta: meta,
    }),

  setSessionStats: (stats) =>
    set({
      sessionStats: stats,
    }),

  clearAuth: () =>
    set({
      ...initialState,
      isAuthenticated: false,
    }),

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
    })),

  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    })),
});

export const useAuthStore = create(authStore);
