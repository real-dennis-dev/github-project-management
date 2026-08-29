// src/components/decision-risks/store/decisionsRisksStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  // Decisions state
  decisions: [],
  currentDecision: null,
  decisionsMeta: null,
  decisionStats: null,
  decisionReport: null,

  // Risks state
  risks: [],
  currentRisk: null,
  risksMeta: null,
  riskReport: null,
  riskMatrix: null,
  riskScore: null,

  // UI state
  isLoading: false,
  error: null,

  // Filters
  decisionFilters: {
    impact: null,
    fromDate: null,
    toDate: null,
    sortBy: "created_at",
    sortOrder: "DESC",
    page: 1,
    limit: 20,
  },
  riskFilters: {
    level: null,
    status: null,
    sortBy: "created_at",
    sortOrder: "DESC",
    page: 1,
    limit: 20,
  },
};

export const useDecisionsRisksStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== Decision Actions ==========
      setDecisions: (decisions, meta) =>
        set({
          decisions,
          decisionsMeta: meta,
          isLoading: false,
        }),

      setCurrentDecision: (decision) =>
        set({
          currentDecision: decision,
          isLoading: false,
        }),

      setDecisionStats: (stats) =>
        set({
          decisionStats: stats,
          isLoading: false,
        }),

      setDecisionReport: (report) =>
        set({
          decisionReport: report,
          isLoading: false,
        }),

      addDecision: (decision) =>
        set((state) => ({
          decisions: [decision, ...state.decisions],
          isLoading: false,
        })),

      updateDecision: (id, updates) =>
        set((state) => ({
          decisions: state.decisions.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
          currentDecision:
            state.currentDecision?.id === id
              ? { ...state.currentDecision, ...updates }
              : state.currentDecision,
          isLoading: false,
        })),

      removeDecision: (id) =>
        set((state) => ({
          decisions: state.decisions.filter((d) => d.id !== id),
          currentDecision:
            state.currentDecision?.id === id ? null : state.currentDecision,
          isLoading: false,
        })),

      setDecisionFilters: (filters) =>
        set((state) => ({
          decisionFilters: { ...state.decisionFilters, ...filters },
        })),

      resetDecisionFilters: () =>
        set({
          decisionFilters: initialState.decisionFilters,
        }),

      // ========== Risk Actions ==========
      setRisks: (risks, meta) =>
        set({
          risks,
          risksMeta: meta,
          isLoading: false,
        }),

      setCurrentRisk: (risk) =>
        set({
          currentRisk: risk,
          isLoading: false,
        }),

      setRiskReport: (report) =>
        set({
          riskReport: report,
          isLoading: false,
        }),

      setRiskMatrix: (matrix) =>
        set({
          riskMatrix: matrix,
          isLoading: false,
        }),

      setRiskScore: (score) =>
        set({
          riskScore: score,
          isLoading: false,
        }),

      addRisk: (risk) =>
        set((state) => ({
          risks: [risk, ...state.risks],
          isLoading: false,
        })),

      updateRisk: (id, updates) =>
        set((state) => ({
          risks: state.risks.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
          currentRisk:
            state.currentRisk?.id === id
              ? { ...state.currentRisk, ...updates }
              : state.currentRisk,
          isLoading: false,
        })),

      removeRisk: (id) =>
        set((state) => ({
          risks: state.risks.filter((r) => r.id !== id),
          currentRisk: state.currentRisk?.id === id ? null : state.currentRisk,
          isLoading: false,
        })),

      setRiskFilters: (filters) =>
        set((state) => ({
          riskFilters: { ...state.riskFilters, ...filters },
        })),

      resetRiskFilters: () =>
        set({
          riskFilters: initialState.riskFilters,
        }),

      // ========== Common Actions ==========
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),
      clearAll: () => set(initialState),
    }),
    {
      name: "decisions-risks-storage",
      partialize: (state) => ({
        decisionFilters: state.decisionFilters,
        riskFilters: state.riskFilters,
      }),
    }
  )
);
