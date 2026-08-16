Based on the provided code, here is a comprehensive breakdown of the functions, their parameters, return values, and the overall folder structure.

### Overall Folder Structure

The application follows a feature-based architecture, separating concerns into distinct layers (services, contexts, components, screens, etc.).

```
src/
├── components/
│   ├── common/
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Chip.jsx
│   │   ├── Divider.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Icon.jsx
│   │   ├── Input.jsx
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   ├── Pagination.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Select.jsx
│   │   ├── Switch.jsx
│   │   ├── Textarea.jsx
│   │   └── Toast.jsx
│   └── project-management/
│       └── ProjectCard.jsx
├── config/
│   ├── apiConfig.js
│   ├── databaseConfig.js
│   ├── githubConfig.js
│   └── navigationConfig.js
├── context/
│   ├── AuthContext.jsx
│   ├── NotificationContext.jsx
│   ├── ProjectContext.jsx
│   ├── SettingsContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useApi.js
│   ├── useDebounce.js
│   ├── useForm.js
│   └── usePagination.js
├── navigation/
│   ├── AppNavigator.jsx
│   ├── AuthNavigator.jsx
│   ├── navigationConfig.js
│   ├── RootNavigator.jsx
│   └── TabNavigator.jsx
├── screens/
│   ├── auth/
│   │   ├── ForgotPasswordScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   └── ResetPasswordScreen.jsx
│   ├── main/
│   │   ├── HomeScreen.jsx
│   │   ├── ProfileScreen.jsx
│   │   └── SettingsScreen.jsx
│   └── project/
│       ├── DashboardScreen.jsx
│       ├── ProjectCreateScreen.jsx
│       ├── ProjectDetailScreen.jsx
│       ├── ProjectEditScreen.jsx
│       └── ProjectListScreen.jsx
├── services/
│   ├── aiService.js
│   ├── apiService.js
│   ├── bugService.js
│   ├── databaseService.js
│   ├── documentationService.js
│   ├── featureService.js
│   ├── githubService.js
│   ├── httpClient.js
│   ├── knowledgeBaseService.js
│   ├── progressService.js
│   ├── projectService.js
│   └── storageService.js
└── utils/
    ├── constants.js
    ├── dateUtils.js
    ├── errorUtils.js
    ├── formatUtils.js
    ├── helpers.js
    ├── navigationUtils.js
    ├── storageUtils.js
    ├── types.js
    └── validationUtils.js
```

---

### Utility Functions (Utils)

#### 1. `dateUtils.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `formatDate` | `date` (Date\|string), `formatStr` (string) | `string` | Formats a date object or string into a specified string format. |
| `formatDateTime` | `date` (Date\|string) | `string` | Formats a date to a 'MMM dd, yyyy HH:mm' format. |
| `parseDate` | `dateString` (string), `formatStr` (string) | `Date\|null` | Parses a date string into a Date object based on a format. |
| `getDateRange` | `start` (Date\|string), `end` (Date\|string), `interval` (string) | `Array<Date>` | Generates an array of dates between a start and end date (daily, weekly, monthly). |
| `isToday` | `date` (Date\|string) | `boolean` | Checks if a given date is today. |
| `isYesterday` | `date` (Date\|string) | `boolean` | Checks if a given date is yesterday. |
| `getRelativeTime` | `date` (Date\|string), `options` (Object) | `string` | Returns a human-readable relative time string (e.g., "2 days ago"). |
| `formatMonthYear` | `date` (Date\|string) | `string` | Formats a date to a 'MMMM yyyy' format. |
| `formatTime` | `date` (Date\|string) | `string` | Formats a date to an 'HH:mm' format. |
| `daysBetween` | `date1` (Date\|string), `date2` (Date\|string) | `number` | Calculates the number of days between two dates. |
| `isDateInRange` | `date` (Date\|string), `start` (Date\|string), `end` (Date\|string) | `boolean` | Checks if a date falls within a given range. |
| `startOfMonth` | `date` (Date\|string) | `Date` | Returns a new Date object set to the start of the month. |
| `endOfMonth` | `date` (Date\|string) | `Date` | Returns a new Date object set to the end of the month. |
| `startOfWeek` | `date` (Date\|string), `weekStartsOn` (number) | `Date` | Returns a new Date object set to the start of the week (default Monday). |
| `endOfWeek` | `date` (Date\|string), `weekStartsOn` (number) | `Date` | Returns a new Date object set to the end of the week. |
| `addDays` | `date` (Date\|string), `days` (number) | `Date` | Adds a specified number of days to a date. |
| `subDays` | `date` (Date\|string), `days` (number) | `Date` | Subtracts a specified number of days from a date. |
| `getTimeDifference` | `date` (Date\|string), `baseDate` (Date\|string) | `string` | Returns a human-readable difference between two dates. |
| `isSameDay` | `date1` (Date\|string), `date2` (Date\|string) | `boolean` | Checks if two dates fall on the same day. |

