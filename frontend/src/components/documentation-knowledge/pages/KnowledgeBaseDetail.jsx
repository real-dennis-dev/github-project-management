// src/components/documentation-knowledge/pages/KnowledgeBaseDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Clock,
  Tag,
  BookOpen,
  FolderOpen,
  Share2,
  Copy,
  Printer,
} from "lucide-react";
import {
  Button,
  Badge,
  LoadingSpinner,
  ErrorState,
  Modal,
  Toast,
} from "../../common";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import KnowledgeViewer from "../components/KnowledgeViewer";
import TagManager from "../components/TagManager";
import CategoryBadge from "../components/CategoryBadge";
import { formatDate } from "../utils/helpers";

const KnowledgeBaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    entry,
    loading,
    error,
    relatedEntries,
    loadEntry,
    remove,
    exportEntry,
  } = useKnowledgeBase();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) {
      loadEntry(id);
    }
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await remove(id);
    setIsDeleting(false);
    if (success) {
      setShowDeleteModal(false);
    }
  };

  const handleExport = async (format = "pdf") => {
    setIsExporting(true);
    await exportEntry(id, format);
    setIsExporting(false);
  };

  const showToastMessage = (message, type = "info") => {
    setShowToast({ show: true, message, type });
    setTimeout(
      () => setShowToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <ErrorState
        title="Knowledge Entry Not Found"
        description={
          error || "The requested knowledge entry could not be found."
        }
        onRetry={() => loadEntry(id)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast */}
      {showToast.show && (
        <Toast
          variant={showToast.type}
          onClose={() =>
            setShowToast({ show: false, message: "", type: "info" })
          }
        >
          {showToast.message}
        </Toast>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/knowledge-base">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Knowledge Base
          </Button>
        </Link>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("pdf")}
          loading={isExporting}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Export PDF
        </Button>
        <Link to={`/knowledge-base/${id}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </Button>
        </Link>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </div>

      {/* Entry Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-neutral-900 break-words">
              {entry.topic}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <CategoryBadge category={entry.category} />
              <span className="text-sm text-neutral-500 flex items-center gap-1">
                <BookOpen size={14} />
                Knowledge Base
              </span>
              <span className="text-sm text-neutral-500 flex items-center gap-1">
                <Clock size={14} />
                Updated {formatDate(entry.updated_at)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Share2 size={14} />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Copy size={14} />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Printer size={14} />
              Print
            </Button>
          </div>
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
            <Tag size={16} className="text-neutral-400" />
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="neutral" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Related Links */}
        {entry.related_links && entry.related_links.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Related Links:
            </p>
            <div className="flex flex-wrap gap-2">
              {entry.related_links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-500 hover:text-primary-600 hover:underline"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entry Content */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <KnowledgeViewer content={entry.content} />
      </div>

      {/* Related Entries */}
      {relatedEntries.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Related Entries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedEntries.map((related) => (
              <Link
                key={related.id}
                to={`/knowledge-base/${related.id}`}
                className="block p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-neutral-50 transition-colors"
              >
                <h4 className="font-medium text-neutral-900">
                  {related.topic}
                </h4>
                <p className="text-sm text-neutral-500 mt-1">
                  Category: {related.category}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Knowledge Entry"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete <strong>{entry.topic}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KnowledgeBaseDetail;
