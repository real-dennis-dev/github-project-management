// src/hooks/useVision.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVisionStore } from "../store/visionStore";
import visionService from "../services/visionService";
import {
  visionGoalCreateSchema,
  visionGoalUpdateSchema,
  visionFilterSchema,
  linkProjectSchema,
  validateForm,
} from "../utils/visionValidation";

const VISION_KEYS = {
  goals: (params) => ["vision", "goals", params],
  goal: (id) => ["vision", "goal", id],
  statistics: ["vision", "statistics"],
  categories: ["vision", "categories"],
  options: ["vision", "options"],
  progress: (id) => ["vision", "progress", id],
  availableProjects: (id) => ["vision", "available-projects", id],
  linkedProjects: (id) => ["vision", "linked-projects", id],
  activities: (limit) => ["vision", "activities", limit],
  dashboard: ["vision", "dashboard"],
  goalsByStatus: (status) => ["vision", "goals-by-status", status],
};

/**
 * @param {Object} options
 * @param {boolean} [options.enableGoals=false]
 * @param {boolean} [options.enableStatistics=false]
 * @param {boolean} [options.enableCategories=false]
 * @param {boolean} [options.enableOptions=false]
 * @param {boolean} [options.enableDashboard=false]
 * @param {boolean} [options.enableActivities=false]
 * @param {Object}  [options.goalsParams={}]
 * @param {number}  [options.activitiesLimit=10]
 * @param {string|null} [options.goalId=null]
 */
