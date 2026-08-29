# Frontend Authentication Module - Complete Folder Structure with Parameters and Returns

## 📁 FOLDER STRUCTURE

```
src/
├── components/
│   └── auth/
│       ├── LoginForm.jsx
│       ├── RegisterForm.jsx
│       ├── ResetPasswordForm.jsx
│       ├── UpdatePasswordForm.jsx
│       ├── SocialLoginButtons.jsx
│       ├── SessionList.jsx
│       ├── SessionStats.jsx
│       ├── ProtectedRoute.jsx
│       └── AuthGuard.jsx
├── hooks/
│   └── useAuth.js
├── services/
│   └── authService.js
├── store/
│   └── authStore.js
├── utils/
│   └── authValidation.js
└── routes/
    └── authRoutes.jsx
```

---

## 📄 STORE

### **authStore.js**

**Exports:** `useAuthStore`

| Method            | Parameters                             | Returns | Description             |
| ----------------- | -------------------------------------- | ------- | ----------------------- |
| `setUser`         | `(user: Object)`                       | `void`  | Sets user data          |
| `setSession`      | `(session: Object)`                    | `void`  | Sets session data       |
| `setLoading`      | `(isLoading: Boolean)`                 | `void`  | Sets loading state      |
| `setError`        | `(error: String)`                      | `void`  | Sets error state        |
| `setSessions`     | `(sessions: Array, meta: Object)`      | `void`  | Sets sessions list      |
| `setSessionStats` | `(stats: Object)`                      | `void`  | Sets session statistics |
| `clearAuth`       | `()`                                   | `void`  | Clears all auth data    |
| `updateUser`      | `(userData: Object)`                   | `void`  | Updates user data       |
| `addSession`      | `(session: Object)`                    | `void`  | Adds new session        |
| `removeSession`   | `(sessionId: String)`                  | `void`  | Removes session         |
| `updateSession`   | `(sessionId: String, updates: Object)` | `void`  | Updates session         |

#### Initial State

```javascript
{
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessions: [],
  sessionsMeta: null,
  sessionStats: null
}
```

#### Persisted State

```javascript
{
  user: Object | null,
  isAuthenticated: Boolean
}
```

---

## 📄 VALIDATION

### **authValidation.js**

**Exports:** `loginSchema`, `registerSchema`, `resetPasswordSchema`, `updatePasswordSchema`, `socialLoginSchema`, `sessionFilterSchema`, `extendSessionSchema`, `revokeAllSchema`, `validateForm`

| Schema                 | Properties                                                  | Validation Rules                                      |
| ---------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| `loginSchema`          | `email`, `password`, `rememberMe`                           | Email format, password min 6                          |
| `registerSchema`       | `email`, `password`, `username`, `full_name`, `acceptTerms` | Email format, password complex, username alphanumeric |
| `resetPasswordSchema`  | `email`                                                     | Email format                                          |
| `updatePasswordSchema` | `currentPassword`, `newPassword`, `confirmPassword`         | Password complex, match confirmation                  |
| `socialLoginSchema`    | `provider`, `code`                                          | Provider enum, code required                          |
| `sessionFilterSchema`  | `page`, `limit`, `status`                                   | Page min 1, limit 1-100, status enum                  |
| `extendSessionSchema`  | `sessionId`, `hours`                                        | UUID format, hours 1-72                               |
| `revokeAllSchema`      | `excludeCurrent`                                            | Boolean                                               |

#### validateForm()

| Parameter | Type         | Required | Description           |
| --------- | ------------ | -------- | --------------------- |
| `schema`  | `Yup.Schema` | Yes      | Yup validation schema |
| `data`    | `Object`     | Yes      | Data to validate      |

**Returns:**

```javascript
{
  isValid: Boolean,
  errors: {
    fieldName: String,
    anotherField: String
  } | null
}
```

---

## 📄 SERVICE

### **authService.js**

**Exports:** `authService`, `AuthService` class

