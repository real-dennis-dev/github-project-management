// src/components/documentation-knowledge/components/KnowledgeCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Tag,
  FolderOpen,
  ChevronRight,
  Link2,
} from "lucide-react";
import { Badge } from "../../common";
import CategoryBadge from "./CategoryBadge";
import { formatDate } from "../utils/helpers";

const KnowledgeCard = ({
  id,
  topic,
  content,
  category,
  tags,
  related_links,
  created_at,
  updated_at,
  viewMode = "grid",
}) => {
  const truncatedContent =
    content?.length > 150 ? content.substring(0, 150) + "..." : content;

  if (viewMode === "list") {
    return (
      <Link
        to={`/knowledge-base/${id}`}
        className="block bg-white rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-neutral-400 flex-shrink-0" />
              <h3 className="font-medium text-neutral-900 truncate">{topic}</h3>
              <CategoryBadge category={category} size="sm" />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDate(updated_at)}
              </span>
              {tags && tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag size={14} />
                  {tags.slice(0, 2).join(", ")}
                  {tags.length > 2 && ` +${tags.length - 2}`}
                </span>
              )}
              {related_links && related_links.length > 0 && (
                <span className="flex items-center gap-1">
                  <Link2 size={14} />
                  {related_links.length} links
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-neutral-400 flex-shrink-0" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/knowledge-base/${id}`}
      className="block bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">{topic}</h3>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={category} size="sm" />
          </div>
        </div>
        <BookOpen size={18} className="text-neutral-400 flex-shrink-0 ml-2" />
      </div>

      {content && (
        <p className="text-sm text-neutral-600 line-clamp-3 mb-3">
          {truncatedContent}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {formatDate(updated_at)}
        </span>
        <div className="flex items-center gap-2">
          {related_links && related_links.length > 0 && (
            <span className="flex items-center gap-1">
              <Link2 size={14} />
              {related_links.length}
            </span>
          )}
          {tags && tags.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag size={14} />
              {tags.length}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default KnowledgeCard;