#### 2. `validationUtils.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `validateEmail` | `email` (string) | `boolean` | Validates an email address format. |
| `validateURL` | `url` (string) | `boolean` | Validates a URL format. |
| `validateUUID` | `uuid` (string) | `boolean` | Validates a UUID format. |
| `validateEnum` | `value` (any), `enumType` (Array) | `boolean` | Checks if a value exists in a given array. |
| `validatePhone` | `phone` (string) | `boolean` | Validates a phone number format. |
| `validateRequired` | `value` (any) | `boolean` | Checks if a value is not null, undefined, or empty. |
| `validateMinLength` | `value` (string), `min` (number) | `boolean` | Checks if a string's length is at least a minimum. |
| `validateMaxLength` | `value` (string), `max` (number) | `boolean` | Checks if a string's length is at most a maximum. |
| `validateRange` | `value` (number), `min` (number), `max` (number) | `boolean` | Validates if a number is within a specified range. |
| `validatePassword` | `password` (string), `options` (Object) | `Object` | Performs password strength validation and returns `{isValid, errors}`. |
| `validateCreditCard` | `cardNumber` (string) | `boolean` | Validates a credit card number using the Luhn algorithm. |
| `validateDate` | `date` (string) | `boolean` | Checks if a string is a valid date. |
| `validateDateFormat` | `date` (string), `format` (string) | `boolean` | Validates a date string against a specific format (e.g., 'YYYY-MM-DD'). |
| `validateFileType` | `fileType` (string), `allowedTypes` (Array<string>) | `boolean` | Validates if a file MIME type is in the allowed list. |
| `validateFileSize` | `fileSize` (number), `maxSize` (number) | `boolean` | Validates if a file size is within a maximum limit. |

#### 3. `formatUtils.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `truncateString` | `str` (string), `length` (number), `suffix` (string) | `string` | Truncates a string to a specified length and adds a suffix. |
| `slugify` | `str` (string) | `string` | Converts a string into a URL-friendly slug. |
| `capitalize` | `str` (string), `allWords` (boolean) | `string` | Capitalizes the first letter of a string or all words. |
| `formatCurrency` | `amount` (number), `currency` (string), `locale` (string) | `string` | Formats a number as currency (e.g., `$10.00`). |
| `formatPercentage` | `value` (number), `decimalPlaces` (number) | `string` | Formats a number as a percentage. |
| `extractTextFromHTML` | `html` (string) | `string` | Strips HTML tags from a string. |
| `formatNumber` | `number` (number), `locale` (string) | `string` | Formats a number with thousands separators. |
| `formatFileSize` | `bytes` (number), `decimalPlaces` (number) | `string` | Converts bytes to a human-readable file size (e.g., `1.5 MB`). |
| `formatPhone` | `phone` (string), `format` (string) | `string` | Formats a phone number according to a given pattern. |
| `formatCompactNumber` | `number` (number), `locale` (string) | `string` | Formats a number in a compact way (e.g., `1.2K`, `3.4M`). |
| `formatRelativeTime` | `date` (Date\|string) | `string` | Returns a short relative time string (e.g., `2d`, `1h`). |
| `getInitials` | `name` (string), `maxInitials` (number) | `string` | Generates initials from a full name. |
| `maskString` | `str` (string), `visibleChars` (number), `maskChar` (string) | `string` | Masks a string, showing only the last few characters. |
| `toCamelCase` | `str` (string) | `string` | Converts a string to camelCase. |
| `toKebabCase` | `str` (string) | `string` | Converts a string to kebab-case. |
| `toSnakeCase` | `str` (string) | `string` | Converts a string to snake_case. |

#### 4. `navigationUtils.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `resetAndNavigate` | `navigation` (Object), `routeName` (string), `params` (Object) | `void` | Resets the navigation stack and navigates to a specific route. |
| `replace` | `navigation` (Object), `routeName` (string), `params` (Object) | `void` | Replaces the current screen in the stack with a new one. |
| `push` | `navigation` (Object), `routeName` (string), `params` (Object) | `void` | Pushes a new screen onto the navigation stack. |
| `pop` | `navigation` (Object), `count` (number) | `void` | Pops a specified number of screens from the stack. |
| `popToTop` | `navigation` (Object) | `void` | Pops all screens and goes to the top of the stack. |
| `navigate` | `navigation` (Object), `routeName` (string), `params` (Object), `options` (Object) | `void` | Navigates to a route with parameters and options. |
| `getCurrentRoute` | `navigation` (Object) | `string\|null` | Returns the name of the current route. |
| `getRouteParam` | `route` (Object), `key` (string), `defaultValue` (any) | `any` | Retrieves a specific parameter from a route object. |
| `setOptions` | `navigation` (Object), `options` (Object) | `void` | Dynamically sets navigation options for the current screen. |
| `navigateWithMerge` | `navigation` (Object), `routeName` (string), `params` (Object) | `void` | Navigates to a route and merges parameters. |
| `isFocused` | `navigation` (Object), `routeName` (string) | `boolean` | Checks if a specific screen is currently focused. |

