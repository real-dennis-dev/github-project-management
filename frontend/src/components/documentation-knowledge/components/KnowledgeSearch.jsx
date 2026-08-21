// src/components/documentation-knowledge/components/KnowledgeSearch.jsx

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Button, Input } from "../../common";

const KnowledgeSearch = ({
  onSearch,
  placeholder = "Search knowledge base...",
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          size={18}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          fullWidth
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <Button type="submit" variant="primary">
        Search
      </Button>
    </form>
  );
};

export default KnowledgeSearch;
