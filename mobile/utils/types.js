/**
 * Type definitions for the application
 * These are JSDoc types to help with code completion and type checking
 * Can be converted to TypeScript later
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} avatar - Avatar URL
 * @property {string} role - User role
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Project ID
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string} status - Project status
 * @property {string} priority - Project priority
 * @property {string} startDate - Start date
 * @property {string} endDate - End date
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 * @property {Object} metadata - Project metadata
 */

/**
 * @typedef {Object} Feature
 * @property {string} id - Feature ID
 * @property {string} projectId - Project ID
 * @property {string} name - Feature name
 * @property {string} description - Feature description
 * @property {string} status - Feature status
 * @property {number} orderIndex - Order index
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Bug
 * @property {string} id - Bug ID
 * @property {string} projectId - Project ID
 * @property {string} title - Bug title
 * @property {string} description - Bug description
 * @property {string} status - Bug status
 * @property {string} priority - Bug priority
 * @property {string} assignedTo - Assigned user ID
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Repository
 * @property {string} id - Repository ID
 * @property {string} projectId - Project ID
 * @property {string} name - Repository name
 * @property {string} url - Repository URL
 * @property {string} provider - Repository provider
 * @property {string} lastSync - Last sync date
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Commit
 * @property {string} id - Commit ID
 * @property {string} repositoryId - Repository ID
 * @property {string} commitHash - Commit hash
 * @property {string} message - Commit message
 * @property {string} author - Commit author
 * @property {string} date - Commit date
 * @property {string} createdAt - Creation date
 */

/**
 * @typedef {Object} TimelineEntry
 * @property {string} id - Entry ID
 * @property {string} projectId - Project ID
 * @property {string} date - Entry date
 * @property {number} progress - Progress percentage (0-100)
 * @property {string} notes - Entry notes
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Documentation
 * @property {string} id - Documentation ID
 * @property {string} projectId - Project ID
 * @property {string} title - Documentation title
 * @property {string} content - Documentation content
 * @property {string} type - Documentation type
 * @property {number} version - Version number
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} KnowledgeEntry
 * @property {string} id - Entry ID
 * @property {string} title - Entry title
 * @property {string} content - Entry content
 * @property {string} category - Entry category
 * @property {Array<string>} tags - Entry tags
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Decision
 * @property {string} id - Decision ID
 * @property {string} projectId - Project ID
 * @property {string} title - Decision title
 * @property {string} description - Decision description
 * @property {string} impact - Decision impact
 * @property {string} madeBy - Decision maker
 * @property {string} date - Decision date
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Risk
 * @property {string} id - Risk ID
 * @property {string} projectId - Project ID
 * @property {string} title - Risk title
 * @property {string} description - Risk description
 * @property {string} level - Risk level
 * @property {string} status - Risk status
 * @property {string} mitigation - Mitigation strategy
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} TechDebt
 * @property {string} id - Tech debt ID
 * @property {string} projectId - Project ID
 * @property {string} title - Tech debt title
 * @property {string} description - Tech debt description
 * @property {string} priority - Priority level
 * @property {string} status - Tech debt status
 * @property {number} effort - Effort estimate
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Release
 * @property {string} id - Release ID
 * @property {string} projectId - Project ID
 * @property {string} version - Release version
 * @property {string} name - Release name
 * @property {string} description - Release description
 * @property {string} status - Release status
 * @property {string} releaseDate - Release date
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Milestone
 * @property {string} id - Milestone ID
 * @property {string} projectId - Project ID
 * @property {string} title - Milestone title
 * @property {string} description - Milestone description
 * @property {string} status - Milestone status
 * @property {string} targetDate - Target date
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Expense
 * @property {string} id - Expense ID
 * @property {string} projectId - Project ID
 * @property {string} category - Expense category
 * @property {number} amount - Expense amount
 * @property {string} description - Expense description
 * @property {string} date - Expense date
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} JournalEntry
 * @property {string} id - Journal entry ID
 * @property {string} projectId - Project ID
 * @property {string} date - Journal date
 * @property {string} content - Journal content
 * @property {string} mood - Mood rating
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} VisionGoal
 * @property {string} id - Vision goal ID
 * @property {string} title - Goal title
 * @property {string} description - Goal description
 * @property {Array<string>} projectIds - Linked project IDs
 * @property {string} timeline - Goal timeline
 * @property {string} priority - Goal priority
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

// Export types for JSDoc
export default {
  // This file is for JSDoc types only
  // No runtime code is needed
};