#### 5. `helpers.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `generateId` | `prefix` (string) | `string` | Generates a unique ID with an optional prefix. |
| `debounce` | `func` (Function), `delay` (number) | `Function` | Creates a debounced version of a function. |
| `throttle` | `func` (Function), `limit` (number) | `Function` | Creates a throttled version of a function. |
| `deepClone` | `obj` (Object) | `Object` | Performs a deep clone of an object using JSON methods. |
| `deepMerge` | `target` (Object), `source` (Object) | `Object` | Performs a deep merge of two objects. |
| `groupBy` | `array` (Array), `key` (string) | `Object` | Groups an array of objects by a specified key. |
| `sortBy` | `array` (Array), `key` (string), `order` (string) | `Array` | Sorts an array of objects by a specified key. |
| `formatPhone` | `phone` (string) | `string` | Formats a phone number (e.g., `(123) 456-7890`). |
| `getRandomColor` | `opacity` (number) | `string` | Generates a random hex color with optional opacity. |
| `toQueryString` | `params` (Object) | `string` | Converts an object to a URL query string. |
| `parseQueryString` | `query` (string) | `Object` | Parses a URL query string into an object. |
| `isEmpty` | `obj` (Object\|Array) | `boolean` | Checks if an object or array is empty. |
| `pick` | `obj` (Object), `keys` (Array<string>) | `Object` | Creates a new object with only the specified keys. |
| `omit` | `obj` (Object), `keys` (Array<string>) | `Object` | Creates a new object by omitting the specified keys. |
| `retry` | `fn` (Function), `maxAttempts` (number), `delay` (number) | `Promise<any>` | Retries an asynchronous function a specified number of times. |
| `platformValue` | `ios` (any), `android` (any), `web` (any) | `any` | Returns a platform-specific value. |
| `responsiveSize` | `size` (number), `factor` (number) | `number` | Calculates a responsive size based on screen dimensions. |
| `copyToClipboard` | `text` (string) | `Promise<boolean>` | Copies text to the clipboard (web only). |
| `downloadFile` | `url` (string), `filename` (string) | `Promise<void>` | Downloads a file from a URL (web only). |

---

### Services


#### 2. `apiService.js`

| Function/Export | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `apiService` | `endpoint` (string), `method` (string), `data` (Object\|null), `params` (Object\|null), `headers` (Object), `options` (Object) | `Promise<{ data, status, message, pagination, metadata }>` | A generic function to make authenticated API calls with structured error and data handling. |
| `api.get` | `endpoint` (string), `params` (Object\|null), `headers` (Object), `options` (Object) | `Promise<Object>` | Convenience method for GET requests. |
| `api.post` | `endpoint` (string), `data` (Object\|null), `headers` (Object), `options` (Object) | `Promise<Object>` | Convenience method for POST requests. |
| `api.put` | `endpoint` (string), `data` (Object\|null), `headers` (Object), `options` (Object) | `Promise<Object>` | Convenience method for PUT requests. |
| `api.patch` | `endpoint` (string), `data` (Object\|null), `headers` (Object), `options` (Object) | `Promise<Object>` | Convenience method for PATCH requests. |
| `api.delete` | `endpoint` (string), `params` (Object\|null), `headers` (Object), `options` (Object) | `Promise<Object>` | Convenience method for DELETE requests. |

#### 3. `storageService.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `setItem` | `key` (string), `value` (any), `options` (Object) | `Promise<void>` | Stores a JSON-serializable value in AsyncStorage. |
| `getItem` | `key` (string), `options` (Object) | `Promise<any>` | Retrieves a value from AsyncStorage, handling TTL expiration. |
| `removeItem` | `key` (string) | `Promise<void>` | Removes an item from AsyncStorage. |
| `clearAll` | `null` | `Promise<void>` | Clears all data from AsyncStorage. |
| `multiGet` | `keys` (Array<string>) | `Promise<Array<{ key, value }>>` | Retrieves multiple items from AsyncStorage. |
| `multiSet` | `keyValuePairs` (Array<{ key, value }>), `options` (Object) | `Promise<void>` | Stores multiple items in AsyncStorage. |
| `getAllKeys` | `null` | `Promise<string[]>` | Returns all keys stored in AsyncStorage. |
| `storeFile` | `filename` (string), `content` (string\|Blob), `directory` (string) | `Promise<string>` | Stores a file in the device's file system. |
| `getFile` | `fileUri` (string), `options` (Object) | `Promise<string>` | Reads and returns the content of a file. |
| `deleteFile` | `fileUri` (string) | `Promise<void>` | Deletes a file from the file system. |

#### 4. `databaseService.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `initDB` | `dbName` (string), `version` (number) | `Promise<boolean>` | Initializes the SQLite database. |
| `query` | `sql` (string), `params` (Array) | `Promise<Array>` | Executes a SQL query and returns the results. |
| `queryOne` | `sql` (string), `params` (Array) | `Promise<Object\|null>` | Executes a SQL query and returns the first result. |
| `insert` | `table` (string), `data` (Object) | `Promise<number\|null>` | Inserts a record into a table. |
| `insertBatch` | `table` (string), `dataArray` (Array<Object>) | `Promise<Array<number>>` | Inserts multiple records into a table. |
| `update` | `table` (string), `data` (Object), `where` (Object) | `Promise<boolean>` | Updates records in a table. |
| `delete` | `table` (string), `where` (Object) | `Promise<boolean>` | Deletes records from a table. |
| `transaction` | `operations` (Function) | `Promise<any>` | Executes multiple database operations as a single transaction. |
| `close` | `null` | `Promise<void>` | Closes the database connection. |
| `isInitialized` | `null` | `boolean` | Checks if the database is initialized. |

