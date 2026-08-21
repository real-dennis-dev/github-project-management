// src/components/common/Tabs.jsx
import React, { createContext, useContext, useRef } from "react";

const TabsContext = createContext(null);

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      "Tab and TabList components must be rendered inside <Tabs>"
    );
  }
  return context;
};

export const Tabs = ({ value, onChange, children, className = "" }) => {
  const tabListRef = useRef(null);

  // Keyboard navigation support (Arrow Left/Right)
  const handleKeyDown = (e) => {
    if (!tabListRef.current) return;

    const tabs = Array.from(
      tabListRef.current.querySelectorAll('[role="tab"]:not([disabled])')
    );
    const currentIndex = tabs.findIndex(
      (tab) => tab === document.activeElement
    );

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    tabs[nextIndex].focus();
    const tabValue = tabs[nextIndex].getAttribute("data-value");
    if (tabValue) onChange(tabValue);
  };

  return (
    <TabsContext.Provider value={{ activeValue: value, onChange }}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Tabs"
        onKeyDown={handleKeyDown}
        className={`flex space-x-1 border-b border-neutral-200 overflow-x-auto scrollbar-none ${className}`}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export default Tabs;
