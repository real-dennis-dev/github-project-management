// src/components/LandingPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faShieldAlt,
  faUsers,
  faCode,
  faChartLine,
  faClipboardList,
  faWallet,
  faBook,
  faArrowRight,
  faCheckCircle,
  faStar,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { FaGithub } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";

const LandingPage = () => {
  const features = [
    {
      icon: FaGithub,
      title: "GitHub Integration",
      description:
        "Connect your repositories and track commits, PRs, and issues seamlessly.",
      color: "text-primary-500",
    },
    {
      icon: faWallet,
      title: "Expense Tracking",
      description:
        "Monitor project expenses, categorize spending, and generate reports.",
      color: "text-success",
    },
    {
      icon: faBook,
      title: "Project Journal",
      description:
        "Document your journey with structured entries and knowledge sharing.",
      color: "text-info",
    },
    {
      icon: faClipboardList,
      title: "Technical Debt",
      description:
        "Identify, track, and manage technical debt across your projects.",
      color: "text-warning",
    },
    {
      icon: faUsers,
      title: "Team Collaboration",
      description:
        "Work together with your team in real-time on project tasks.",
      color: "text-secondary-500",
    },
    {
      icon: faShieldAlt,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control.",
      color: "text-error",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO, TechFlow Inc.",
      content:
        "ProjMate has transformed how we manage our projects. The GitHub integration alone saved us countless hours.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Lead Developer, CodeCraft",
      content:
        "The expense tracking and technical debt features give us complete visibility into our project health.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager, InnovateLabs",
      content:
        "I love the journal feature. It helps us maintain context and knowledge across our entire team.",
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 dark:from-primary-950/20 via-white dark:via-neutral-950 to-white dark:to-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                New features available
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white leading-tight">
                Streamline Your
                <span className="text-primary-500"> Project Management</span>
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl">
                Everything you need to manage projects, track expenses, monitor
                technical debt, and collaborate with your team in one powerful
                platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 font-medium"
                >
                  Get Started Free
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </Link>
                <Link
                  to="/demo"
                  className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 font-medium"
                >
                  <FontAwesomeIcon icon={faPlay} className="w-4 h-4" />
                  Watch Demo
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="w-4 h-4 text-success"
                  />
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="w-4 h-4 text-success"
                  />
                  Free 14-day trial
                </span>
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-2xl opacity-20"></div>
                <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                  <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faRocket}
                      className="w-16 h-16 text-neutral-400 dark:text-neutral-600"
                    />
                    <span className="absolute bottom-4 right-4 text-xs text-neutral-500">
                      Dashboard Preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Powerful features designed to help you manage projects efficiently
              and effectively.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-${feature.color.replace(
                    "text-",
                    ""
                  )}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className={`w-6 h-6 ${feature.color}`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              See what our customers have to say about their experience with
              ProjMate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "text-yellow-400"
                          : "text-neutral-300 dark:text-neutral-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of teams already using ProjMate to manage their
            projects more effectively.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
            >
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
