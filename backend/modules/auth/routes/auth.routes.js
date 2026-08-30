const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const ValidationMiddleware = require("../../../common/middleware/validation.middleware");
const authValidation = require("../validations/auth.validation");

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 */
router.post(
  "/register",
  ValidationMiddleware.validateRequest(authValidation.register),
  AuthController.register.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 */
router.post(
  "/login",
  ValidationMiddleware.validateRequest(authValidation.login),
  AuthController.login.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login with Google
 *     tags: [Auth]
 */
router.post(
  "/google",
  ValidationMiddleware.validateRequest(authValidation.oauth),
  AuthController.googleLogin.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/github:
 *   post:
 *     summary: Login with GitHub
 *     tags: [Auth]
 */
router.post(
  "/github",
  ValidationMiddleware.validateRequest(authValidation.oauth),
  AuthController.githubLogin.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email
 *     tags: [Auth]
 */
router.post(
  "/verify-email",
  ValidationMiddleware.validateRequest(authValidation.verifyEmail),
  AuthController.verifyEmail.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
router.post(
  "/forgot-password",
  ValidationMiddleware.validateRequest(authValidation.forgotPassword),
  AuthController.forgotPassword.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post(
  "/reset-password",
  ValidationMiddleware.validateRequest(authValidation.resetPassword),
  AuthController.resetPassword.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post("/refresh-token", AuthController.refreshToken.bind(AuthController));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the authenticated user if a valid session exists, otherwise returns null for guests.
 *     tags: [Auth]
 */
router.get(
  "/me",
  AuthMiddleware.optionalAuth,
  AuthController.getCurrentUser.bind(AuthController)
);
// ============================================
// PROTECTED ROUTES
// ============================================

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validate current session
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.get(
  "/validate",
  AuthMiddleware.optionalAuth,
  AuthController.validateSession.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/state:
 *   get:
 *     summary: Get authentication state for public pages
 *     description: Returns current user if logged in, otherwise returns guest state
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.get(
  "/state",
  AuthMiddleware.optionalAuth,
  AuthController.getAuthState.bind(AuthController)
);
/**
 * @swagger
 * /api/auth/sessions/stats:
 *   get:
 *     summary: Get session statistics
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.get(
  "/sessions/stats",
  AuthMiddleware.authenticate,
  AuthController.getSessionStats.bind(AuthController)
);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from current session
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.post(
  "/logout",
  AuthMiddleware.authenticate,
  AuthController.logout.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/logout/all:
 *   post:
 *     summary: Logout from all sessions
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.post(
  "/logout/all",
  AuthMiddleware.authenticate,
  AuthController.logoutAll.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/logout/session/{sessionId}:
 *   post:
 *     summary: Logout from specific session
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.post(
  "/logout/session/:sessionId",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams(authValidation.sessionId),
  AuthController.logoutSession.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Get all active sessions
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.get(
  "/sessions",
  AuthMiddleware.authenticate,
  AuthController.getSessions.bind(AuthController)
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     security:
 *       - cookieAuth: []
 *     tags: [Auth]
 */
router.post(
  "/change-password",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateRequest(authValidation.changePassword),
  AuthController.changePassword.bind(AuthController)
);

module.exports = router;
