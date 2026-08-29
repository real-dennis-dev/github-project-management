// src/components/Footer.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faTwitter,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faHeart,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                Proj<span className="text-primary-500">Mate</span>
              </span>
            </Link>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-md">
              Streamline your project management with powerful tools for
              tracking expenses, technical debt, GitHub integration, and more.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-primary-500 transition-colors"
                aria-label="GitHub"
              >
                <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-primary-500 transition-colors"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-primary-500 transition-colors"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-primary-500 transition-colors"
                aria-label="YouTube"
              >
                <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/docs"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/changelog"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                support@projmate.com
              </span>
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                +1 (555) 123-4567
              </span>
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                123 Tech Street, SF, CA 94105
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              Made with{" "}
              <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-error" />{" "}
              &copy; {currentYear} ProjMate
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