#### 5. `projectService.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `getAll` | `params` (Object) | `Promise<Object>` | Fetches all projects with optional filters. |
| `getById` | `id` (string) | `Promise<Object>` | Fetches a single project by its ID. |
| `create` | `data` (Object) | `Promise<Object>` | Creates a new project. |
| `update` | `id` (string), `data` (Object) | `Promise<Object>` | Updates an existing project. |
| `updateStatus` | `id` (string), `status` (string) | `Promise<Object>` | Updates the status of a project. |
| `delete` | `id` (string) | `Promise<boolean>` | Deletes a project. |
| `getAnalytics` | `id` (string) | `Promise<Object>` | Fetches analytics data for a project. |
| `getStatistics` | `id` (string) | `Promise<Object>` | Fetches statistics for a project. |
| `getTimeline` | `id` (string), `params` (Object) | `Promise<Object>` | Fetches the timeline for a project. |
| `getProgressOverview` | `id` (string) | `Promise<Object>` | Fetches a progress overview for a project. |
| `addTimelineEntry` | `id` (string), `data` (Object) | `Promise<Object>` | Adds a new entry to the project timeline. |
| `updateTimelineEntry` | `entryId` (string), `data` (Object) | `Promise<Object>` | Updates a timeline entry. |
| `deleteTimelineEntry` | `entryId` (string) | `Promise<boolean>` | Deletes a timeline entry. |
| `getExpenses` | `id` (string), `params` (Object) | `Promise<Object>` | Fetches expenses for a project. |
| `createExpense` | `id` (string), `data` (Object) | `Promise<Object>` | Creates a new expense for a project. |
| `updateExpense` | `expenseId` (string), `data` (Object) | `Promise<Object>` | Updates an expense. |
| `deleteExpense` | `expenseId` (string) | `Promise<boolean>` | Deletes an expense. |
| `getExpenseSummary` | `id` (string) | `Promise<Object>` | Fetches a summary of expenses for a project. |

#### 6. `featureService.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `getByProject` | `projectId` (string), `params` (Object) | `Promise<Object>` | Fetches all features for a specific project. |
| `getById` | `id` (string) | `Promise<Object>` | Fetches a single feature by its ID. |
| `create` | `projectId` (string), `data` (Object) | `Promise<Object>` | Creates a new feature in a project. |
| `update` | `id` (string), `data` (Object) | `Promise<Object>` | Updates an existing feature. |
| `updateStatus` | `id` (string), `status` (string) | `Promise<Object>` | Updates the status of a feature. |
| `delete` | `id` (string) | `Promise<boolean>` | Deletes a feature. |
| `reorder` | `projectId` (string), `orderedIds` (Array<string>) | `Promise<boolean>` | Reorders features in a project. |
| `getSubtasks` | `featureId` (string) | `Promise<Object>` | Fetches subtasks for a specific feature. |
| `createSubtask` | `featureId` (string), `data` (Object) | `Promise<Object>` | Creates a new subtask for a feature. |
| `updateSubtask` | `subtaskId` (string), `data` (Object) | `Promise<Object>` | Updates a subtask. |
| `toggleSubtask` | `subtaskId` (string), `isComplete` (boolean) | `Promise<Object>` | Toggles the completion status of a subtask. |
| `deleteSubtask` | `subtaskId` (string) | `Promise<boolean>` | Deletes a subtask. |
| `getStatistics` | `projectId` (string) | `Promise<Object>` | Fetches statistics (e.g., completion rate) for features. |

#### 7. `bugService.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `getByProject` | `projectId` (string), `params` (Object) | `Promise<Object>` | Fetches all bugs for a specific project. |
| `getById` | `id` (string) | `Promise<Object>` | Fetches a single bug by its ID. |
| `create` | `projectId` (string), `data` (Object) | `Promise<Object>` | Creates a new bug in a project. |
| `update` | `id` (string), `data` (Object) | `Promise<Object>` | Updates an existing bug. |
| `updateStatus` | `id` (string), `status` (string) | `Promise<Object>` | Updates the status of a bug. |
| `assign` | `id` (string), `assigneeId` (string) | `Promise<Object>` | Assigns a bug to a user. |
| `delete` | `id` (string) | `Promise<boolean>` | Deletes a bug. |
| `resolve` | `id` (string), `resolution` (string) | `Promise<Object>` | Resolves a bug with a resolution note. |
| `reopen` | `id` (string), `reason` (string) | `Promise<Object>` | Reopens a bug. |
| `getStatistics` | `projectId` (string) | `Promise<Object>` | Fetches statistics (e.g., open vs closed) for bugs. |
| `getPriorities` | `projectId` (string) | `Promise<Object>` | Fetches bugs grouped by their priority. |

