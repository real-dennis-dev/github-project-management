// src/components/common/Tab.jsx
import React from "react";
import { useTabsContext } from "./Tabs";

export const Tab = ({
  value,
  children,
  icon,
  disabled = false,
  className = "",
}) => {
  const { activeValue, onChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-controls={`tabpanel-${value}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      data-value={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(value)}
      className={`
        group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out border-b-2 outline-none whitespace-nowrap cursor-pointer
        ${
          isActive
            ? "border-primary-600 text-primary-600 font-semibold"
            : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed hover:text-neutral-500 hover:border-transparent"
            : ""
        }
        ${className}
      `}
    >
      {icon && (
        <span
          className={`transition-colors duration-150 ${
            isActive
              ? "text-primary-600"
              : "text-neutral-400 group-hover:text-neutral-500"
          }`}
        >
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Tab;
