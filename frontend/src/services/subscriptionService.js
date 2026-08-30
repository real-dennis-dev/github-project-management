// src/services/subscriptionService.js
import axiosInstance from "./axiosInstance";

class SubscriptionService {
  // ============ Subscription Endpoints ============

  async getSubscriptions(params = {}) {
    const response = await axiosInstance.get(`/subscriptions`, {
      params,
    });
    return response.data;
  }

  async getCurrentSubscription() {
    const response = await axiosInstance.get(`/subscriptions/current`);
    return response.data;
  }

  async getSubscription(id) {
    const response = await axiosInstance.get(`/subscriptions/${id}`);
    return response.data;
  }

  async createSubscription(data) {
    const response = await axiosInstance.post(`/subscriptions`, data);
    return response.data;
  }

  async updateSubscription(id, data) {
    const response = await axiosInstance.put(`/subscriptions/${id}`, data);
    return response.data;
  }

  async cancelSubscription(id, data = {}) {
    const response = await axiosInstance.post(
      `/subscriptions/${id}/cancel`,
      data
    );
    return response.data;
  }

  // ============ Plan Endpoints ============

  async getPlans(params = {}) {
    const response = await axiosInstance.get(`/plans`, {
      params,
    });
    return response.data;
  }

  async getPublicPlans() {
    const response = await axiosInstance.get(`/plans/public`);
    return response.data;
  }

  async getDefaultPlan() {
    const response = await axiosInstance.get(`/plans/default`);
    return response.data;
  }

  async getPlanOptions() {
    const response = await axiosInstance.get(`/plans/options`);
    return response.data;
  }

  async getPlan(id) {
    const response = await axiosInstance.get(`/plans/${id}`);
    return response.data;
  }

  async createPlan(data) {
    const response = await axiosInstance.post(`/plans`, data);
    return response.data;
  }

  async updatePlan(id, data) {
    const response = await axiosInstance.put(`/plans/${id}`, data);
    return response.data;
  }

  async deletePlan(id) {
    const response = await axiosInstance.delete(`/plans/${id}`);
    return response.data;
  }

  // ============ Feature Endpoints ============

  async checkFeatureAccess(featureName) {
    const response = await axiosInstance.get(
      `/subscriptions/feature/${featureName}/check`
    );
    return response.data;
  }

  async getFeatureUsage() {
    const response = await axiosInstance.get(`/subscriptions/features/usage`);
    return response.data;
  }

  // ============ Webhook Endpoints ============

  async getWebhookEvents(params = {}) {
    const response = await axiosInstance.get(`/webhooks/events`, { params });
    return response.data;
  }

  async retryWebhook(id) {
    const response = await axiosInstance.post(`/webhooks/${id}/retry`);
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
