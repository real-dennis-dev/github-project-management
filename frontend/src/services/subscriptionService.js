// src/services/subscriptionService.js
import axiosInstance from "./axiosInstance";

class SubscriptionService {
  constructor() {
    this.basePath = "/api/v1";
  }

  // ============ Subscription Endpoints ============

  async getSubscriptions(params = {}) {
    const response = await axiosInstance.get(`${this.basePath}/subscriptions`, {
      params,
    });
    return response.data;
  }

  async getCurrentSubscription() {
    const response = await axiosInstance.get(
      `${this.basePath}/subscriptions/current`
    );
    return response.data;
  }

  async getSubscription(id) {
    const response = await axiosInstance.get(
      `${this.basePath}/subscriptions/${id}`
    );
    return response.data;
  }

  async createSubscription(data) {
    const response = await axiosInstance.post(
      `${this.basePath}/subscriptions`,
      data
    );
    return response.data;
  }

  async updateSubscription(id, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/subscriptions/${id}`,
      data
    );
    return response.data;
  }

  async cancelSubscription(id, data = {}) {
    const response = await axiosInstance.post(
      `${this.basePath}/subscriptions/${id}/cancel`,
      data
    );
    return response.data;
  }

  // ============ Plan Endpoints ============

  async getPlans(params = {}) {
    const response = await axiosInstance.get(`${this.basePath}/plans`, {
      params,
    });
    return response.data;
  }

  async getPublicPlans() {
    const response = await axiosInstance.get(`${this.basePath}/plans/public`);
    return response.data;
  }

  async getDefaultPlan() {
    const response = await axiosInstance.get(`${this.basePath}/plans/default`);
    return response.data;
  }

  async getPlanOptions() {
    const response = await axiosInstance.get(`${this.basePath}/plans/options`);
    return response.data;
  }

  async getPlan(id) {
    const response = await axiosInstance.get(`${this.basePath}/plans/${id}`);
    return response.data;
  }

  async createPlan(data) {
    const response = await axiosInstance.post(`${this.basePath}/plans`, data);
    return response.data;
  }

  async updatePlan(id, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/plans/${id}`,
      data
    );
    return response.data;
  }

  async deletePlan(id) {
    const response = await axiosInstance.delete(`${this.basePath}/plans/${id}`);
    return response.data;
  }

  // ============ Feature Endpoints ============

  async checkFeatureAccess(featureName) {
    const response = await axiosInstance.get(
      `${this.basePath}/subscriptions/feature/${featureName}/check`
    );
    return response.data;
  }

  async getFeatureUsage() {
    const response = await axiosInstance.get(
      `${this.basePath}/subscriptions/features/usage`
    );
    return response.data;
  }

  // ============ Webhook Endpoints ============

  async getWebhookEvents(params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/webhooks/events`,
      { params }
    );
    return response.data;
  }

  async retryWebhook(id) {
    const response = await axiosInstance.post(
      `${this.basePath}/webhooks/${id}/retry`
    );
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
