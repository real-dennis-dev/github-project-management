// src/hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { 
  loginSchema, 
  registerSchema, 
  resetPasswordSchema, 
  updatePasswordSchema,
  socialLoginSchema,
  sessionFilterSchema,
  extendSessionSchema,
  validateForm 
} from '../utils/authValidation';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const store = useAuthStore();

  // Queries
  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getCurrentUser,
    enabled: store.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    onSuccess: (data) => {
      if (data.success && data.data) {
        store.setUser(data.data.user);
        store.setSession(data.data.session);
      }
    },
    onError: () => {
      store.clearAuth();
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => authService.getSessions({ status: 'active' }),
    enabled: store.isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    onSuccess: (data) => {
      if (data.success) {
        store.setSessions(data.data, data.meta);
      }
    },
  });

  const sessionStatsQuery = useQuery({
    queryKey: ['auth', 'sessions', 'stats'],
    queryFn: authService.getSessionStats,
    enabled: store.isAuthenticated,
    staleTime: 60 * 1000,
    onSuccess: (data) => {
      if (data.success) {
        store.setSessionStats(data.data);
      }
    },
  });

  const validateSessionQuery = useQuery({
    queryKey: ['auth', 'validate'],
    queryFn: authService.validateSession,
    enabled: store.isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
    onError: () => {
      store.clearAuth();
    },
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.success && data.data) {
        store.setUser(data.data.user);
        store.setSession({ expires_in: data.data.expires_in });
        queryClient.invalidateQueries(['auth']);
      }
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data.success && data.data) {
        store.setUser(data.data.user);
        store.setSession({ expires_in: data.data.expires_in });
        queryClient.invalidateQueries(['auth']);
      }
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: (allDevices) => authService.logout(allDevices),
    onSuccess: () => {
      store.clearAuth();
      queryClient.clear();
      window.dispatchEvent(new Event('auth:logout'));
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Logout failed');
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      if (data.success && data.data) {
        store.setSession({ expires_in: data.data.expires_in });
      }
    },
    onError: () => {
      store.clearAuth();
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      store.setError(null);
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Password reset failed');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: (data) => {
      store.setError(null);
      return data;
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Password update failed');
    },
  });

  const socialLoginMutation = useMutation({
    mutationFn: authService.socialLogin,
    onSuccess: (data) => {
      if (data.success && data.data) {
        store.setUser(data.data.user);
        store.setSession({ expires_in: data.data.expires_in });
        queryClient.invalidateQueries(['auth']);
      }
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Social login failed');
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: authService.revokeSession,
    onSuccess: (_, sessionId) => {
      store.removeSession(sessionId);
      queryClient.invalidateQueries(['auth', 'sessions']);
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Failed to revoke session');
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: authService.revokeAllSessions,
    onSuccess: (data) => {
      if (data.success && data.data) {
        const currentSession = store.session;
        store.setSessions(currentSession ? [currentSession] : [], null);
        queryClient.invalidateQueries(['auth', 'sessions']);
        return data;
      }
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Failed to revoke sessions');
    },
  });

  const extendSessionMutation = useMutation({
    mutationFn: authService.extendSession,
    onSuccess: (data, variables) => {
      if (variables.sessionId) {
        store.updateSession(variables.sessionId, { 
          expiresAt: new Date(Date.now() + variables.hours * 3600000).toISOString() 
        });
      }
      queryClient.invalidateQueries(['auth', 'sessions']);
      return data;
    },
    onError: (error) => {
      store.setError(error.response?.data?.error || 'Failed to extend session');
    },
  });

  // Helper functions
  const login = async (data) => {
    const validation = await validateForm(loginSchema, data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    return loginMutation.mutateAsync(data);
  };

  const register = async (data) => {
    const validation = await validateForm(registerSchema, data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    return registerMutation.mutateAsync(data);
  };

  const logout = (allDevices = false) => {
    return logoutMutation.mutateAsync(allDevices);
  };

  const refreshToken = () => {
    return refreshTokenMutation.mutateAsync();
  };

  const resetPassword = async (email) => {
    const validation = await validateForm(resetPasswordSchema, { email });
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    return resetPasswordMutation.mutateAsync(email);
  };

  const updatePassword = async (data) => {
    const validation = await validateForm(updatePasswordSchema, data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    return updatePasswordMutation.mutateAsync(data);
  };

  const socialLogin = async (data) => {
    const validation = await validateForm(socialLoginSchema, data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    return socialLoginMutation.mutateAsync(data);
  };

  const getSessions = async (params = {}) => {
    const validation = await validateForm(sessionFilterSchema, params);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    return authService.getSessions(params);
  };

  const revokeSession = (sessionId) => {
    return revokeSessionMutation.mutateAsync(sessionId);
  };

  const revokeAllSessions = (excludeCurrent = true) => {
    return revokeAllSessionsMutation.mutateAsync(excludeCurrent);
  };

  const extendSession = async (data) => {
    const validation = await validateForm(extendSessionSchema, data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    return extendSessionMutation.mutateAsync(data);
  };

  const refetchUser = () => {
    return currentUserQuery.refetch();
  };

  const refetchSessions = () => {
    return sessionsQuery.refetch();
  };

  const refetchStats = () => {
    return sessionStatsQuery.refetch();
  };

  return {
    // State
    user: store.user,
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading || currentUserQuery.isLoading,
    error: store.error,
    sessions: store.sessions,
    sessionsMeta: store.sessionsMeta,
    sessionStats: store.sessionStats,

    // Query states
    isUserLoading: currentUserQuery.isLoading,
    isSessionsLoading: sessionsQuery.isLoading,
    isStatsLoading: sessionStatsQuery.isLoading,
    isValidateLoading: validateSessionQuery.isLoading,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshTokenMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isSocialLoggingIn: socialLoginMutation.isPending,
    isRevokingSession: revokeSessionMutation.isPending,
    isRevokingAll: revokeAllSessionsMutation.isPending,
    isExtendingSession: extendSessionMutation.isPending,

    // Methods
    login,
    register,
    logout,
    refreshToken,
    resetPassword,
    updatePassword,
    socialLogin,
    getSessions,
    revokeSession,
    revokeAllSessions,
    extendSession,
    refetchUser,
    refetchSessions,
    refetchStats,
    validateSession: validateSessionQuery.refetch,
    clearError: () => store.setError(null),
    clearAuth: () => store.clearAuth(),
  };
};

export default useAuth;