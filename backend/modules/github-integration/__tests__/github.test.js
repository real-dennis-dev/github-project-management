const request = require("supertest");
const app = require("../../../server");
const { supabase } = require("../../../common/config/supabase");

describe("GitHub Integration Module", () => {
  let projectId;
  let repositoryId;
  let authToken;

  beforeAll(async () => {
    // Setup test data
    const { data: project } = await supabase
      .from("projects")
      .insert({
        name: "Test Project",
        description: "Test project for GitHub integration",
      })
      .select()
      .single();

    projectId = project.id;

    // Get auth token
    authToken = "test-token";
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase
      .from("github_repositories")
      .delete()
      .eq("project_id", projectId);
    await supabase.from("projects").delete().eq("id", projectId);
  });

  describe("GET /api/projects/:projectId/repositories", () => {
    it("should return empty repositories list", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/repositories`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe("POST /api/projects/:projectId/repositories", () => {
    it("should connect a repository successfully", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/repositories`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          repoUrl: "https://github.com/test-user/test-repo",
          defaultBranch: "main",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.repo_name).toBe("test-repo");

      repositoryId = response.body.data.id;
    });

    it("should return error for invalid repository URL", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/repositories`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          repoUrl: "invalid-url",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/repositories/:repositoryId/commits", () => {
    it("should return commits list", async () => {
      const response = await request(app)
        .get(`/api/repositories/${repositoryId}/commits`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/repositories/:repositoryId/sync", () => {
    it("should sync repository data", async () => {
      const response = await request(app)
        .post(`/api/repositories/${repositoryId}/sync`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("DELETE /api/repositories/:repositoryId", () => {
    it("should disconnect repository successfully", async () => {
      const response = await request(app)
        .delete(`/api/repositories/${repositoryId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("disconnected");
    });
  });
});
