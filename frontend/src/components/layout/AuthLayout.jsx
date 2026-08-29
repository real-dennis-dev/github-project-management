import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Top bar */}
      <header className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            {/* Replace with your logo if you have one */}
            <span className="text-primary-600 dark:text-primary-400">
              ProjMate
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 sm:p-10">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Optional footer */}
      <footer className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>
          © {new Date().getFullYear()} ProjMate.{" "}
          <Link
            to="/privacy"
            className="hover:text-neutral-700 dark:hover:text-neutral-300 underline-offset-2 hover:underline"
          >
            Privacy
          </Link>{" "}
          ·{" "}
          <Link
            to="/terms"
            className="hover:text-neutral-700 dark:hover:text-neutral-300 underline-offset-2 hover:underline"
          >
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;