#### 8. `githubService.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `getAuthUrl` | `null` | `string` | Returns the GitHub OAuth URL for user authorization. |
| `getAccessToken` | `code` (string) | `Promise<Object>` | Exchanges an authorization code for an access token. |
| `getUserRepos` | `token` (string), `params` (Object) | `Promise<Array>` | Fetches repositories for a user using their access token. |
| `getRepositories` | `projectId` (string) | `Promise<Array>` | Fetches repositories linked to a specific project. |
| `connectRepository` | `projectId` (string), `repoData` (Object) | `Promise<Object>` | Connects a GitHub repository to a project. |
| `disconnectRepository` | `repositoryId` (string) | `Promise<boolean>` | Disconnects a GitHub repository from a project. |
| `syncRepository` | `repositoryId` (string) | `Promise<Object>` | Triggers a sync of a repository's data. |
| `getCommits` | `repositoryId` (string), `params` (Object) | `Promise<Object>` | Fetches commits from a repository. |
| `getBranches` | `repositoryId` (string) | `Promise<Array>` | Fetches branches from a repository. |
| `getPullRequests` | `repositoryId` (string), `state` (string), `params` (Object) | `Promise<Array>` | Fetches pull requests from a repository. |
| `getIssues` | `repositoryId` (string), `state` (string), `params` (Object) | `Promise<Array>` | Fetches issues from a repository. |
| `setupWebhook` | `repositoryId` (string), `config` (Object) | `Promise<Object>` | Sets up a webhook for a repository. |
| `processWebhook` | `payload` (Object), `signature` (string) | `Promise<Object>` | Processes an incoming webhook payload. |
| `getStatistics` | `repositoryId` (string), `branch` (string) | `Promise<Object>` | Fetches statistics for a repository. |
| `getCommitStats` | `repositoryId` (string), `branch` (string) | `Promise<Object>` | Fetches commit statistics grouped by author. |
| `getContent` | `repositoryId` (string), `path` (string), `ref` (string) | `Promise<Object>` | Fetches the content of a file in a repository. |

---

### Context Providers



#### 2. `ThemeContext.jsx`

| Function/Export | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `ThemeProvider` | `children` (ReactNode) | `React.ReactElement` | Provides theme state (`isDarkMode`, `theme`) and actions (`toggleTheme`). |
| `useTheme` | `null` | `Object` | Hook to use the theme context inside a component. |

#### 3. `ProjectContext.jsx`

| Function/Export | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `ProjectProvider` | `children` (ReactNode) | `React.ReactElement` | Provides project state (`projects`, `currentProject`) and CRUD actions. |
| `useProject` | `null` | `Object` | Hook to use the project context inside a component. |

#### 4. `NotificationContext.jsx`

| Function/Export | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `NotificationProvider` | `children` (ReactNode) | `React.ReactElement` | Provides notification state and actions (`showToast`, `addNotification`). |
| `useNotification` | `null` | `Object` | Hook to use the notification context inside a component. |

#### 5. `SettingsContext.jsx`

| Function/Export | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `SettingsProvider` | `children` (ReactNode) | `React.ReactElement` | Provides application settings state and actions (`updateSetting`, `resetSettings`). |
| `useSettings` | `null` | `Object` | Hook to use the settings context inside a component. |

---

### Custom Hooks

#### 1. `useApi.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `useApi` | `endpoint` (string), `options` (Object) | `Object` | A hook for making API calls with built-in loading, error, and data states. |

#### 2. `useDebounce.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `useDebounce` | `value` (any), `delay` (number) | `any` | A hook that returns a debounced version of a value. |

#### 3. `usePagination.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `usePagination` | `fetchFunction` (Function), `initialPage` (number), `initialLimit` (number), `dependencies` (Array) | `Object` | A hook for managing paginated data fetching. |

#### 4. `useForm.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `useForm` | `initialValues` (Object), `validationSchema` (Object\|null), `onSubmit` (Function\|null), `options` (Object) | `Object` | A powerful hook for managing form state, validation, and submission. |

---

### UI Components

#### 1. `Button.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `''` | The button's text. |
| `onPress` | `function` | `() => {}` | Press event handler. |
| `variant` | `string` | `'primary'` | Style variant (`'primary'`, `'secondary'`, `'outline'`, `'danger'`, `'success'`, `'warning'`). |
| `size` | `string` | `'medium'` | Size variant (`'small'`, `'medium'`, `'large'`). |
| `loading` | `boolean` | `false` | Shows a loading indicator. |
| `disabled` | `boolean` | `false` | Disables the button. |
| `icon` | `string` | `null` | Name of the Ionicons icon. |
| `iconPosition` | `string` | `'left'` | Icon position (`'left'`, `'right'`). |
| `style` | `object` | `{}` | Custom styles for the TouchableOpacity. |
| `textStyle` | `object` | `{}` | Custom styles for the text. |
| `iconStyle` | `object` | `{}` | Custom styles for the icon. |
| `accessibilityLabel` | `string` | `''` | Accessibility label. |
| `testID` | `string` | `''` | Test ID for UI tests. |
| **Returns** | React Element | The rendered Button component. |

