// src/components/footer/FooterRoutes.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";

// Import all footer-related components
import Features from "../features/Features";
import Pricing from "../pricing/Pricing";
import Docs from "../docs/Docs";
import Changelog from "../changelog/Changelog";
import HelpCenter from "../support/HelpCenter";
import Contact from "../contact/Contact";

// Legal pages (placeholder components)
const PrivacyPolicy = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4">
    <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
        Privacy Policy
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-neutral-600 dark:text-neutral-400">
          Last updated: January 2024
        </p>
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you
          create an account, use our services, or contact us for support.
        </p>
        <h2>How We Use Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve
          our services, and to communicate with you.
        </p>
        <h2>Information Sharing</h2>
        <p>
          We do not share your personal information with third parties except as
          described in this policy.
        </p>
        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information.
        </p>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at privacy@projmate.com.
        </p>
      </div>
    </div>
  </div>
);

const TermsOfService = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4">
    <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
        Terms of Service
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-neutral-600 dark:text-neutral-400">
          Last updated: January 2024
        </p>
        <h2>Acceptance of Terms</h2>
        <p>By using ProjMate, you agree to these terms and conditions.</p>
        <h2>User Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account and
          for all activities that occur under your account.
        </p>
        <h2>Payment Terms</h2>
        <p>
          Fees for paid services are billed on a monthly or annual basis and are
          non-refundable.
        </p>
        <h2>Content and Data</h2>
        <p>
          You retain ownership of your content and data. We do not claim
          ownership of any content you create.
        </p>
        <h2>Termination</h2>
        <p>
          We may terminate or suspend your account at any time, with or without
          cause.
        </p>
        <h2>Contact</h2>
        <p>
          For questions about these terms, please contact us at
          legal@projmate.com.
        </p>
      </div>
    </div>
  </div>
);

const FooterRoutes = () => {
  return (
    <Routes>
      {/* Main footer links */}
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/docs/*" element={<Docs />} />
      <Route path="/changelog" element={<Changelog />} />

      {/* Support links */}
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/help/*" element={<HelpCenter />} />
      <Route path="/contact" element={<Contact />} />

      {/* Legal pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Redirect */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default FooterRoutes;
