// src/hooks/useSubscription.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSubscriptionStore } from "../store/subscriptionStore";
import subscriptionService from "../services/subscriptionService";
import {
  planCreateSchema,
  planUpdateSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
  subscriptionCancelSchema,
  paymentCreateSchema,
  subscriptionFilterSchema,
  planFilterSchema,
  validateForm,
} from "../utils/subscriptionValidation";

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const store = useSubscriptionStore();

  // Query Keys
  const SUB_KEYS = {
    subscriptions: (params) => ["subscriptions", params],
    subscription: (id) => ["subscription", id],
    currentSubscription: ["subscription", "current"],
    plans: (params) => ["plans", params],
    publicPlans: ["plans", "public"],
    defaultPlan: ["plans", "default"],
    plan: (id) => ["plan", id],
    planOptions: ["plans", "options"],
    featureUsage: ["features", "usage"],
    featureAccess: (name) => ["features", "access", name],
    webhookEvents: (params) => ["webhooks", "events", params],
  };

  // ============ Queries ============

  // Get subscriptions query
  const getSubscriptionsQuery = (params = {}) => {
    const validatedParams = subscriptionFilterSchema.cast(params);
    return useQuery({
      queryKey: SUB_KEYS.subscriptions(validatedParams),
      queryFn: () => subscriptionService.getSubscriptions(validatedParams),
      onSuccess: (response) => {
        if (response.success) {
          store.setSubscriptions(response.data, response.meta);
          store.setPagination({
            page: validatedParams.page || 1,
            limit: validatedParams.limit || 20,
          });
          if (response.meta?.summary) {
            store.setSubscriptionStats(response.meta.summary);
          }
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch subscriptions");
      },
    });
  };

  // Get current subscription query
  const getCurrentSubscriptionQuery = () => {
    return useQuery({
      queryKey: SUB_KEYS.currentSubscription,
      queryFn: () => subscriptionService.getCurrentSubscription(),
      staleTime: 1000 * 60 * 2,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentSubscription(response.data);
        }
      },
      onError: () => {
        store.setCurrentSubscription(null);
      },
    });
  };

  // Get plans query
  const getPlansQuery = (params = {}) => {
    const validatedParams = planFilterSchema.cast(params);
    return useQuery({
      queryKey: SUB_KEYS.plans(validatedParams),
      queryFn: () => subscriptionService.getPlans(validatedParams),
      onSuccess: (response) => {
        if (response.success) {
          store.setPlans(response.data, response.meta);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch plans");
      },
    });
  };

  // Get public plans query
  const getPublicPlansQuery = () => {
    return useQuery({
      queryKey: SUB_KEYS.publicPlans,
      queryFn: () => subscriptionService.getPublicPlans(),
      staleTime: 1000 * 60 * 5,
      onSuccess: (response) => {
        if (response.success) {
          store.setPlans(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch public plans");
      },
    });
  };

  // Get default plan query
  const getDefaultPlanQuery = () => {
    return useQuery({
      queryKey: SUB_KEYS.defaultPlan,
      queryFn: () => subscriptionService.getDefaultPlan(),
      staleTime: 1000 * 60 * 5,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentPlan(response.data);
        }
      },
    });
  };

  // Get plan options query
  const getPlanOptionsQuery = () => {
    return useQuery({
      queryKey: SUB_KEYS.planOptions,
      queryFn: () => subscriptionService.getPlanOptions(),
      staleTime: 1000 * 60 * 10,
      onSuccess: (response) => {
        if (response.success) {
          store.setPlanOptions(response.data);
        }
      },
    });
  };

  // Get feature usage query
  const getFeatureUsageQuery = () => {
    return useQuery({
      queryKey: SUB_KEYS.featureUsage,
      queryFn: () => subscriptionService.getFeatureUsage(),
      onSuccess: (response) => {
        if (response.success) {
          store.setFeatureUsage(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch feature usage");
      },
    });
  };

  // Get webhook events query
  const getWebhookEventsQuery = (params = {}) => {
    return useQuery({
      queryKey: SUB_KEYS.webhookEvents(params),
      queryFn: () => subscriptionService.getWebhookEvents(params),
      enabled: false, // Only fetch on demand
      onSuccess: (response) => {
        if (response.success) {
          store.setWebhookEvents(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch webhook events");
      },
    });
  };

  // ============ Mutations ============

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: (data) => {
      return validateForm(subscriptionCreateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return subscriptionService.createSubscription(data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addSubscription(response.data);
        store.setCurrentSubscription(response.data);
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        queryClient.invalidateQueries({
          queryKey: ["subscription", "current"],
        });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to create subscription");
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return validateForm(subscriptionUpdateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return subscriptionService.updateSubscription(id, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateSubscription(response.data.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        queryClient.invalidateQueries({
          queryKey: ["subscription", response.data.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["subscription", "current"],
        });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to update subscription");
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: ({ id, data = {} }) => {
      return validateForm(subscriptionCancelSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return subscriptionService.cancelSubscription(id, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateSubscription(response.data.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        queryClient.invalidateQueries({
          queryKey: ["subscription", response.data.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["subscription", "current"],
        });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to cancel subscription");
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data) => {
      return validateForm(planCreateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return subscriptionService.createPlan(data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addPlan(response.data);
        queryClient.invalidateQueries({ queryKey: ["plans"] });
        queryClient.invalidateQueries({ queryKey: ["plans", "public"] });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to create plan");
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return validateForm(planUpdateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return subscriptionService.updatePlan(id, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updatePlan(response.data.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["plans"] });
        queryClient.invalidateQueries({ queryKey: ["plans", "public"] });
        queryClient.invalidateQueries({ queryKey: ["plan", response.data.id] });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to update plan");
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (id) => subscriptionService.deletePlan(id),
    onSuccess: (_, id) => {
      store.removePlan(id);
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["plans", "public"] });
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete plan");
    },
  });

  // Check feature access mutation
  const checkFeatureAccessMutation = useMutation({
    mutationFn: (featureName) =>
      subscriptionService.checkFeatureAccess(featureName),
    onError: (error) => {
      store.setError(error.message || "Failed to check feature access");
    },
  });

  // ============ API Methods ============

  const getSubscriptions = (params = {}) => {
    store.clearError();
    return getSubscriptionsQuery(params);
  };

  const getCurrentSubscription = () => {
    store.clearError();
    return getCurrentSubscriptionQuery();
  };

  const getPlans = (params = {}) => {
    store.clearError();
    return getPlansQuery(params);
  };

  const getPublicPlans = () => {
    store.clearError();
    return getPublicPlansQuery();
  };

  const getDefaultPlan = () => {
    store.clearError();
    return getDefaultPlanQuery();
  };

  const getPlanOptions = () => {
    store.clearError();
    return getPlanOptionsQuery();
  };

  const getFeatureUsage = () => {
    store.clearError();
    return getFeatureUsageQuery();
  };

  const createSubscription = async (data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createSubscriptionMutation.mutateAsync(data);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateSubscription = async (id, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateSubscriptionMutation.mutateAsync({ id, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const cancelSubscription = async (id, data = {}) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await cancelSubscriptionMutation.mutateAsync({ id, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const createPlan = async (data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createPlanMutation.mutateAsync(data);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updatePlan = async (id, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updatePlanMutation.mutateAsync({ id, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deletePlan = async (id) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deletePlanMutation.mutateAsync(id);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const checkFeatureAccess = async (featureName) => {
    store.clearError();
    try {
      const result = await checkFeatureAccessMutation.mutateAsync(featureName);
      return result;
    } catch (error) {
      store.setError(error.message || "Failed to check feature access");
      throw error;
    }
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearSubscription = () => store.clearSubscription();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    subscriptions: store.subscriptions,
    currentSubscription: store.currentSubscription,
    plans: store.plans,
    currentPlan: store.currentPlan,
    payments: store.payments,
    featureUsage: store.featureUsage,
    webhookEvents: store.webhookEvents,
    subscriptionStats: store.subscriptionStats,
    planOptions: store.planOptions,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,

    // Query loading states
    isSubscriptionsLoading: getSubscriptionsQuery({}).isLoading,
    isCurrentSubscriptionLoading: getCurrentSubscriptionQuery().isLoading,
    isPlansLoading: getPlansQuery({}).isLoading,
    isPublicPlansLoading: getPublicPlansQuery().isLoading,
    isPlanOptionsLoading: getPlanOptionsQuery().isLoading,
    isFeatureUsageLoading: getFeatureUsageQuery().isLoading,

    // Mutation loading states
    isCreatingSubscription: createSubscriptionMutation.isPending,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,
    isCancelingSubscription: cancelSubscriptionMutation.isPending,
    isCreatingPlan: createPlanMutation.isPending,
    isUpdatingPlan: updatePlanMutation.isPending,
    isDeletingPlan: deletePlanMutation.isPending,
    isCheckingFeature: checkFeatureAccessMutation.isPending,

    // Query methods
    getSubscriptions,
    getCurrentSubscription,
    getPlans,
    getPublicPlans,
    getDefaultPlan,
    getPlanOptions,
    getFeatureUsage,
    getWebhookEvents: getWebhookEventsQuery,

    // Mutation methods
    createSubscription,
    updateSubscription,
    cancelSubscription,
    createPlan,
    updatePlan,
    deletePlan,
    checkFeatureAccess,

    // Store actions
    clearError,
    clearSubscription,
    reset,
    setFilters,
  };
};

export default useSubscription;