| Method              | Parameters                  | Returns           | Description             |
| ------------------- | --------------------------- | ----------------- | ----------------------- |
| `register`          | `(data: Object)`            | `Promise<Object>` | Registers new user      |
| `login`             | `(data: Object)`            | `Promise<Object>` | Authenticates user      |
| `logout`            | `(allDevices: Boolean)`     | `Promise<Object>` | Logs out user           |
| `refreshToken`      | `()`                        | `Promise<Object>` | Refreshes tokens        |
| `getCurrentUser`    | `()`                        | `Promise<Object>` | Gets current user       |
| `validateSession`   | `()`                        | `Promise<Object>` | Validates session       |
| `resetPassword`     | `(email: String)`           | `Promise<Object>` | Requests password reset |
| `updatePassword`    | `(data: Object)`            | `Promise<Object>` | Updates password        |
| `socialLogin`       | `(data: Object)`            | `Promise<Object>` | Social login            |
| `getSessions`       | `(params: Object)`          | `Promise<Object>` | Gets user sessions      |
| `getSession`        | `(sessionId: String)`       | `Promise<Object>` | Gets specific session   |
| `revokeSession`     | `(sessionId: String)`       | `Promise<Object>` | Revokes a session       |
| `revokeAllSessions` | `(excludeCurrent: Boolean)` | `Promise<Object>` | Revokes all sessions    |
| `getSessionStats`   | `()`                        | `Promise<Object>` | Gets session stats      |
| `extendSession`     | `(data: Object)`            | `Promise<Object>` | Extends session         |

#### register()

| Parameter          | Type      | Required | Description      |
| ------------------ | --------- | -------- | ---------------- |
| `data.email`       | `String`  | Yes      | User email       |
| `data.password`    | `String`  | Yes      | User password    |
| `data.username`    | `String`  | Yes      | Username         |
| `data.full_name`   | `String`  | Yes      | Full name        |
| `data.acceptTerms` | `Boolean` | Yes      | Terms acceptance |

**Returns:**

```javascript
{
  success: true,
  data: {
    user: {
      id: String,
      email: String,
      username: String,
      full_name: String,
      role: String,
      email_verified: Boolean,
      created_at: Date
    },
    expires_in: Number
  }
}
```

#### login()

| Parameter         | Type      | Required | Description      |
| ----------------- | --------- | -------- | ---------------- |
| `data.email`      | `String`  | Yes      | User email       |
| `data.password`   | `String`  | Yes      | User password    |
| `data.rememberMe` | `Boolean` | No       | Remember me flag |

**Returns:**

```javascript
{
  success: true,
  data: {
    user: {
      id: String,
      email: String,
      username: String,
      full_name: String,
      role: String,
      email_verified: Boolean,
      preferences: Object
    },
    session: {
      sessionId: String,
      expiresAt: Date
    },
    expires_in: Number
  }
}
```

#### logout()

| Parameter    | Type      | Required | Default | Description             |
| ------------ | --------- | -------- | ------- | ----------------------- |
| `allDevices` | `Boolean` | No       | `false` | Logout from all devices |

**Returns:**

```javascript
{
  success: true,
  message: 'Logout successful'
}
```

#### refreshToken()

**Parameters:** None

**Returns:**

```javascript
{
  success: true,
  data: {
    expires_in: Number
  }
}
```

#### getSessions()

| Parameter       | Type     | Required | Default    | Description           |
| --------------- | -------- | -------- | ---------- | --------------------- |
| `params.page`   | `Number` | No       | `1`        | Page number           |
| `params.limit`  | `Number` | No       | `20`       | Items per page        |
| `params.status` | `String` | No       | `'active'` | Session status filter |

**Returns:**

```javascript
{
  success: true,
  data: [{
    id: String,
    userId: String,
    deviceInfo: Object,
    ipAddress: String,
    userAgent: String,
    expiresAt: Date,
    isActive: Boolean,
    isCurrent: Boolean,
    lastActivity: Date,
    created_at: Date
  }],
  meta: {
    pagination: {
      total: Number,
      page: Number,
      limit: Number,
      pages: Number
    },
    stats: {
      active: Number,
      expired: Number,
      total: Number
    }
  }
}
```

#### getSessionStats()

**Parameters:** None

**Returns:**

```javascript
{
  success: true,
  data: {
    total: Number,
    active: Number,
    expired: Number,
    devices: {
      'Desktop': Number,
      'Mobile': Number,
      'Tablet': Number
    }
  }
}
```

#### extendSession()

