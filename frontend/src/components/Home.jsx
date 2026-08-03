// src/components/Home.jsx  (or src/pages/Home.jsx)

import React from "react";
import { useAuth } from "../context/AuthContext"; // adjust path if needed
import { Link } from "react-router-dom";

const Home = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Home</h1>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">
                {user?.email || user?.name || "User"}
              </span>
              <button
                type="button"
                onClick={() => logout?.()}
                className="text-sm px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="text-sm px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {isAuthenticated ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h2>
            <p className="text-gray-600 mb-8">
              You’re signed in. This is your home page.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/auth/sessions"
                className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300"
              >
                <h3 className="font-medium text-gray-900">Sessions</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage active login sessions
                </p>
              </Link>
              <Link
                to="/auth/change-password"
                className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300"
              >
                <h3 className="font-medium text-gray-900">Change password</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Update your account password
                </p>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-600 mb-8">
              You’re browsing as a guest. Sign in to access your dashboard and
              account settings.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/auth/login"
                className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300"
              >
                <h3 className="font-medium text-gray-900">Login</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Access your account
                </p>
              </Link>
              <Link
                to="/auth/register"
                className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300"
              >
                <h3 className="font-medium text-gray-900">Create account</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Register a new account
                </p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
