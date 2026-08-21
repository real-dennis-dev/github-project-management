// src/components/NotFound.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faArrowLeft,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const homePath = isAuthenticated ? "/dashboard" : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-neutral-200 dark:text-neutral-800">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-10 h-10 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={homePath}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 font-medium w-full sm:w-auto justify-center"
          >
            <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 font-medium w-full sm:w-auto justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Here are some helpful links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="text-primary-500 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="text-primary-500 hover:text-primary-600 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/help"
              className="text-primary-500 hover:text-primary-600 transition-colors"
            >
              Help Center
            </Link>
            <Link
              to="/contact"
              className="text-primary-500 hover:text-primary-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
