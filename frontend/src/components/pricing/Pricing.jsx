// src/components/pricing/Pricing.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faStar,
  faRocket,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      name: "Starter",
      icon: faRocket,
      price: { monthly: 29, yearly: 290 },
      description: "Perfect for small teams just getting started",
      features: [
        "Up to 5 team members",
        "10 projects",
        "Basic expense tracking",
        "GitHub integration",
        "Community support",
        "1GB storage",
      ],
      notIncluded: [
        "Advanced analytics",
        "Custom integrations",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: false,
      color: "primary",
    },
    {
      name: "Professional",
      icon: faStar,
      price: { monthly: 79, yearly: 790 },
      description: "Ideal for growing teams with advanced needs",
      features: [
        "Up to 20 team members",
        "Unlimited projects",
        "Advanced expense tracking",
        "GitHub integration with webhooks",
        "Priority support",
        "50GB storage",
        "Advanced analytics",
        "Custom reports",
      ],
      notIncluded: ["Custom integrations", "Dedicated support"],
      cta: "Start Free Trial",
      popular: true,
      color: "primary",
    },
    {
      name: "Enterprise",
      icon: faCrown,
      price: { monthly: 199, yearly: 1990 },
      description: "For large organizations with enterprise needs",
      features: [
        "Unlimited team members",
        "Unlimited projects",
        "Full expense tracking suite",
        "Complete GitHub integration",
        "24/7 dedicated support",
        "500GB storage",
        "Advanced analytics",
        "Custom integrations",
        "SSO & SAML",
        "Audit logs",
        "Custom contracts",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      popular: false,
      color: "secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Choose Your
            <span className="text-primary-500"> Plan</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Select the perfect plan for your team's needs. All plans include a
            14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm font-medium ${
                billingCycle === "monthly"
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative w-14 h-7 bg-neutral-300 dark:bg-neutral-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billingCycle === "yearly"
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-success font-semibold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border ${
                plan.popular
                  ? "border-primary-500 shadow-lg shadow-primary-500/10"
                  : "border-neutral-200 dark:border-neutral-800"
              } p-8 flex flex-col transition-all hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div
                  className={`w-14 h-14 rounded-full ${
                    plan.color === "primary"
                      ? "bg-primary-500/10"
                      : "bg-secondary-400/10"
                  } flex items-center justify-center mx-auto mb-4`}
                >
                  <FontAwesomeIcon
                    icon={plan.icon}
                    className={`w-7 h-7 ${
                      plan.color === "primary"
                        ? "text-primary-500"
                        : "text-secondary-400"
                    }`}
                  />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {plan.name}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                  $
                  {billingCycle === "monthly"
                    ? plan.price.monthly
                    : plan.price.yearly}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
                {billingCycle === "yearly" && (
                  <p className="text-xs text-success mt-1">
                    Save ${plan.price.monthly * 12 - plan.price.yearly}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="w-4 h-4 text-success mt-0.5 flex-shrink-0"
                      />
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm opacity-60"
                    >
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-neutral-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                to={plan.name === "Enterprise" ? "/contact" : "/signup"}
                className={`mt-8 w-full py-3 px-4 rounded-lg font-medium text-center transition-colors ${
                  plan.popular
                    ? "bg-primary-500 hover:bg-primary-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Need a custom plan?{" "}
            <Link
              to="/contact"
              className="text-primary-500 hover:underline font-medium"
            >
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
