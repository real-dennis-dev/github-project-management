// src/components/documentation-knowledge/components/TagManager.jsx

import React, { useState, useRef } from "react";
import { X, Plus } from "lucide-react";
import { Input, Badge } from "../../common";

const TagManager = ({ tags = [], onChange, placeholder = "Add tag..." }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Generate suggestions based on input
    if (value.trim()) {
      const filtered = tags.filter((tag) =>
        tag.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddTag = (tag) => {
    const newTag = tag || inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setInputValue("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleAddTag(suggestion);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="neutral"
            className="flex items-center gap-1 cursor-pointer hover:bg-neutral-200 transition-colors"
            onClick={() => handleRemoveTag(tag)}
          >
            #{tag}
            <X size={12} className="ml-1" />
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-3 pr-10"
            fullWidth
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => handleAddTag()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-600"
            >
              <Plus size={16} />
            </button>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-sm"
                >
                  #{suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagManager;
