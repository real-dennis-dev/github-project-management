// src/services/authService.js
import axiosInstance from "./axiosInstance";

class AuthService {
  // Authentication endpoints
  async register(data) {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  }

  async login(data) {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  }

  async logout(allDevices = false) {
    const response = await axiosInstance.post("/auth/logout", { allDevices });
    return response.data;
  }

  async refreshToken() {
    const response = await axiosInstance.post("/auth/refresh-token");
    return response.data;
  }

  async getCurrentUser() {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  }

  async validateSession() {
    const response = await axiosInstance.get("/auth/validate");
    return response.data;
  }

  async resetPassword(email) {
    const response = await axiosInstance.post("/auth/reset-password", {
      email,
    });
    return response.data;
  }

  async updatePassword(data) {
    const response = await axiosInstance.put("/auth/update-password", data);
    return response.data;
  }

  async socialLogin(data) {
    const response = await axiosInstance.post("/auth/social", data);
    return response.data;
  }

  // Session endpoints
  async getSessions(params = {}) {
    const response = await axiosInstance.get("/auth/sessions", { params });
    return response.data;
  }

  async getSession(sessionId) {
    const response = await axiosInstance.get(`/auth/sessions/${sessionId}`);
    return response.data;
  }

  async revokeSession(sessionId) {
    const response = await axiosInstance.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  }

  async revokeAllSessions(excludeCurrent = true) {
    const response = await axiosInstance.post("/auth/sessions/revoke-all", {
      excludeCurrent,
    });
    return response.data;
  }

  async getSessionStats() {
    const response = await axiosInstance.get("/auth/sessions/stats");
    return response.data;
  }

  async extendSession(data) {
    const response = await axiosInstance.post("/auth/sessions/extend", data);
    return response.data;
  }
}

export const authService = new AuthService();
export default authService;
