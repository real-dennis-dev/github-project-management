// src/components/documentation-knowledge/pages/DocumentationDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Clock,
  Tag,
  FileText,
  GitBranch,
  Eye,
  Printer,
  Copy,
  Share2,
} from "lucide-react";
import {
  Button,
  Badge,
  LoadingSpinner,
  ErrorState,
  Modal,
  Toast,
} from "../../common";
import { useDocumentation } from "../hooks/useDocumentation";
import DocumentViewer from "../components/DocumentViewer";
import VersionHistory from "../components/VersionHistory";
import TagManager from "../components/TagManager";
import { formatDate, getDocTypeLabel, getDocTypeColor } from "../utils/helpers";
import { DOCUMENTATION_TYPES } from "../utils/constants";

const DocumentationDetail = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const {
    documentation,
    loading,
    error,
    versions,
    loadDocumentation,
    loadVersions,
    remove,
    exportDoc,
    restoreVersion,
  } = useDocumentation(projectId);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocumentation(id);
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
    await exportDoc(id, format);
    setIsExporting(false);
  };

  const handleRestore = async (version) => {
    const result = await restoreVersion(id, version);
    if (result) {
      setShowVersionModal(false);
      showToastMessage("Version restored successfully", "success");
    }
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

  if (error || !documentation) {
    return (
      <ErrorState
        title="Documentation Not Found"
        description={error || "The requested documentation could not be found."}
        onRetry={() => loadDocumentation(id)}
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
        <Link to={`/projects/${projectId}/documentation`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Documentation
          </Button>
        </Link>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVersionModal(true)}
          className="flex items-center gap-2"
        >
          <GitBranch size={16} />
          Versions
        </Button>
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
        <Link to={`/projects/${projectId}/documentation/${id}/edit`}>
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

      {/* Document Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-neutral-900 break-words">
              {documentation.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant={getDocTypeColor(documentation.doc_type)}>
                {getDocTypeLabel(documentation.doc_type)}
              </Badge>
              <span className="text-sm text-neutral-500 flex items-center gap-1">
                <FileText size={14} />
                Version {documentation.version || 1}
              </span>
              <span className="text-sm text-neutral-500 flex items-center gap-1">
                <Clock size={14} />
                Updated {formatDate(documentation.updated_at)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Eye size={14} />
              Preview
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
              <Share2 size={14} />
              Share
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
        {documentation.tags && documentation.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
            <Tag size={16} className="text-neutral-400" />
            {documentation.tags.map((tag) => (
              <Badge key={tag} variant="neutral" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <DocumentViewer content={documentation.content} />
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Documentation"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete{" "}
            <strong>{documentation.title}</strong>? This action cannot be
            undone.
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

      {/* Version History Modal */}
      <Modal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title="Version History"
        size="lg"
      >
        <VersionHistory
          versions={versions}
          currentVersion={documentation.version}
          onRestore={handleRestore}
          onClose={() => setShowVersionModal(false)}
        />
      </Modal>
    </div>
  );
};

export default DocumentationDetail;
