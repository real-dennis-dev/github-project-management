// src/components/releases-milestone/useReleasesMilestone.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import releasesMilestoneService from "./ReleasesMilestoneService";
import {
  DEFAULT_PAGINATION,
  DEFAULT_RELEASE_FILTERS,
  DEFAULT_MILESTONE_FILTERS,
} from "./ReleasesMilestoneConstants";

/**
 * Custom hook for releases and milestones management
 */
export const useReleasesMilestone = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // ============================================
  // RELEASE STATE
  // ============================================
  const [releases, setReleases] = useState([]);
  const [releasesLoading, setReleasesLoading] = useState(false);
  const [releasesError, setReleasesError] = useState(null);
  const [releasePagination, setReleasePagination] =
    useState(DEFAULT_PAGINATION);
  const [releaseFilters, setReleaseFilters] = useState(DEFAULT_RELEASE_FILTERS);
  const [releaseSortBy, setReleaseSortBy] = useState("created_at");
  const [releaseSortOrder, setReleaseSortOrder] = useState("DESC");
  const [releaseStatistics, setReleaseStatistics] = useState(null);

  // ============================================
  // MILESTONE STATE
  // ============================================
  const [milestones, setMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [milestonesError, setMilestonesError] = useState(null);
  const [milestonePagination, setMilestonePagination] =
    useState(DEFAULT_PAGINATION);
  const [milestoneFilters, setMilestoneFilters] = useState(
    DEFAULT_MILESTONE_FILTERS
  );
  const [milestoneSortBy, setMilestoneSortBy] = useState("target_date");
  const [milestoneSortOrder, setMilestoneSortOrder] = useState("ASC");
  const [milestoneStatistics, setMilestoneStatistics] = useState(null);
  const [overdueMilestones, setOverdueMilestones] = useState([]);

  // ============================================
  // RELEASE FUNCTIONS
  // ============================================

  const fetchReleases = useCallback(async () => {
    if (!projectId) return;

    setReleasesLoading(true);
    setReleasesError(null);

    try {
      const params = {
        ...releaseFilters,
        page: releasePagination.page,
        limit: releasePagination.limit,
        sortBy: releaseSortBy,
        sortOrder: releaseSortOrder,
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

      const response = await releasesMilestoneService.getReleases(
        projectId,
        params
      );

      if (response.success) {
        setReleases(response.data || []);
        if (response.meta) {
          setReleasePagination((prev) => ({
            ...prev,
            ...response.meta.pagination,
          }));
          if (response.meta.statistics) {
            setReleaseStatistics(response.meta.statistics);
          }
        }
      } else {
        throw new Error(response.message || "Failed to fetch releases");
      }
    } catch (err) {
      setReleasesError(
        err.message || "An error occurred while fetching releases"
      );
      setReleases([]);
    } finally {
      setReleasesLoading(false);
    }
  }, [
    projectId,
    releaseFilters,
    releasePagination.page,
    releasePagination.limit,
    releaseSortBy,
    releaseSortOrder,
  ]);

  const createRelease = useCallback(
    async (releaseData) => {
      if (!projectId) throw new Error("Project ID is required");

      setReleasesLoading(true);
      setReleasesError(null);

      try {
        const response = await releasesMilestoneService.createRelease(
          projectId,
          releaseData
        );
        if (response.success) {
          await fetchReleases();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create release");
        }
      } catch (err) {
        setReleasesError(
          err.message || "An error occurred while creating the release"
        );
        throw err;
      } finally {
        setReleasesLoading(false);
      }
    },
    [projectId, fetchReleases]
  );

  const updateRelease = useCallback(
    async (releaseId, releaseData) => {
      setReleasesLoading(true);
      setReleasesError(null);

      try {
        const response = await releasesMilestoneService.updateRelease(
          releaseId,
          releaseData
        );
        if (response.success) {
          await fetchReleases();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update release");
        }
      } catch (err) {
        setReleasesError(
          err.message || "An error occurred while updating the release"
        );
        throw err;
      } finally {
        setReleasesLoading(false);
      }
    },
    [fetchReleases]
  );

  const deleteRelease = useCallback(
    async (releaseId) => {
      setReleasesLoading(true);
      setReleasesError(null);

      try {
        const response = await releasesMilestoneService.deleteRelease(
          releaseId
        );
        if (response.success) {
          await fetchReleases();
          return true;
        } else {
          throw new Error(response.message || "Failed to delete release");
        }
      } catch (err) {
        setReleasesError(
          err.message || "An error occurred while deleting the release"
        );
        throw err;
      } finally {
        setReleasesLoading(false);
      }
    },
    [fetchReleases]
  );

  const updateReleaseStatus = useCallback(
    async (releaseId, status) => {
      setReleasesLoading(true);

      try {
        const response = await releasesMilestoneService.updateReleaseStatus(
          releaseId,
          status
        );
        if (response.success) {
          await fetchReleases();
          return response.data;
        }
      } catch (err) {
        throw err;
      } finally {
        setReleasesLoading(false);
      }
    },
    [fetchReleases]
  );

  const getReleaseById = useCallback(async (releaseId) => {
    if (!releaseId) return null;

    setReleasesLoading(true);
    try {
      const response = await releasesMilestoneService.getReleaseById(releaseId);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      throw err;
    } finally {
      setReleasesLoading(false);
    }
  }, []);

  const getReleaseProgress = useCallback(async (releaseId) => {
    if (!releaseId) return null;

    try {
      const response = await releasesMilestoneService.getReleaseProgress(
        releaseId
      );
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const generateChangelog = useCallback(async (releaseId) => {
    if (!releaseId) return null;

    try {
      const response = await releasesMilestoneService.generateChangelog(
        releaseId
      );
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const addFeaturesToRelease = useCallback(
    async (releaseId, featureIds) => {
      setReleasesLoading(true);
      try {
        const response = await releasesMilestoneService.addFeaturesToRelease(
          releaseId,
          featureIds
        );
        if (response.success) {
          await fetchReleases();
          return response.data;
        }
      } catch (err) {
        throw err;
      } finally {
        setReleasesLoading(false);
      }
    },
    [fetchReleases]
  );

  const removeFeatureFromRelease = useCallback(
    async (releaseId, featureId) => {
      setReleasesLoading(true);
      try {
        const response =
          await releasesMilestoneService.removeFeatureFromRelease(
            releaseId,
            featureId
          );
        if (response.success) {
          await fetchReleases();
          return true;
        }
      } catch (err) {
        throw err;
      } finally {
        setReleasesLoading(false);
      }
    },
    [fetchReleases]
  );

  // ============================================
  // MILESTONE FUNCTIONS
  // ============================================

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;

    setMilestonesLoading(true);
    setMilestonesError(null);

    try {
      const params = {
        ...milestoneFilters,
        page: milestonePagination.page,
        limit: milestonePagination.limit,
        sortBy: milestoneSortBy,
        sortOrder: milestoneSortOrder,
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

      const response = await releasesMilestoneService.getMilestones(
        projectId,
        params
      );

      if (response.success) {
        setMilestones(response.data || []);
        if (response.meta) {
          setMilestonePagination((prev) => ({
            ...prev,
            ...response.meta.pagination,
          }));
          if (response.meta.statistics) {
            setMilestoneStatistics(response.meta.statistics);
          }
        }
      } else {
        throw new Error(response.message || "Failed to fetch milestones");
      }
    } catch (err) {
      setMilestonesError(
        err.message || "An error occurred while fetching milestones"
      );
      setMilestones([]);
    } finally {
      setMilestonesLoading(false);
    }
  }, [
    projectId,
    milestoneFilters,
    milestonePagination.page,
    milestonePagination.limit,
    milestoneSortBy,
    milestoneSortOrder,
  ]);

  const createMilestone = useCallback(
    async (milestoneData) => {
      if (!projectId) throw new Error("Project ID is required");

      setMilestonesLoading(true);
      setMilestonesError(null);

      try {
        const response = await releasesMilestoneService.createMilestone(
          projectId,
          milestoneData
        );
        if (response.success) {
          await fetchMilestones();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create milestone");
        }
      } catch (err) {
        setMilestonesError(
          err.message || "An error occurred while creating the milestone"
        );
        throw err;
      } finally {
        setMilestonesLoading(false);
      }
    },
    [projectId, fetchMilestones]
  );

  const updateMilestone = useCallback(
    async (milestoneId, milestoneData) => {
      setMilestonesLoading(true);
      setMilestonesError(null);

      try {
        const response = await releasesMilestoneService.updateMilestone(
          milestoneId,
          milestoneData
        );
        if (response.success) {
          await fetchMilestones();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update milestone");
        }
      } catch (err) {
        setMilestonesError(
          err.message || "An error occurred while updating the milestone"
        );
        throw err;
      } finally {
        setMilestonesLoading(false);
      }
    },
    [fetchMilestones]
  );

  const deleteMilestone = useCallback(
    async (milestoneId) => {
      setMilestonesLoading(true);
      setMilestonesError(null);

      try {
        const response = await releasesMilestoneService.deleteMilestone(
          milestoneId
        );
        if (response.success) {
          await fetchMilestones();
          return true;
        } else {
          throw new Error(response.message || "Failed to delete milestone");
        }
      } catch (err) {
        setMilestonesError(
          err.message || "An error occurred while deleting the milestone"
        );
        throw err;
      } finally {
        setMilestonesLoading(false);
      }
    },
    [fetchMilestones]
  );

  const updateMilestoneStatus = useCallback(
    async (milestoneId, status) => {
      setMilestonesLoading(true);

      try {
        const response = await releasesMilestoneService.updateMilestoneStatus(
          milestoneId,
          status
        );
        if (response.success) {
          await fetchMilestones();
          return response.data;
        }
      } catch (err) {
        throw err;
      } finally {
        setMilestonesLoading(false);
      }
    },
    [fetchMilestones]
  );

  const getMilestoneById = useCallback(async (milestoneId) => {
    if (!milestoneId) return null;

    setMilestonesLoading(true);
    try {
      const response = await releasesMilestoneService.getMilestoneById(
        milestoneId
      );
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      throw err;
    } finally {
      setMilestonesLoading(false);
    }
  }, []);

  const getMilestoneProgress = useCallback(async (milestoneId) => {
    if (!milestoneId) return null;

    try {
      const response = await releasesMilestoneService.getMilestoneProgress(
        milestoneId
      );
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const fetchOverdueMilestones = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await releasesMilestoneService.getOverdueMilestones(
        projectId
      );
      if (response.success) {
        setOverdueMilestones(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch overdue milestones:", err);
    }
  }, [projectId]);

  const bulkUpdateMilestones = useCallback(
    async (updates) => {
      if (!projectId) return;

      setMilestonesLoading(true);
      try {
        const response = await releasesMilestoneService.bulkUpdateMilestones(
          projectId,
          updates
        );
        if (response.success) {
          await fetchMilestones();
          return response.data;
        }
      } catch (err) {
        throw err;
      } finally {
        setMilestonesLoading(false);
      }
    },
    [projectId, fetchMilestones]
  );

  // ============================================
  // FILTER & PAGINATION FUNCTIONS
  // ============================================

  // Release filters
  const updateReleaseFilters = useCallback((newFilters) => {
    setReleaseFilters((prev) => ({ ...prev, ...newFilters }));
    setReleasePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const resetReleaseFilters = useCallback(() => {
    setReleaseFilters(DEFAULT_RELEASE_FILTERS);
    setReleasePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const changeReleasePage = useCallback((page) => {
    setReleasePagination((prev) => ({ ...prev, page }));
  }, []);

  const changeReleaseLimit = useCallback((limit) => {
    setReleasePagination({ page: 1, limit });
  }, []);

  const changeReleaseSort = useCallback((sortBy, sortOrder) => {
    setReleaseSortBy(sortBy);
    setReleaseSortOrder(sortOrder);
    setReleasePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Milestone filters
  const updateMilestoneFilters = useCallback((newFilters) => {
    setMilestoneFilters((prev) => ({ ...prev, ...newFilters }));
    setMilestonePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const resetMilestoneFilters = useCallback(() => {
    setMilestoneFilters(DEFAULT_MILESTONE_FILTERS);
    setMilestonePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const changeMilestonePage = useCallback((page) => {
    setMilestonePagination((prev) => ({ ...prev, page }));
  }, []);

  const changeMilestoneLimit = useCallback((limit) => {
    setMilestonePagination({ page: 1, limit });
  }, []);

  const changeMilestoneSort = useCallback((sortBy, sortOrder) => {
    setMilestoneSortBy(sortBy);
    setMilestoneSortOrder(sortOrder);
    setMilestonePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // ============================================
  // NAVIGATION FUNCTIONS
  // ============================================

  const navigateToReleaseDetail = useCallback(
    (releaseId) => {
      navigate(`/releases-milestone/releases/${releaseId}`);
    },
    [navigate]
  );

  const navigateToReleaseEdit = useCallback(
    (releaseId) => {
      navigate(`/releases-milestone/releases/${releaseId}/edit`);
    },
    [navigate]
  );

  const navigateToNewRelease = useCallback(() => {
    navigate("/releases-milestone/releases/new");
  }, [navigate]);

  const navigateToMilestoneDetail = useCallback(
    (milestoneId) => {
      navigate(`/releases-milestone/milestones/${milestoneId}`);
    },
    [navigate]
  );

  const navigateToMilestoneEdit = useCallback(
    (milestoneId) => {
      navigate(`/releases-milestone/milestones/${milestoneId}/edit`);
    },
    [navigate]
  );

  const navigateToNewMilestone = useCallback(() => {
    navigate("/releases-milestone/milestones/new");
  }, [navigate]);

  // ============================================
  // AUTO-FETCH
  // ============================================

  useEffect(() => {
    if (projectId) {
      fetchReleases();
      fetchMilestones();
      fetchOverdueMilestones();
    }
  }, [projectId]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Release state
    releases,
    releasesLoading,
    releasesError,
    releasePagination,
    releaseFilters,
    releaseSortBy,
    releaseSortOrder,
    releaseStatistics,

    // Milestone state
    milestones,
    milestonesLoading,
    milestonesError,
    milestonePagination,
    milestoneFilters,
    milestoneSortBy,
    milestoneSortOrder,
    milestoneStatistics,
    overdueMilestones,

    // Release functions
    fetchReleases,
    createRelease,
    updateRelease,
    deleteRelease,
    updateReleaseStatus,
    getReleaseById,
    getReleaseProgress,
    generateChangelog,
    addFeaturesToRelease,
    removeFeatureFromRelease,

    // Milestone functions
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneStatus,
    getMilestoneById,
    getMilestoneProgress,
    fetchOverdueMilestones,
    bulkUpdateMilestones,

    // Release filter functions
    updateReleaseFilters,
    resetReleaseFilters,
    changeReleasePage,
    changeReleaseLimit,
    changeReleaseSort,

    // Milestone filter functions
    updateMilestoneFilters,
    resetMilestoneFilters,
    changeMilestonePage,
    changeMilestoneLimit,
    changeMilestoneSort,

    // Navigation
    navigateToReleaseDetail,
    navigateToReleaseEdit,
    navigateToNewRelease,
    navigateToMilestoneDetail,
    navigateToMilestoneEdit,
    navigateToNewMilestone,

    // Project ID
    projectId,
  };
};

export default useReleasesMilestone;