| Parameter        | Type     | Required | Description                  |
| ---------------- | -------- | -------- | ---------------------------- |
| `data.sessionId` | `String` | Yes      | Session ID                   |
| `data.hours`     | `Number` | No       | Hours to extend (default 24) |

**Returns:**

```javascript
{
  success: true,
  data: {
    sessionId: String,
    expiresAt: Date,
    extendedBy: Number // hours
  }
}
```

---

## 📄 HOOKS

### **useAuth.js**

**Exports:** `useAuth` (default), `useAuth` named

| Return Property       | Type                                           | Description                 |
| --------------------- | ---------------------------------------------- | --------------------------- |
| **State**             |                                                |                             |
| `user`                | `Object \| null`                               | Current user data           |
| `session`             | `Object \| null`                               | Current session data        |
| `isAuthenticated`     | `Boolean`                                      | Authentication status       |
| `isLoading`           | `Boolean`                                      | Overall loading state       |
| `error`               | `String \| null`                               | Error message               |
| `sessions`            | `Array`                                        | User sessions               |
| `sessionsMeta`        | `Object \| null`                               | Sessions metadata           |
| `sessionStats`        | `Object \| null`                               | Session statistics          |
| **Query States**      |                                                |                             |
| `isUserLoading`       | `Boolean`                                      | User query loading          |
| `isSessionsLoading`   | `Boolean`                                      | Sessions query loading      |
| `isStatsLoading`      | `Boolean`                                      | Stats query loading         |
| `isValidateLoading`   | `Boolean`                                      | Validate query loading      |
| **Mutation States**   |                                                |                             |
| `isLoggingIn`         | `Boolean`                                      | Login in progress           |
| `isRegistering`       | `Boolean`                                      | Registration in progress    |
| `isLoggingOut`        | `Boolean`                                      | Logout in progress          |
| `isRefreshing`        | `Boolean`                                      | Token refresh in progress   |
| `isResettingPassword` | `Boolean`                                      | Password reset in progress  |
| `isUpdatingPassword`  | `Boolean`                                      | Password update in progress |
| `isSocialLoggingIn`   | `Boolean`                                      | Social login in progress    |
| `isRevokingSession`   | `Boolean`                                      | Session revoke in progress  |
| `isRevokingAll`       | `Boolean`                                      | Revoke all in progress      |
| `isExtendingSession`  | `Boolean`                                      | Session extend in progress  |
| **Methods**           |                                                |                             |
| `login`               | `(data: Object) => Promise<Object>`            | Login user                  |
| `register`            | `(data: Object) => Promise<Object>`            | Register user               |
| `logout`              | `(allDevices: Boolean) => Promise<Object>`     | Logout user                 |
| `refreshToken`        | `() => Promise<Object>`                        | Refresh token               |
| `resetPassword`       | `(email: String) => Promise<Object>`           | Reset password              |
| `updatePassword`      | `(data: Object) => Promise<Object>`            | Update password             |
| `socialLogin`         | `(data: Object) => Promise<Object>`            | Social login                |
| `getSessions`         | `(params: Object) => Promise<Object>`          | Get sessions                |
| `revokeSession`       | `(sessionId: String) => Promise<Object>`       | Revoke session              |
| `revokeAllSessions`   | `(excludeCurrent: Boolean) => Promise<Object>` | Revoke all sessions         |
| `extendSession`       | `(data: Object) => Promise<Object>`            | Extend session              |
| `refetchUser`         | `() => Promise<Object>`                        | Refetch user data           |
| `refetchSessions`     | `() => Promise<Object>`                        | Refetch sessions            |
| `refetchStats`        | `() => Promise<Object>`                        | Refetch stats               |
| `validateSession`     | `() => Promise<Object>`                        | Validate session            |
| `clearError`          | `() => void`                                   | Clear error                 |
| `clearAuth`           | `() => void`                                   | Clear auth data             |

#### login()

| Parameter         | Type      | Required | Description   |
| ----------------- | --------- | -------- | ------------- |
| `data.email`      | `String`  | Yes      | User email    |
| `data.password`   | `String`  | Yes      | User password |
| `data.rememberMe` | `Boolean` | No       | Remember me   |

**Returns:** `Promise<Object>` - API response or validation errors

#### register()

