// src/components/support/HelpCenter.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faQuestionCircle,
  faBook,
  faVideo,
  faComments,
  faEnvelope,
  faPhone,
  faMessage,
  faChevronRight,
  faLifeRing,
  faGraduationCap,
  faLightbulb,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: faLifeRing,
      title: "Getting Started",
      description: "Learn the basics and set up your account",
      link: "/help/getting-started",
    },
    {
      icon: faGraduationCap,
      title: "Tutorials",
      description: "Step-by-step guides for all features",
      link: "/help/tutorials",
    },
    {
      icon: faLightbulb,
      title: "Tips & Tricks",
      description: "Best practices and productivity tips",
      link: "/help/tips",
    },
    {
      icon: faHeadset,
      title: "Support",
      description: "Get help from our support team",
      link: "/help/support",
    },
  ];

  const faqs = [
    {
      question: "How do I connect a GitHub repository?",
      answer:
        "Navigate to the GitHub Integration section, click 'Connect Repository', and enter your repository URL and access token.",
    },
    {
      question: "Can I track expenses across multiple projects?",
      answer:
        "Yes, you can track expenses for each project individually and view consolidated reports across all projects.",
    },
    {
      question: "How do I invite team members?",
      answer:
        "Go to Team Management, click 'Invite Member', enter their email address, and select their role.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use enterprise-grade encryption, regular security audits, and comply with industry standards.",
    },
    {
      question: "How do I export my data?",
      answer:
        "You can export data from the Reports section. Available formats include CSV, JSON, and PDF.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-primary-500 mb-4">
            <FontAwesomeIcon icon={faQuestionCircle} className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Help Center
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            How Can We Help?
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Find answers to common questions, browse tutorials, or get in touch
            with our support team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Link
            to="/help/getting-started"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon
              icon={faBook}
              className="text-primary-500 w-5 h-5"
            />
            <span className="text-sm font-medium">Documentation</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
          <Link
            to="/help/video-tutorials"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon icon={faVideo} className="text-success w-5 h-5" />
            <span className="text-sm font-medium">Video Tutorials</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
          <Link
            to="/help/community"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon icon={faComments} className="text-info w-5 h-5" />
            <span className="text-sm font-medium">Community</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
          <Link
            to="/contact"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-warning w-5 h-5"
            />
            <span className="text-sm font-medium">Contact Support</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.link}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                <FontAwesomeIcon icon={category.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                {category.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <FontAwesomeIcon
              icon={faQuestionCircle}
              className="text-primary-500 w-6 h-6"
            />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-b border-neutral-200 dark:border-neutral-800 pb-4 last:border-0 last:pb-0"
                >
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">
              No results found for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faMessage} className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Live Chat
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Chat with our support team
            </p>
            <Link
              to="/contact?type=chat"
              className="text-primary-500 hover:underline text-sm font-medium"
            >
              Start Chat →
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-info/10 text-info flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Email Support
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              We'll get back within 24 hours
            </p>
            <Link
              to="/contact?type=email"
              className="text-primary-500 hover:underline text-sm font-medium"
            >
              Send Email →
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-warning/10 text-warning flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faPhone} className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Phone Support
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Available 9am - 5pm EST
            </p>
            <Link
              to="/contact?type=phone"
              className="text-primary-500 hover:underline text-sm font-medium"
            >
              Call Us →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