#### 2. `Input.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `''` | The input's value. |
| `onChangeText` | `function` | `() => {}` | Text change handler. |
| `placeholder` | `string` | `''` | Placeholder text. |
| `secureTextEntry` | `boolean` | `false` | Masks the input (for passwords). |
| `error` | `string` | `''` | Error message to display. |
| `disabled` | `boolean` | `false` | Disables the input. |
| `label` | `string` | `''` | Input label. |
| `icon` | `string` | `null` | Name of the Ionicons icon. |
| `keyboardType` | `string` | `'default'` | Keyboard type (e.g., 'email-address'). |
| `autoCapitalize` | `string` | `'sentences'` | Auto-capitalization behavior. |
| `multiline` | `boolean` | `false` | Enables multi-line input. |
| `numberOfLines` | `number` | `1` | Number of lines for multi-line input. |
| `returnKeyType` | `string` | `'done'` | Return key type. |
| `onSubmitEditing` | `function` | `() => {}` | Submit edit handler. |
| `onFocus` | `function` | `() => {}` | Focus handler. |
| `onBlur` | `function` | `() => {}` | Blur handler. |
| `style` | `object` | `{}` | Custom styles for the container. |
| `inputStyle` | `object` | `{}` | Custom styles for the TextInput. |
| `labelStyle` | `object` | `{}` | Custom styles for the label. |
| `testID` | `string` | `''` | Test ID for UI tests. |
| **Returns** | React Element | The rendered Input component. |

#### 3. `Card.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | `null` | The card's content. |
| `onPress` | `function` | `null` | Press handler (makes the card touchable). |
| `variant` | `string` | `'default'` | Card variant (`'default'`, `'elevated'`, `'outlined'`). |
| `elevation` | `number` | `2` | Elevation level (Android) or shadow intensity (iOS). |
| `style` | `object` | `{}` | Custom styles for the TouchableOpacity/View. |
| `containerStyle` | `object` | `{}` | Custom styles for the card container. |
| `testID` | `string` | `''` | Test ID for UI tests. |
| **Returns** | React Element | The rendered Card component. |

#### 4. `Avatar.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `source` | `string\|object` | `null` | Image source URI or object. |
| `name` | `string` | `''` | Name to generate initials. |
| `size` | `number` | `50` | Size of the avatar. |
| `variant` | `string` | `'circle'` | Shape variant (`'circle'`, `'rounded'`, `'square'`). |
| `onPress` | `function` | `null` | Press handler. |
| `editable` | `boolean` | `false` | Shows an edit icon overlay. |
| `style` | `object` | `{}` | Custom styles. |
| `testID` | `string` | `''` | Test ID for UI tests. |
| **Returns** | React Element | The rendered Avatar component. |

#### 5. `Toast.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `message` | `string` | `''` | The toast message. |
| `type` | `string` | `'info'` | Type of toast (`'success'`, `'error'`, `'warning'`, `'info'`). |
| `duration` | `number` | `3000` | Duration in milliseconds. |
| `position` | `string` | `'top'` | Position (`'top'`, `'bottom'`). |
| `onHide` | `function` | `() => {}` | Callback when the toast hides. |
| `onShow` | `function` | `() => {}` | Callback when the toast shows. |
| `style` | `object` | `{}` | Custom styles. |
| `testID` | `string` | `''` | Test ID for UI tests. |
| **Returns** | React Element | The rendered Toast component. |

#### 6. `ProjectCard.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `project` | `object` | `null` | The project data object. |
| `onPress` | `function` | `null` | Press handler. |
| **Returns** | React Element | The rendered ProjectCard component. |
Based on the provided code, here is a comprehensive breakdown of the functions, their parameters, return values, and the overall folder structure for the Authentication Module Implementation (Continued).

## Folder Structure

```
src/
├── components/
│   └── common/
│       ├── ProtectedRoute.jsx
│       ├── SessionGuard.jsx
│       ├── Toast.jsx
│       ├── Loader.jsx
│       ├── Input.jsx
│       ├── Button.jsx
│       └── Icon.jsx
├── screens/
│   └── auth/
│       ├── LoginScreen.jsx
│       ├── RegisterScreen.jsx
│       ├── ForgotPasswordScreen.jsx
│       ├── ResetPasswordScreen.jsx
│       ├── ChangePasswordScreen.jsx
│       ├── SessionsScreen.jsx
│       └── index.js
├── navigation/
│   ├── AuthNavigator.jsx
│   ├── AppNavigator.jsx
│   └── RootNavigator.jsx
├── services/
│   ├── authService.js
│   ├── authStore.js
│   ├── httpClient.js
│   └── index.js
├── context/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useForm.js
├── utils/
│   ├── validationUtils.js
│   └── types.js
└── App.jsx
```

---

## 1. Screens

### `ForgotPasswordScreen.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `navigation` | `object` | `required` | React Navigation navigation object. |
| **Returns** | React Element | The rendered ForgotPasswordScreen component. |

**Internal State & Functions:**

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `validate` | `null` | `boolean` | Validates email input. |
| `handleSubmit` | `null` | `Promise<void>` | Handles form submission to send reset link. |

---

### `ResetPasswordScreen.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `navigation` | `object` | `required` | React Navigation navigation object. |
| `route` | `object` | `required` | Route object containing `params.token`. |
| **Returns** | React Element | The rendered ResetPasswordScreen component. |

**Internal State & Functions:**

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `validate` | `null` | `boolean` | Validates password fields (length, complexity, match). |
| `handleSubmit` | `null` | `Promise<void>` | Handles password reset submission. |

---

### `ChangePasswordScreen.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `navigation` | `object` | `required` | React Navigation navigation object. |
| **Returns** | React Element | The rendered ChangePasswordScreen component. |

**Internal State & Functions:**

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `validate` | `null` | `boolean` | Validates all password fields. |
| `handleSubmit` | `null` | `Promise<void>` | Handles password change submission. |

---

## 2. Components