| Parameter          | Type      | Required | Description      |
| ------------------ | --------- | -------- | ---------------- |
| `data.email`       | `String`  | Yes      | User email       |
| `data.password`    | `String`  | Yes      | User password    |
| `data.username`    | `String`  | Yes      | Username         |
| `data.full_name`   | `String`  | Yes      | Full name        |
| `data.acceptTerms` | `Boolean` | Yes      | Terms acceptance |

**Returns:** `Promise<Object>` - API response or validation errors

#### getSessions()

| Parameter       | Type     | Required | Default    | Description    |
| --------------- | -------- | -------- | ---------- | -------------- |
| `params.page`   | `Number` | No       | `1`        | Page number    |
| `params.limit`  | `Number` | No       | `20`       | Items per page |
| `params.status` | `String` | No       | `'active'` | Session status |

**Returns:** `Promise<Object>` - Sessions data or validation errors

---

## 📄 COMPONENTS

### **LoginForm.jsx**

**Exports:** `LoginForm` (default)

| Internal State        | Type      | Default | Description          |
| --------------------- | --------- | ------- | -------------------- |
| `formData.email`      | `String`  | `''`    | Email input          |
| `formData.password`   | `String`  | `''`    | Password input       |
| `formData.rememberMe` | `Boolean` | `false` | Remember me checkbox |
| `showPassword`        | `Boolean` | `false` | Password visibility  |
| `validationErrors`    | `Object`  | `{}`    | Validation errors    |

**Props:** None

**UI Elements:**

- Email input field
- Password input field with toggle
- Remember me checkbox
- Forgot password link
- Submit button with loading state
- Social login buttons
- Sign up link

**Events:**

- `handleChange` - Updates form data
- `handleSubmit` - Submits login form
- Navigates to `/dashboard` on success

---

### **RegisterForm.jsx**

**Exports:** `RegisterForm` (default)

| Internal State         | Type      | Default | Description         |
| ---------------------- | --------- | ------- | ------------------- |
| `formData.email`       | `String`  | `''`    | Email input         |
| `formData.password`    | `String`  | `''`    | Password input      |
| `formData.username`    | `String`  | `''`    | Username input      |
| `formData.full_name`   | `String`  | `''`    | Full name input     |
| `formData.acceptTerms` | `Boolean` | `false` | Terms checkbox      |
| `showPassword`         | `Boolean` | `false` | Password visibility |
| `validationErrors`     | `Object`  | `{}`    | Validation errors   |

**Props:** None

**UI Elements:**

- Email input field
- Username input field
- Full name input field
- Password input field with toggle
- Terms and conditions checkbox
- Submit button with loading state
- Social login buttons
- Sign in link

**Events:**

- `handleChange` - Updates form data
- `handleSubmit` - Submits registration form
- Navigates to `/dashboard` on success

---

### **ResetPasswordForm.jsx**

**Exports:** `ResetPasswordForm` (default)

| Internal State     | Type      | Default | Description       |
| ------------------ | --------- | ------- | ----------------- |
| `email`            | `String`  | `''`    | Email input       |
| `validationErrors` | `Object`  | `{}`    | Validation errors |
| `success`          | `Boolean` | `false` | Success state     |

**Props:** None

**UI Elements:**

- Email input field
- Submit button with loading state
- Back to sign in link

**Events:**

- `handleSubmit` - Submits reset request
- Shows success message on completion

---

### **UpdatePasswordForm.jsx**

**Exports:** `UpdatePasswordForm` (default)

| Internal State             | Type      | Default                                        | Description         |
| -------------------------- | --------- | ---------------------------------------------- | ------------------- |
| `formData.currentPassword` | `String`  | `''`                                           | Current password    |
| `formData.newPassword`     | `String`  | `''`                                           | New password        |
| `formData.confirmPassword` | `String`  | `''`                                           | Confirm password    |
| `showPasswords`            | `Object`  | `{current: false, new: false, confirm: false}` | Password visibility |
| `validationErrors`         | `Object`  | `{}`                                           | Validation errors   |
| `success`                  | `Boolean` | `false`                                        | Success state       |

**Props:** None

**UI Elements:**

- Current password input with toggle
- New password input with toggle
- Confirm password input with toggle
- Password requirements list
- Submit button with loading state

**Events:**

