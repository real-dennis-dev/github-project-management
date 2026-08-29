// src/components/github/RepositoryConnect.jsx
import React, { useState } from "react";
import { useGithub } from "../../hooks/useGithub";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Alert } from "../common";
import { Github, Link } from "lucide-react";

const RepositoryConnect = ({ projectId }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [accessToken, setAccessToken] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const { connectRepository, isConnecting, error, clearError } = useGithub();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    const data = {
      repoUrl,
      defaultBranch,
      accessToken: accessToken || undefined,
    };

    try {
      const result = await connectRepository(projectId, data);
      if (result.success) {
        toast.success("Repository connected successfully");
        setRepoUrl("");
        setDefaultBranch("main");
        setAccessToken("");
      }
    } catch (err) {
      // Errors handled by hook
    }
  };

  return (
    <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
      <h2 className="text-xl font-bold text-neutral-900 mb-4">
        Connect Repository
      </h2>
      {error && (
        <Alert variant="error" onClose={clearError} className="mb-4">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Repository URL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            error={validationErrors.repoUrl}
            required
            fullWidth
          />
          <p className="mt-1 text-xs text-neutral-500">
            Enter the full GitHub repository URL
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Default Branch"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              placeholder="main"
              error={validationErrors.defaultBranch}
              helper="Defaults to 'main'"
              fullWidth
            />
          </div>
          <div>
            <Input
              label="Access Token (Optional)"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxx"
              error={validationErrors.accessToken}
              helper="For private repositories"
              type="password"
              fullWidth
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={isConnecting}
          disabled={!repoUrl.trim() || isConnecting}
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          <Github className="w-5 h-5" />
          <Link className="w-4 h-4" />
          Connect Repository
        </Button>
      </form>
    </div>
  );
};

export default RepositoryConnect;
