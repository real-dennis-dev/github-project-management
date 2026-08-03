// src/components/auth/index.js

// Main exports
export { default as AuthService } from "./AuthService";
export { default as AuthRoutes } from "./AuthRoutes";
export { default as useAuth } from "./useAuth";

// Component exports
export { default as Login } from "./Login";
export { default as Register } from "./Register";
export { default as ForgotPassword } from "./ForgotPassword";
export { default as ResetPassword } from "./ResetPassword";
export { default as ChangePassword } from "./ChangePassword";
export { default as VerifyEmail } from "./VerifyEmail";
export { default as Sessions } from "./Sessions";
export { default as OAuthCallback } from "./OAuthCallback";

// Constants exports
export * from "./AuthConstants";

// Combined export object
const AuthModule = {
  AuthService: require("./AuthService").default,
  AuthRoutes: require("./AuthRoutes").default,
  useAuth: require("./useAuth").default,
  Login: require("./Login").default,
  Register: require("./Register").default,
  ForgotPassword: require("./ForgotPassword").default,
  ResetPassword: require("./ResetPassword").default,
  ChangePassword: require("./ChangePassword").default,
  VerifyEmail: require("./VerifyEmail").default,
  Sessions: require("./Sessions").default,
  OAuthCallback: require("./OAuthCallback").default,
  ...require("./AuthConstants"),
};

export default AuthModule;