- `handleChange` - Updates form data
- `handleSubmit` - Submits password update
- Shows success message, navigates to `/profile` after 3s

---

### **SocialLoginButtons.jsx**

**Exports:** `SocialLoginButtons` (default)

| Internal State    | Type             | Default | Description                |
| ----------------- | ---------------- | ------- | -------------------------- |
| `loadingProvider` | `String \| null` | `null`  | Currently loading provider |

**Props:** None

**UI Elements:**

- Google login button
- GitHub login button
- Error alert if social login fails

**Events:**

- `handleSocialLogin(provider)` - Initiates social login
- Navigates to `/dashboard` on success

---

### **SessionList.jsx**

**Exports:** `SessionList` (default)

| Internal State       | Type             | Default    | Description                 |
| -------------------- | ---------------- | ---------- | --------------------------- |
| `selectedSessionId`  | `String \| null` | `null`     | Session to revoke           |
| `showRevokeModal`    | `Boolean`        | `false`    | Revoke modal visibility     |
| `showRevokeAllModal` | `Boolean`        | `false`    | Revoke all modal visibility |
| `page`               | `Number`         | `1`        | Current page                |
| `status`             | `String`         | `'active'` | Session status filter       |

**Props:** None

**UI Elements:**

- Session list with device icons
- Session status badges
- Revoke individual session button
- Revoke all sessions button
- Refresh button
- Pagination controls

**Events:**

- `handleRevokeSession` - Revokes selected session
- `handleRevokeAll` - Revokes all sessions
- `handlePageChange` - Changes page

---

### **SessionStats.jsx**

**Exports:** `SessionStats` (default)

**Props:** None

**UI Elements:**

- Stats cards (Total, Active, Expired)
- Device distribution badges

---

### **ProtectedRoute.jsx**

**Exports:** `ProtectedRoute` (default)

| Prop         | Type        | Required | Default    | Description         |
| ------------ | ----------- | -------- | ---------- | ------------------- |
| `children`   | `ReactNode` | Yes      | -          | Children to protect |
| `redirectTo` | `String`    | No       | `'/login'` | Redirect path       |

**Returns:** `ReactNode` - Children or redirect to login

---

### **AuthGuard.jsx**

**Exports:** `AuthGuard` (default)

| Prop           | Type        | Required | Default        | Description             |
| -------------- | ----------- | -------- | -------------- | ----------------------- |
| `children`     | `ReactNode` | Yes      | -              | Children to guard       |
| `requireGuest` | `Boolean`   | No       | `false`        | Require unauthenticated |
| `redirectTo`   | `String`    | No       | `'/dashboard'` | Redirect path           |

**Returns:** `ReactNode` - Children or redirect

---

## 📄 ROUTES

### **authRoutes.jsx**

**Exports:** `authRoutes` (default)

| Route              | Component                    | Guard               | Description          |
| ------------------ | ---------------------------- | ------------------- | -------------------- |
| `/login`           | `LoginForm`                  | `AuthGuard` (guest) | Login page           |
| `/register`        | `RegisterForm`               | `AuthGuard` (guest) | Registration page    |
| `/reset-password`  | `ResetPasswordForm`          | `AuthGuard` (guest) | Reset password page  |
| `/update-password` | `UpdatePasswordForm`         | `ProtectedRoute`    | Update password page |
| `/sessions`        | `SessionList + SessionStats` | `ProtectedRoute`    | Sessions management  |
| `/profile`         | Profile component            | `ProtectedRoute`    | User profile         |
| `/auth/*`          | `Navigate`                   | -                   | Redirect to login    |

**Route Structure:**

```javascript
const authRoutes = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthGuard requireGuest>
          <LoginForm />
        </AuthGuard>
      </Suspense>
    ),
  },
  // ... more routes
];
```

---

## 📊 COMPLETE EXPORT SUMMARY

### authStore.js

```javascript
export const useAuthStore = create(
  persist(authStore, {
    name: "auth-storage",
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
  })
);
// Exports: useAuthStore
```

### authValidation.js

```javascript
export const loginSchema = yup.object({...});
export const registerSchema = yup.object({...});
export const resetPasswordSchema = yup.object({...});
export const updatePasswordSchema = yup.object({...});
export const socialLoginSchema = yup.object({...});
export const sessionFilterSchema = yup.object({...});
export const extendSessionSchema = yup.object({...});
export const revokeAllSchema = yup.object({...});
export const validateForm = async (schema, data) => {...};
```