### `ProtectedRoute.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | `required` | Child components to render when authenticated. |
| `fallback` | `ReactNode` | `null` | Component to render when not authenticated. |
| `loadingFallback` | `ReactNode` | `null` | Component to render while checking auth status. |
| `redirectTo` | `string` | `'Login'` | Route to navigate to when unauthenticated. |
| `navigation` | `object` | `null` | Navigation object for redirection. |
| **Returns** | React Element | The rendered ProtectedRoute component. |

---

### `SessionGuard.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | `required` | Child components to render. |
| `onSessionExpired` | `function` | `null` | Callback when session expires. |
| **Returns** | React Element | The rendered SessionGuard component. |

**Internal Functions:**

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `scheduleRefresh` | `null` | `void` | Schedules periodic session refresh. |
| `handleAppStateChange` | `nextAppState` (string) | `Promise<void>` | Handles app state changes for session refresh. |

---

## 3. Services

### `authService.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `forgotPassword` | `email` (string) | `Promise<{success: boolean, message: string}>` | Sends password reset email. |
| `resetPassword` | `data` (Object: `token`, `newPassword`, `confirmPassword`) | `Promise<{success: boolean, message: string}>` | Resets password with token. |
| `login` | `credentials` (Object: `email`, `password`, `rememberMe`) | `Promise<{success: boolean, user: Object, tokens: Object}>` | Authenticates user. |
| `register` | `data` (Object: `email`, `password`, `fullName`, `username`) | `Promise<{success: boolean, user: Object}>` | Registers new user. |
| `changePassword` | `data` (Object: `currentPassword`, `newPassword`, `confirmPassword`) | `Promise<{success: boolean, message: string}>` | Changes user password. |
| `getSessions` | `null` | `Promise<{sessions: Array}>` | Fetches active sessions. |
| `revokeSession` | `sessionId` (string) | `Promise<{success: boolean}>` | Revokes a specific session. |
| `revokeAllSessions` | `null` | `Promise<{success: boolean}>` | Revokes all sessions. |
| `refreshSession` | `null` | `Promise<{success: boolean, tokens: Object}>` | Refreshes authentication session. |
| `logout` | `null` | `Promise<void>` | Logs out user. |

---

### `authStore.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `storeAuthData` | `data` (Object: `user`, `tokens`, `sessionId`) | `Promise<void>` | Stores authentication data locally. |
| `getAuthData` | `null` | `Promise<Object\|null>` | Retrieves stored authentication data. |
| `clearAuthData` | `null` | `Promise<void>` | Clears all authentication data. |
| `storeUser` | `user` (Object) | `Promise<void>` | Updates stored user data. |
| `storeTokens` | `tokens` (Object: `accessToken`, `refreshToken`) | `Promise<void>` | Updates stored tokens. |
| `getTokens` | `null` | `Promise<Object\|null>` | Retrieves stored tokens. |
| `isAuthenticated` | `null` | `Promise<boolean>` | Checks if user is authenticated. |

---

### `httpClient.js` (Updated)

| Function/Export | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `httpClient` | `baseURL` (string), `options` (Object) | `Object` | Creates Axios instance with cookie/interceptor support. |
| **Default Export** | `defaultClient` | `Object` | Pre-configured HTTP client singleton. |

**Methods:**

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `get` | `url` (string), `config` (Object) | `Promise` | GET request with cookie support. |
| `post` | `url` (string), `data` (Object), `config` (Object) | `Promise` | POST request with cookie support. |
| `put` | `url` (string), `data` (Object), `config` (Object) | `Promise` | PUT request with cookie support. |
| `patch` | `url` (string), `data` (Object), `config` (Object) | `Promise` | PATCH request with cookie support. |
| `delete` | `url` (string), `config` (Object) | `Promise` | DELETE request with cookie support. |

---

## 4. Hooks

### `useAuth.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `useAuth` | `null` | `Object` | Main authentication hook. |

**Return Object Properties:**

| Property | Type | Description |
| :--- | :--- | :--- |
| `user` | `Object\|null` | Current authenticated user. |
| `isAuthenticated` | `boolean` | Authentication status. |
| `isLoading` | `boolean` | Loading state. |
| `error` | `string\|null` | Error message. |
| `login` | `Function` | `(email, password, rememberMe) => Promise` |
| `register` | `Function` | `(data) => Promise` |
| `logout` | `Function` | `() => Promise` |
| `changePassword` | `Function` | `(data) => Promise` |
| `forgotPassword` | `Function` | `(email) => Promise` |
| `resetPassword` | `Function` | `(data) => Promise` |
| `refreshSession` | `Function` | `() => Promise` |
| `getSessions` | `Function` | `() => Promise` |
| `revokeSession` | `Function` | `(sessionId) => Promise` |
| `revokeAllSessions` | `Function` | `() => Promise` |
| `clearError` | `Function` | `() => void` |

---

## 5. Context Providers

### `AuthContext.jsx`

| Function/Export | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `AuthProvider` | `children` (ReactNode) | `React.Element` | Provides authentication state and actions. |
| `useAuth` | `null` | `Object` | Hook to use auth context. |

---

## 6. Navigation

### `AuthNavigator.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `authState` | `object` | `required` | Auth state from useAuth. |
| **Returns** | React Element | The rendered AuthNavigator component. |

