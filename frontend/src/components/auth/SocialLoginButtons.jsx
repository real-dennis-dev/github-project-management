// src/components/auth/SocialLoginButtons.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FaChrome, FaGithub } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";

const SocialLoginButtons = () => {
  const navigate = useNavigate();
  const { socialLogin, isSocialLoggingIn, error, clearError } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleSocialLogin = async (provider) => {
    setLoadingProvider(provider);
    clearError();

    try {
      // In a real app, you would redirect to OAuth provider
      // For demo, we'll use a mock code
      const result = await socialLogin({
        provider,
        code: "mock_auth_code",
      });

      if (result?.success === false) {
        console.error("Social login failed:", result.errors);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setLoadingProvider(null);
    }
  };

  const isProviderLoading = (provider) => {
    return isSocialLoggingIn && loadingProvider === provider;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-neutral-200 text-neutral-500">
            Or continue with
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => handleSocialLogin("google")}
          disabled={isSocialLoggingIn && loadingProvider !== "google"}
          className="flex items-center justify-center gap-2"
        >
          {isProviderLoading("google") ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FaChrome className="w-4 h-4" />
          )}
          Google
        </Button>

        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => handleSocialLogin("github")}
          disabled={isSocialLoggingIn && loadingProvider !== "github"}
          className="flex items-center justify-center gap-2"
        >
          {isProviderLoading("github") ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FaGithub className="w-4 h-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