export const useVision = (options = {}) => {
  const {
    enableGoals = false,
    enableStatistics = false,
    enableCategories = false,
    enableOptions = false,
    enableDashboard = false,
    enableActivities = false,
    goalsParams = {},
    activitiesLimit = 10,
    goalId = null,
  } = options;

  const queryClient = useQueryClient();
  const store = useVisionStore();

  // ---------- Queries ----------
  const validatedGoalsParams = visionFilterSchema.cast(goalsParams);

  const goalsQuery = useQuery({
    queryKey: VISION_KEYS.goals(validatedGoalsParams),
    queryFn: () => visionService.getGoals(validatedGoalsParams),
    enabled: enableGoals,
  });

  const statisticsQuery = useQuery({
    queryKey: VISION_KEYS.statistics,
    queryFn: () => visionService.getStatistics(),
    enabled: enableStatistics,
    staleTime: 1000 * 60 * 2,
    refetchInterval: enableStatistics ? 30_000 : false, // replaces the old setInterval useEffect
  });

  const categoriesQuery = useQuery({
    queryKey: VISION_KEYS.categories,
    queryFn: () => visionService.getCategories(),
    enabled: enableCategories,
    staleTime: 1000 * 60 * 5,
  });

  const optionsQuery = useQuery({
    queryKey: VISION_KEYS.options,
    queryFn: () => visionService.getOptions(),
    enabled: enableOptions,
    staleTime: 1000 * 60 * 10,
  });

  const dashboardQuery = useQuery({
    queryKey: VISION_KEYS.dashboard,
    queryFn: () => visionService.getDashboardData(),
    enabled: enableDashboard,
    staleTime: 1000 * 60 * 2,
  });

  const activitiesQuery = useQuery({
    queryKey: VISION_KEYS.activities(activitiesLimit),
    queryFn: () => visionService.getRecentActivities(activitiesLimit),
    enabled: enableActivities,
    staleTime: 1000 * 60 * 2,
  });

  // Optional single-goal queries (only run when goalId is provided)
  const goalQuery = useQuery({
    queryKey: VISION_KEYS.goal(goalId),
    queryFn: () => visionService.getGoal(goalId),
    enabled: !!goalId,
  });

  const progressQuery = useQuery({
    queryKey: VISION_KEYS.progress(goalId),
    queryFn: () => visionService.getGoalProgress(goalId),
    enabled: !!goalId,
  });

  const availableProjectsQuery = useQuery({
    queryKey: VISION_KEYS.availableProjects(goalId),
    queryFn: () => visionService.getAvailableProjects(goalId),
    enabled: !!goalId,
  });

  const linkedProjectsQuery = useQuery({
    queryKey: VISION_KEYS.linkedProjects(goalId),
    queryFn: () => visionService.getGoalLinkedProjects(goalId),
    enabled: !!goalId,
  });

  // ---------- Mutations ----------
  const createGoalMutation = useMutation({
    mutationFn: async (data) => {
      const validation = await validateForm(visionGoalCreateSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return visionService.createGoal(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision"] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(visionGoalUpdateSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return visionService.updateGoal(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => visionService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision"] });
    },
  });

  const bulkDeleteGoalsMutation = useMutation({
    mutationFn: (ids) => visionService.bulkDeleteGoals(ids),
    onSuccess: () => {
      store.clearSelection();
      queryClient.invalidateQueries({ queryKey: ["vision"] });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ ids, status }) =>
      visionService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      store.clearSelection();
      queryClient.invalidateQueries({ queryKey: ["vision"] });
    },
  });

  const linkProjectMutation = useMutation({
    mutationFn: async ({ goalId, data }) => {
      const validation = await validateForm(linkProjectSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return visionService.linkProject(goalId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision"] });
    },
  });

  const unlinkProjectMutation = useMutation({
    mutationFn: ({ goalId, projectId }) =>
      visionService.unlinkProject(goalId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision"] });
    },
  });

  // ---------- Convenience wrappers ----------
  const createGoal = (data) => createGoalMutation.mutateAsync(data);
  const updateGoal = (id, data) => updateGoalMutation.mutateAsync({ id, data });
  const deleteGoal = (id) => deleteGoalMutation.mutateAsync(id);
  const bulkDeleteGoals = (ids) => bulkDeleteGoalsMutation.mutateAsync(ids);
  const bulkUpdateStatus = (ids, status) =>
    bulkUpdateStatusMutation.mutateAsync({ ids, status });
  const linkProject = (goalId, data) =>
    linkProjectMutation.mutateAsync({ goalId, data });
  const unlinkProject = (goalId, projectId) =>
    unlinkProjectMutation.mutateAsync({ goalId, projectId });

  // Derived data (prefer query data, fall back to store if you still need it)
  const goals = goalsQuery.data?.data ?? store.goals ?? [];
  const statistics = statisticsQuery.data?.data ?? store.statistics ?? null;
  const categories = categoriesQuery.data?.data ?? store.categories ?? [];
  const optionsData = optionsQuery.data?.data ?? store.options ?? null;
  const pagination = goalsQuery.data?.meta ?? store.pagination ?? {};
  const currentGoal = goalQuery.data?.data ?? store.currentGoal ?? null;
  const goalProgress = progressQuery.data?.data ?? store.goalProgress ?? null;
  const availableProjects =
    availableProjectsQuery.data?.data ?? store.availableProjects ?? [];
  const linkedProjects =
    linkedProjectsQuery.data?.data ?? store.linkedProjects ?? [];

  const error =
    goalsQuery.error?.message ||
    statisticsQuery.error?.message ||
    categoriesQuery.error?.message ||
    optionsQuery.error?.message ||
    dashboardQuery.error?.message ||
    activitiesQuery.error?.message ||
    goalQuery.error?.message ||
    createGoalMutation.error?.message ||
    updateGoalMutation.error?.message ||
    deleteGoalMutation.error?.message ||
    bulkDeleteGoalsMutation.error?.message ||
    bulkUpdateStatusMutation.error?.message ||
    linkProjectMutation.error?.message ||
    unlinkProjectMutation.error?.message ||
    store.error ||
    null;

  return {
    // Data
    goals,
    statistics,
    categories,
    options: optionsData,
    pagination,
    currentGoal,
    goalProgress,
    availableProjects,
    linkedProjects,
    dashboard: dashboardQuery.data?.data,
    activities: activitiesQuery.data?.data,

    // Loading
    isLoading:
      (enableGoals && goalsQuery.isLoading) ||
      (enableStatistics && statisticsQuery.isLoading) ||
      (enableDashboard && dashboardQuery.isLoading),
    isGoalsLoading: goalsQuery.isLoading || goalsQuery.isFetching,
    isStatisticsLoading:
      statisticsQuery.isLoading || statisticsQuery.isFetching,
    isCategoriesLoading: categoriesQuery.isLoading,
    isOptionsLoading: optionsQuery.isLoading,
    isDashboardLoading: dashboardQuery.isLoading || dashboardQuery.isFetching,
    isActivitiesLoading: activitiesQuery.isLoading,
    isGoalLoading: goalQuery.isLoading,
    isProgressLoading: progressQuery.isLoading,
    isAvailableProjectsLoading: availableProjectsQuery.isLoading,
    isLinkedProjectsLoading: linkedProjectsQuery.isLoading,

    // Mutations pending
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isBulkDeleting: bulkDeleteGoalsMutation.isPending,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,
    isLinking: linkProjectMutation.isPending,
    isUnlinking: unlinkProjectMutation.isPending,

    // Error
    error,
    clearError: () => store.clearError(),

    // Refetch helpers (no useEffect needed in components)
    refetchGoals: goalsQuery.refetch,
    refetchStatistics: statisticsQuery.refetch,
    refetchDashboard: dashboardQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
    refetchOptions: optionsQuery.refetch,

    // Actions
    createGoal,
    updateGoal,
    deleteGoal,
    bulkDeleteGoals,
    bulkUpdateStatus,
    linkProject,
    unlinkProject,

    // Store UI state
    viewMode: store.viewMode,
    selectedGoalIds: store.selectedGoalIds,
    setViewMode: store.setViewMode,
    toggleGoalSelection: store.toggleGoalSelection,
    clearSelection: store.clearSelection,
    setSelectedGoalIds: store.setSelectedGoalIds,
    setFilters: store.setFilters,
    clearVision: store.clearVision,
    reset: store.reset,
  };
};

export default useVision;
