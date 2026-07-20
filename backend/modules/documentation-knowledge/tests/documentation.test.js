import request from "supertest";
import app from "../../../server.js";

describe("Documentation Module", () => {
  let authToken;
  let projectId;
  let docId;

  beforeAll(async () => {
    // Get auth token and project ID for testing
    const authResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "test123" });
    authToken = authResponse.body.data.token;

    const projectResponse = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${authToken}`);
    projectId = projectResponse.body.data[0].id;
  });

  describe("POST /api/projects/:projectId/documentation", () => {
    it("should create documentation", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/documentation`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "API Documentation",
          content: "This is the API documentation content",
          doc_type: "api",
          tags: ["api", "documentation", "backend"],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe("API Documentation");

      docId = response.body.data.id;
    });
  });

  describe("GET /api/projects/:projectId/documentation", () => {
    it("should get project documentation", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/documentation`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty("pagination");
    });
  });

  describe("GET /api/documentation/:id", () => {
    it("should get documentation by ID", async () => {
      const response = await request(app)
        .get(`/api/documentation/${docId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(docId);
    });
  });

  describe("PUT /api/documentation/:id", () => {
    it("should update documentation", async () => {
      const response = await request(app)
        .put(`/api/documentation/${docId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated API Documentation",
          content: "Updated content",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated API Documentation");
      expect(response.body.data.version).toBeGreaterThan(1);
    });
  });

  describe("GET /api/projects/:projectId/documentation/search", () => {
    it("should search documentation", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/documentation/search?query=api`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("DELETE /api/documentation/:id", () => {
    it("should delete documentation", async () => {
      const response = await request(app)
        .delete(`/api/documentation/${docId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