### authService.js

```javascript
export const authService = new AuthService();
export default authService;
// Exports: authService (default), AuthService (class)
```

### useAuth.js

```javascript
export const useAuth = () => {...};
export default useAuth;
// Exports: useAuth (default), useAuth (named)
```

### authRoutes.jsx

```javascript
const authRoutes = [...];
export default authRoutes;
// Exports: authRoutes (default)
```

### Components

```javascript
export { default as LoginForm } from "./LoginForm";
export { default as RegisterForm } from "./RegisterForm";
export { default as ResetPasswordForm } from "./ResetPasswordForm";
export { default as UpdatePasswordForm } from "./UpdatePasswordForm";
export { default as SocialLoginButtons } from "./SocialLoginButtons";
export { default as SessionList } from "./SessionList";
export { default as SessionStats } from "./SessionStats";
export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as AuthGuard } from "./AuthGuard";
```

---

## 🔄 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Components                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐│
│  │ LoginForm   │  │ RegisterForm│  │SessionList  │  │SessionStats││
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬────┘│
│         │                │                │                │      │
│         └────────────────┼────────────────┼────────────────┘      │
│                          ▼                ▼                       │
│  ┌──────────────────────────────────────────────────────┐         │
│  │                    useAuth Hook                      │         │
│  │  ┌────────────────────────────────────────────┐     │         │
│  │  │  React Query Mutations & Queries           │     │         │
│  │  │  - login, register, logout                │     │         │
│  │  │  - getSessions, revokeSession             │     │         │
│  │  │  - currentUser, validateSession           │     │         │
│  │  └────────────────────────────────────────────┘     │         │
│  └──────────────────────────────────────────────────────┘         │
│                          │                                        │
│                          ▼                                        │
│  ┌──────────────────────────────────────────────────────┐         │
│  │                  authService                         │         │
│  │  - API calls with axios                             │         │
│  │  - Error handling                                   │         │
│  │  - Response formatting                              │         │
│  └──────────────────────────────────────────────────────┘         │
│                          │                                        │
│                          ▼                                        │
│  ┌──────────────────────────────────────────────────────┐         │
│  │                   authStore                          │         │
│  │  - Zustand state management                         │         │
│  │  - Persistent storage (localStorage)                │         │
│  │  - User, session, sessions data                     │         │
│  └──────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ FILE DEPENDENCIES

```javascript
LoginForm.jsx
├── useAuth (hooks)
├── SocialLoginButtons
├── Button (common)
├── Input (common)
├── Checkbox (common)
├── Alert (common)
└── lucide-react icons

RegisterForm.jsx
├── useAuth (hooks)
├── SocialLoginButtons
├── Button (common)
├── Input (common)
├── Checkbox (common)
├── Alert (common)
└── lucide-react icons

ResetPasswordForm.jsx
├── useAuth (hooks)
├── Button (common)
├── Input (common)
├── Alert (common)
└── lucide-react icons

UpdatePasswordForm.jsx
├── useAuth (hooks)
├── Button (common)
├── Input (common)
├── Alert (common)
└── lucide-react icons

SessionList.jsx
├── useAuth (hooks)
├── Button (common)
├── Badge (common)
├── LoadingSpinner (common)
├── EmptyState (common)
├── Alert (common)
├── Modal (common)
└── lucide-react icons

SessionStats.jsx
├── useAuth (hooks)
├── LoadingSpinner (common)
├── EmptyState (common)
├── Badge (common)
└── lucide-react icons

ProtectedRoute.jsx
├── useAuth (hooks)
├── LoadingSpinner (common)
└── react-router-dom

AuthGuard.jsx
├── useAuth (hooks)
├── LoadingSpinner (common)
└── react-router-dom

useAuth.js
├── @tanstack/react-query
├── authService
├── authStore
└── authValidation

authService.js
└── axiosInstance

authStore.js
├── zustand
└── zustand/middleware (persist)

authRoutes.jsx
├── react-router-dom
├── components/auth (all)
└── lucide-react

authValidation.js
└── yup
```
