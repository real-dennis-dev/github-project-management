// src/components/Navbar.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
  faCog,
  faHome,
  faProjectDiagram,
  faCode,
  faBook,
  faClipboardList,
  faChartLine,
  faBell,
  faSun,
  faMoon,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./common/index";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "New expense added", read: false },
    { id: 2, message: "Project update available", read: false },
  ]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  const navLinks = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard", icon: faHome },
        { to: "/projects", label: "Projects", icon: faProjectDiagram },
        { to: "/github", label: "GitHub", icon: faCode },
        { to: "/journal", label: "Journal", icon: faBook },
        { to: "/expenses", label: "Expenses", icon: faClipboardList },
        { to: "/tech-debt", label: "Tech Debt", icon: faChartLine },
      ]
    : [];

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg"
          : "bg-white dark:bg-neutral-900 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              Proj<span className="text-primary-500">Mate</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive(link.to)
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <FontAwesomeIcon icon={link.icon} className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {isAuthenticated && (
              <button
                className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Notifications"
              >
                <FontAwesomeIcon
                  icon={faBell}
                  className="w-5 h-5 text-neutral-600 dark:text-neutral-300"
                />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle size="sm" />

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`w-3 h-3 text-neutral-500 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-neutral-200 dark:border-neutral-700 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors w-full"
                        >
                          <FontAwesomeIcon
                            icon={faSignOutAlt}
                            className="w-4 h-4"
                          />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon
                icon={isMenuOpen ? faTimes : faBars}
                className="w-5 h-5 text-neutral-600 dark:text-neutral-300"
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                    isActive(link.to)
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
