// src/components/documentation-knowledge/utils/helpers.js

import {
  DOCUMENTATION_TYPE_COLORS,
  DOCUMENTATION_TYPE_ICONS,
} from './constants';

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Truncate text
export const truncateText = (text, maxLength = 200) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get documentation type color
export const getDocTypeColor = (type) => {
  return DOCUMENTATION_TYPE_COLORS[type] || 'neutral';
};

// Get documentation type icon
export const getDocTypeIcon = (type) => {
  return DOCUMENTATION_TYPE_ICONS[type] || '📄';
};

// Get documentation type label
export const getDocTypeLabel = (type) => {
  const found = DOCUMENTATION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
};

// Check if string is JSON
export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Extract tags from text
export const extractTags = (text) => {
  const tagRegex = /#(\w+)/g;
  const matches = text.match(tagRegex) || [];
  return matches.map((tag) => tag.substring(1));
};

// Get initial letter for avatar
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

// Get random color for avatar
export const getAvatarColor = (name) => {
  const colors = [
    '#EA580C',
    '#FB923C',
    '#F97316',
    '#C2410C',
    '#9A3412',
    '#16A34A',
    '#2563EB',
    '#7C3AED',
    '#DC2626',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get pagination range
export const getPaginationRange = (currentPage, totalPages, siblingCount = 1) => {
  const range = [];
  const start = Math.max(1, currentPage - siblingCount);
  const end = Math.min(totalPages, currentPage + siblingCount);

  if (start > 1) {
    range.push(1);
    if (start > 2) range.push('...');
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) range.push('...');
    range.push(totalPages);
  }

  return range;
};