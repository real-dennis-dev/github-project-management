// src/components/common/SearchBar.jsx (Enhanced)
import React, { useState } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Search...",
  className = "",
  fullWidth = true,
  loading = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <div
        className={`
        relative flex items-center
        bg-neutral-200 border rounded-lg transition-all
        ${
          isFocused
            ? "border-primary-500 ring-2 ring-primary-500/20"
            : "border-neutral-300"
        }
        ${loading ? "opacity-50" : ""}
      `}
      >
        <Search className="absolute left-3 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full py-2 pl-9 pr-10
            bg-transparent
            text-neutral-900
            placeholder-neutral-500
            focus:outline-none
            disabled:opacity-50
          `}
          disabled={loading}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {onSearch && <button type="submit" className="hidden" />}
    </form>
  );
};

export default SearchBar;
