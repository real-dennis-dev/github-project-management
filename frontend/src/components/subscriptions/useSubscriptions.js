// src/components/subscriptions/useSubscriptions.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import subscriptionsService from "./SubscriptionsService";
import { DEFAULT_PAGINATION, DEFAULT_FILTERS } from "./SubscriptionsConstants";

/**
 * Custom hook for subscriptions (releases and milestones) management
 */
export const useSubscriptions = () => {
  const { projectId, releaseId, milestoneId } = useParams();
  const navigate = useNavigate();

  // ============================================
  // RELEASE STATE
  // ============================================
  const [releases, setReleases] = useState([]);
  const [release, setRelease] = useState(null);
  const [releaseProgress, setReleaseProgress] = useState(null);
  const [releaseStats, setReleaseStats] = useState(null);

  // ============================================
  // MILESTONE STATE
  // ============================================
  const [milestones, setMilestones] = useState([]);
  const [milestone, setMilestone] = useState(null);
  const [milestoneProgress, setMilestoneProgress] = useState(null);
  const [milestoneStats, setMilestoneStats] = useState(null);
  const [overdueMilestones, setOverdueMilestones] = useState([]);

  // ============================================
  // COMMON STATE
  // ============================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState("releases");

  // ============================================
  // RELEASE FUNCTIONS
  // ============================================

  const fetchReleases = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await subscriptionsService.getReleases(
        projectId,
        params
      );

      if (response.success) {
        setReleases(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          }));
        }
      } else {
        throw new Error(response.message || "Failed to fetch releases");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching releases");
      setReleases([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, pagination.page, pagination.limit]);

  const fetchRelease = useCallback(async () => {
    if (!releaseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionsService.getReleaseById(releaseId);

      if (response.success) {
        setRelease(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch release");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching the release");
      setRelease(null);
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  const createRelease = useCallback(
    async (data) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.createRelease(
          projectId,
          data
        );

        if (response.success) {
          await fetchReleases();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create release");
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating the release");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchReleases]
  );

  const updateRelease = useCallback(
    async (releaseId, data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.updateRelease(
          releaseId,
          data
        );

        if (response.success) {
          await fetchReleases();
          if (releaseId === release?.id) {
            await fetchRelease();
          }
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update release");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the release");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [release?.id, fetchReleases, fetchRelease]
  );

  const updateReleaseStatus = useCallback(
    async (releaseId, status) => {
      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.updateReleaseStatus(
          releaseId,
          status
        );

        if (response.success) {
          await fetchReleases();
          if (releaseId === release?.id) {
            await fetchRelease();
          }
          return response.data;
        } else {
          throw new Error(
            response.message || "Failed to update release status"
          );
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while updating the release status"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [release?.id, fetchReleases, fetchRelease]
  );

  const deleteRelease = useCallback(
    async (releaseId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.deleteRelease(releaseId);

        if (response.success) {
          await fetchReleases();
          if (releaseId === release?.id) {
            navigate("/subscriptions/releases");
          }
          return true;
        } else {
          throw new Error(response.message || "Failed to delete release");
        }
      } catch (err) {
        setError(err.message || "An error occurred while deleting the release");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [release?.id, fetchReleases, navigate]
  );

  const fetchReleaseProgress = useCallback(async () => {
    if (!releaseId) return;

    try {
      const response = await subscriptionsService.getReleaseProgress(releaseId);
      if (response.success) {
        setReleaseProgress(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch release progress:", err);
    }
  }, [releaseId]);

  const fetchReleaseStats = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await subscriptionsService.getReleaseStatistics(
        projectId
      );
      if (response.success) {
        setReleaseStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch release statistics:", err);
    }
  }, [projectId]);

  const generateChangelog = useCallback(async (releaseId) => {
    try {
      const response = await subscriptionsService.generateChangelog(releaseId);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error("Failed to generate changelog:", err);
      throw err;
    }
  }, []);

  // ============================================
  // MILESTONE FUNCTIONS
  // ============================================

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await subscriptionsService.getMilestones(
        projectId,
        params
      );

      if (response.success) {
        setMilestones(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          }));
        }
      } else {
        throw new Error(response.message || "Failed to fetch milestones");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching milestones");
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, pagination.page, pagination.limit]);

  const fetchMilestone = useCallback(async () => {
    if (!milestoneId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionsService.getMilestoneById(milestoneId);

      if (response.success) {
        setMilestone(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch milestone");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching the milestone");
      setMilestone(null);
    } finally {
      setLoading(false);
    }
  }, [milestoneId]);

  const createMilestone = useCallback(
    async (data) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.createMilestone(
          projectId,
          data
        );

        if (response.success) {
          await fetchMilestones();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create milestone");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while creating the milestone"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchMilestones]
  );

  const updateMilestone = useCallback(
    async (milestoneId, data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.updateMilestone(
          milestoneId,
          data
        );

        if (response.success) {
          await fetchMilestones();
          if (milestoneId === milestone?.id) {
            await fetchMilestone();
          }
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update milestone");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while updating the milestone"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [milestone?.id, fetchMilestones, fetchMilestone]
  );

  const updateMilestoneStatus = useCallback(
    async (milestoneId, status) => {
      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.updateMilestoneStatus(
          milestoneId,
          status
        );

        if (response.success) {
          await fetchMilestones();
          if (milestoneId === milestone?.id) {
            await fetchMilestone();
          }
          return response.data;
        } else {
          throw new Error(
            response.message || "Failed to update milestone status"
          );
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while updating the milestone status"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [milestone?.id, fetchMilestones, fetchMilestone]
  );

  const deleteMilestone = useCallback(
    async (milestoneId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.deleteMilestone(
          milestoneId
        );

        if (response.success) {
          await fetchMilestones();
          if (milestoneId === milestone?.id) {
            navigate("/subscriptions/milestones");
          }
          return true;
        } else {
          throw new Error(response.message || "Failed to delete milestone");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while deleting the milestone"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [milestone?.id, fetchMilestones, navigate]
  );

  const fetchMilestoneProgress = useCallback(async () => {
    if (!milestoneId) return;

    try {
      const response = await subscriptionsService.getMilestoneProgress(
        milestoneId
      );
      if (response.success) {
        setMilestoneProgress(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch milestone progress:", err);
    }
  }, [milestoneId]);

  const fetchMilestoneStats = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await subscriptionsService.getMilestoneStatistics(
        projectId
      );
      if (response.success) {
        setMilestoneStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch milestone statistics:", err);
    }
  }, [projectId]);

  const fetchOverdueMilestones = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await subscriptionsService.getOverdueMilestones(
        projectId
      );
      if (response.success) {
        setOverdueMilestones(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch overdue milestones:", err);
    }
  }, [projectId]);

  const bulkUpdateProgress = useCallback(
    async (updates) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await subscriptionsService.bulkUpdateProgress(
          projectId,
          updates
        );

        if (response.success) {
          await fetchMilestones();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update progress");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating progress");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchMilestones]
  );

  // ============================================
  // COMMON FUNCTIONS
  // ============================================

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const changeLimit = useCallback((limit) => {
    setPagination({ page: 1, limit });
  }, []);

  // ============================================
  // NAVIGATION FUNCTIONS
  // ============================================

  const navigateToReleases = useCallback(() => {
    navigate("/subscriptions/releases");
  }, [navigate]);

  const navigateToMilestones = useCallback(() => {
    navigate("/subscriptions/milestones");
  }, [navigate]);

  const navigateToRelease = useCallback(
    (id) => {
      navigate(`/subscriptions/releases/${id}`);
    },
    [navigate]
  );

  const navigateToReleaseEdit = useCallback(
    (id) => {
      navigate(`/subscriptions/releases/${id}/edit`);
    },
    [navigate]
  );

  const navigateToReleaseProgress = useCallback(
    (id) => {
      navigate(`/subscriptions/releases/${id}/progress`);
    },
    [navigate]
  );

  const navigateToNewRelease = useCallback(() => {
    navigate("/subscriptions/releases/new");
  }, [navigate]);

  const navigateToMilestone = useCallback(
    (id) => {
      navigate(`/subscriptions/milestones/${id}`);
    },
    [navigate]
  );

  const navigateToMilestoneEdit = useCallback(
    (id) => {
      navigate(`/subscriptions/milestones/${id}/edit`);
    },
    [navigate]
  );

  const navigateToMilestoneProgress = useCallback(
    (id) => {
      navigate(`/subscriptions/milestones/${id}/progress`);
    },
    [navigate]
  );

  const navigateToNewMilestone = useCallback(() => {
    navigate("/subscriptions/milestones/new");
  }, [navigate]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const releaseCount = useMemo(() => releases.length, [releases]);
  const milestoneCount = useMemo(() => milestones.length, [milestones]);

  const completedReleases = useMemo(() => {
    return releases.filter((r) => r.status === "released").length;
  }, [releases]);

  const completedMilestones = useMemo(() => {
    return milestones.filter((m) => m.status === "completed").length;
  }, [milestones]);

  const inProgressReleases = useMemo(() => {
    return releases.filter(
      (r) => r.status === "in_progress" || r.status === "testing"
    ).length;
  }, [releases]);

  const inProgressMilestones = useMemo(() => {
    return milestones.filter((m) => m.status === "in_progress").length;
  }, [milestones]);

  // ============================================
  // AUTO-FETCH
  // ============================================

  useEffect(() => {
    if (projectId) {
      fetchReleases();
      fetchMilestones();
      fetchReleaseStats();
      fetchMilestoneStats();
      fetchOverdueMilestones();
    }
  }, [projectId]);

  useEffect(() => {
    if (releaseId) {
      fetchRelease();
      fetchReleaseProgress();
    }
  }, [releaseId, fetchRelease, fetchReleaseProgress]);

  useEffect(() => {
    if (milestoneId) {
      fetchMilestone();
      fetchMilestoneProgress();
    }
  }, [milestoneId, fetchMilestone, fetchMilestoneProgress]);

  return {
    // Release State
    releases,
    release,
    releaseProgress,
    releaseStats,

    // Milestone State
    milestones,
    milestone,
    milestoneProgress,
    milestoneStats,
    overdueMilestones,

    // Common State
    loading,
    error,
    pagination,
    filters,
    activeTab,
    setActiveTab,

    // Computed Values
    releaseCount,
    milestoneCount,
    completedReleases,
    completedMilestones,
    inProgressReleases,
    inProgressMilestones,

    // Release Functions
    fetchReleases,
    fetchRelease,
    createRelease,
    updateRelease,
    updateReleaseStatus,
    deleteRelease,
    fetchReleaseProgress,
    fetchReleaseStats,
    generateChangelog,

    // Milestone Functions
    fetchMilestones,
    fetchMilestone,
    createMilestone,
    updateMilestone,
    updateMilestoneStatus,
    deleteMilestone,
    fetchMilestoneProgress,
    fetchMilestoneStats,
    fetchOverdueMilestones,
    bulkUpdateProgress,

    // Common Functions
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,

    // Navigation
    navigateToReleases,
    navigateToMilestones,
    navigateToRelease,
    navigateToReleaseEdit,
    navigateToReleaseProgress,
    navigateToNewRelease,
    navigateToMilestone,
    navigateToMilestoneEdit,
    navigateToMilestoneProgress,
    navigateToNewMilestone,

    // IDs
    projectId,
    releaseId,
    milestoneId,
  };
};

export default useSubscriptions;
