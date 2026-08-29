// src/store/subscriptionStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  subscriptions: [],
  currentSubscription: null,
  plans: [],
  currentPlan: null,
  payments: [],
  featureUsage: [],
  webhookEvents: [],
  subscriptionStats: null,
  planOptions: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    status: null,
    planType: null,
  },
};

export const useSubscriptionStore = create(
  persist(
    (set) => ({
      ...initialState,

      setSubscriptions: (subscriptions, meta) =>
        set((state) => ({
          subscriptions,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.totalPages || state.pagination.pages,
          },
        })),

      setCurrentSubscription: (subscription) =>
        set({ currentSubscription: subscription }),

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [subscription, ...state.subscriptions],
        })),

      updateSubscription: (id, updates) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          ),
          currentSubscription:
            state.currentSubscription?.id === id
              ? { ...state.currentSubscription, ...updates }
              : state.currentSubscription,
        })),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
          currentSubscription:
            state.currentSubscription?.id === id
              ? null
              : state.currentSubscription,
        })),

      setPlans: (plans, meta) =>
        set((state) => ({
          plans,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.totalPages || state.pagination.pages,
          },
        })),

      setCurrentPlan: (plan) => set({ currentPlan: plan }),

      addPlan: (plan) =>
        set((state) => ({
          plans: [...state.plans, plan],
        })),

      updatePlan: (id, updates) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id ? { ...plan, ...updates } : plan
          ),
          currentPlan:
            state.currentPlan?.id === id
              ? { ...state.currentPlan, ...updates }
              : state.currentPlan,
        })),

      removePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== id),
          currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
        })),

      setPayments: (payments) => set({ payments }),

      setFeatureUsage: (usage) => set({ featureUsage: usage }),

      setWebhookEvents: (events) => set({ webhookEvents: events }),

      setSubscriptionStats: (stats) => set({ subscriptionStats: stats }),

      setPlanOptions: (options) => set({ planOptions: options }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearError: () => set({ error: null }),

      clearSubscription: () =>
        set({
          currentSubscription: null,
          currentPlan: null,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "subscription-storage",
      partialize: (state) => ({
        subscriptions: state.subscriptions.slice(0, 10),
        plans: state.plans,
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
