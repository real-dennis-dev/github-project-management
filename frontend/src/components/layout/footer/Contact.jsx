// src/components/contact/Contact.jsx

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faPaperPlane,
  faCheckCircle,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      // Handle form submission here
      console.log("Form submitted:", formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Message Sent!
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Thank you for reaching out. We'll get back to you as soon as
            possible.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: "", email: "", subject: "", message: "" });
            }}
            className="text-primary-500 hover:underline font-medium"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Info */}
          <div>
            <div className="mb-8">
              <span className="text-sm font-semibold text-primary-500 uppercase tracking-wider">
                Contact Us
              </span>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mt-2">
                Get in Touch
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-2">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    Email
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    support@projmate.com
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    sales@projmate.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faPhone} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    Phone
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    +1 (555) 123-4567
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    +1 (555) 765-4321
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    Location
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    123 Tech Street
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faClock} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    Hours
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Mon - Fri: 9am - 6pm EST
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Weekend: 10am - 4pm EST
                  </p>
                </div>
              </div>
            </div>

            {/* Live Chat Badge */}
            <div className="mt-8 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-success rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Live Chat Available
                    </p>
                    <p className="text-xs text-neutral-500">
                      Response within 2 minutes
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                  <FontAwesomeIcon icon={faMessage} className="w-4 h-4" />
                  Chat Now
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white ${
                    errors.name
                      ? "border-error"
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-error mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white ${
                    errors.email
                      ? "border-error"
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-error mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white ${
                    errors.subject
                      ? "border-error"
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                  placeholder="How can we help you?"
                />
                {errors.subject && (
                  <p className="text-xs text-error mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white ${
                    errors.message
                      ? "border-error"
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                  placeholder="Tell us about your question or feedback..."
                />
                {errors.message && (
                  <p className="text-xs text-error mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
