// src/components/journal/JournalCalendar.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useJournal } from "../../hooks/useJournal";
import {
  Button,
  Badge,
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from "../common";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";

const JournalCalendar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    entries,
    isLoading,
    error,
    refetchEntries,
    getMoodLabel,
    getMoodBgColor,
  } = useJournal(projectId);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [entriesByDate, setEntriesByDate] = useState({});

  useEffect(() => {
    refetchEntries();
  }, [projectId]);

  useEffect(() => {
    // Group entries by date
    const grouped = {};
    entries.forEach((entry) => {
      if (entry.entry_date) {
        if (!grouped[entry.entry_date]) {
          grouped[entry.entry_date] = [];
        }
        grouped[entry.entry_date].push(entry);
      }
    });
    setEntriesByDate(grouped);
  }, [entries]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthName = (month) => {
    const names = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return names[month];
  };

  const getWeekdayNames = () => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const entries = entriesByDate[dateStr] || [];
    if (entries.length > 0) {
      // Navigate to the first entry for that date
      navigate(`/projects/${projectId}/journal/${entries[0].id}`);
    } else {
      // Create new entry for that date
      navigate(`/projects/${projectId}/journal/new`, {
        state: { date: dateStr },
      });
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const weeks = [];
    let days = [];

    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const hasEntry = !!entriesByDate[dateStr];
      const isToday = dateStr === todayStr;
      const entry = entriesByDate[dateStr]?.[0];

      days.push({
        day,
        date,
        dateStr,
        hasEntry,
        isToday,
        entry,
      });

      if (days.length === 7) {
        weeks.push(days);
        days = [];
      }
    }

    // Fill remaining cells
    while (days.length < 7 && days.length > 0) {
      days.push(null);
    }
    if (days.length > 0) {
      weeks.push(days);
    }

    return weeks;
  };

  const weeks = renderCalendar();

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load journal entries"
        description={error}
        onRetry={refetchEntries}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/journal`}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
              Journal Calendar
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              View and manage your journal entries by date
            </p>
          </div>
        </div>
        <Link to={`/projects/${projectId}/journal/new`}>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-800">
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {entries.length} entries total
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-300 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-neutral-50 dark:bg-neutral-200 border-b border-neutral-200 dark:border-neutral-300">
          {getWeekdayNames().map((name) => (
            <div
              key={name}
              className="py-2 text-center text-sm font-medium text-neutral-600 dark:text-neutral-500"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-300 last:border-b-0"
          >
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className="aspect-square bg-neutral-50 dark:bg-neutral-200"
                  />
                );
              }

              const isToday = day.isToday;
              const hasEntry = day.hasEntry;
              const entry = day.entry;

              return (
                <button
                  key={day.day}
                  onClick={() => handleDateClick(day.date)}
                  className={`
                    aspect-square flex flex-col items-center justify-center p-1
                    hover:bg-neutral-100 dark:hover:bg-neutral-300 transition-colors
                    relative
                    ${isToday ? "bg-primary-500/10 dark:bg-primary-400/10" : ""}
                  `}
                >
                  <span
                    className={`
                      text-sm font-medium
                      ${
                        isToday
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-neutral-700 dark:text-neutral-600"
                      }
                      ${hasEntry ? "font-bold" : ""}
                    `}
                  >
                    {day.day}
                  </span>
                  {hasEntry && entry && (
                    <div className="mt-1">
                      <span className="text-lg">{entry.mood || "😐"}</span>
                    </div>
                  )}
                  {isToday && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-500">
            Today
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-500">
            Has Entry
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-neutral-300 dark:border-neutral-400" />
          <span className="text-sm text-neutral-600 dark:text-neutral-500">
            No Entry
          </span>
        </div>
      </div>

      {/* Entry count summary */}
      {Object.keys(entriesByDate).length > 0 && (
        <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-200 rounded-lg">
          <p className="text-sm text-neutral-600 dark:text-neutral-500">
            <span className="font-medium">
              {Object.keys(entriesByDate).length}
            </span>{" "}
            days with entries out of{" "}
            {new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0
            ).getDate()}{" "}
            days
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalCalendar;