**Screens:**

| Route Name | Component | Description |
| :--- | :--- | :--- |
| `Login` | `LoginScreen` | Login screen. |
| `Register` | `RegisterScreen` | Registration screen. |
| `ForgotPassword` | `ForgotPasswordScreen` | Forgot password screen. |
| `ResetPassword` | `ResetPasswordScreen` | Password reset screen. |
| `ChangePassword` | `ChangePasswordScreen` | Password change screen. |
| `Sessions` | `SessionsScreen` | Session management screen. |

### `AppNavigator.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `null` | - | - | Uses theme from ThemeContext. |
| **Returns** | React Element | The rendered AppNavigator component. |

**Tabs:**

| Tab Name | Component | Description |
| :--- | :--- | :--- |
| `Home` | `HomeStack` | Home tab with nested stack. |
| `Projects` | `ProjectListScreen` | Projects tab. |
| `Profile` | `ProfileStack` | Profile tab with nested stack. |

### `RootNavigator.jsx`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `null` | - | - | Uses useAuth for auth state. |
| **Returns** | React Element | The rendered RootNavigator component. |

---

## 7. Utilities

### `validationUtils.js`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `validateEmail` | `email` (string) | `boolean` | Validates email format. |
| `validateRequired` | `value` (any) | `boolean` | Checks if value is not empty. |
| `validateMinLength` | `value` (string), `min` (number) | `boolean` | Checks minimum length. |
| `validatePasswordMatch` | `password1` (string), `password2` (string) | `boolean` | Checks if passwords match. |
| `validatePasswordStrength` | `password` (string) | `Object` | Returns strength and requirements met. |
| `validatePhone` | `phone` (string) | `boolean` | Validates phone number format. |
| `validateURL` | `url` (string) | `boolean` | Validates URL format. |
| `validateUsername` | `username` (string) | `boolean` | Validates username format. |

---

## 8. Types (JSDoc)

### `types.js`

| Type Name | Properties | Description |
| :--- | :--- | :--- |
| `User` | `id`, `email`, `fullName`, `username`, `role`, `avatar`, `provider`, `emailVerified`, `createdAt` | User object structure. |
| `Session` | `id`, `deviceName`, `ipAddress`, `userAgent`, `lastActive`, `expiresAt`, `isCurrent` | Session object structure. |
| `Tokens` | `accessToken`, `refreshToken` | Token object structure. |
| `AuthData` | `user`, `tokens`, `sessionId` | Complete auth data structure. |
| `LoginCredentials` | `email`, `password`, `rememberMe` | Login credential structure. |
| `RegisterData` | `email`, `password`, `confirmPassword`, `fullName`, `username` | Registration data structure. |
| `ChangePasswordData` | `currentPassword`, `newPassword`, `confirmPassword` | Password change data structure. |
| `ResetPasswordData` | `token`, `newPassword`, `confirmPassword` | Password reset data structure. |
| `OAuthData` | `provider`, `code`, `redirectUri` | OAuth data structure. |

---

## 9. App Integration

### `App.jsx`

| Function Name | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `App` | `null` | React Element | Main app component with providers. |
| `initDatabase` | `null` | `Promise<void>` | Initializes database on app start. |

**Provider Hierarchy:**
1. `SafeAreaProvider`
2. `ThemeProvider`
3. `AuthProvider`
4. `NotificationProvider`
5. `RootNavigator`
6. `Toast` (with ref)

---

## Summary of All Exports

| File | Main Exports |
| :--- | :--- |
| **ForgotPasswordScreen.jsx** | `ForgotPasswordScreen` (default) |
| **ResetPasswordScreen.jsx** | `ResetPasswordScreen` (default) |
| **ChangePasswordScreen.jsx** | `ChangePasswordScreen` (default) |
| **SessionsScreen.jsx** | `SessionsScreen` (default) |
| **ProtectedRoute.jsx** | `ProtectedRoute` (default) |
| **SessionGuard.jsx** | `SessionGuard` (default) |
| **authService.js** | `forgotPassword`, `resetPassword`, `login`, `register`, `changePassword`, `getSessions`, `revokeSession`, `revokeAllSessions`, `refreshSession`, `logout` |
| **authStore.js** | `storeAuthData`, `getAuthData`, `clearAuthData`, `storeUser`, `storeTokens`, `getTokens`, `isAuthenticated` |
| **useAuth.js** | `useAuth` (hook) |
| **useForm.js** | `useForm` (hook) |
| **AuthContext.jsx** | `AuthProvider`, `useAuth` |
| **validationUtils.js** | `validateEmail`, `validateRequired`, `validateMinLength`, `validatePasswordMatch`, `validatePasswordStrength`, `validatePhone`, `validateURL`, `validateUsername` |
| **RootNavigator.jsx** | `RootNavigator` (default) |
| **AuthNavigator.jsx** | `AuthNavigator` (default) |
| **AppNavigator.jsx** | `AppNavigator` (default) |
| **index.js (auth screens)** | `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `ResetPasswordScreen`, `SessionsScreen`, `ChangePasswordScreen` |
| **index.js (services)** | `httpClient`, `apiService`, `storageService`, `databaseService`, `authService`, `authStore` |
| **types.js** | `Types` object with JSDoc type definitions |