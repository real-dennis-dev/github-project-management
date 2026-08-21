import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      options = [],
      placeholder,
      error,
      helperText,
      fullWidth = false,
      className = "",
      id,
      name,
      value,
      onChange,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    // Generate a fallback ID if none provided
    const selectId = id || name;

    // Base wrapper classes
    const containerClasses = `${fullWidth ? "w-full" : ""} ${className}`.trim();

    // Field state border & ring styles
    const borderClasses = error
      ? "border-error focus:border-error focus:ring-error/20"
      : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20";

    const selectClasses = `
      w-full
      px-3
      py-2
      pr-10
      bg-white
      border
      rounded-lg
      text-neutral-900
      text-sm
      appearance-none
      transition-colors
      duration-150
      ease-in-out
      focus:outline-none
      focus:ring-2
      disabled:bg-neutral-100
      disabled:text-neutral-400
      disabled:cursor-not-allowed
      ${borderClasses}
    `.trim();

    return (
      <div className={containerClasses}>
        {/* Optional Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}

        {/* Select Input Wrapper */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={selectClasses}
            {...props}
          >
            {/* Render placeholder if provided */}
            {placeholder && (
              <option value="" disabled hidden={Boolean(value)}>
                {placeholder}
              </option>
            )}

            {/* Accept children options if passed directly */}
            {children
              ? children
              : /* Otherwise, render options array */
                options.map((opt) => {
                  const optValue = typeof opt === "object" ? opt.value : opt;
                  const optLabel = typeof opt === "object" ? opt.label : opt;
                  return (
                    <option key={optValue} value={optValue}>
                      {optLabel}
                    </option>
                  );
                })}
          </select>

          {/* Custom Chevron Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
            <ChevronDown size={18} />
          </div>
        </div>

        {/* Error or Helper Message */}
        {error ? (
          <p className="mt-1 text-sm text-error">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
