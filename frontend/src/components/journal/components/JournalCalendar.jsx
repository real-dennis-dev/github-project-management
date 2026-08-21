import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useJournal from "../hooks/useJournal";
import { Card, Button, LoadingSpinner, EmptyState, Badge } from "../../common";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  getMonth,
  getYear,
} from "date-fns";

const MOOD_EMOJIS = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];

const JournalCalendar = ({ projectId }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const { fetchMonthEntries, getEntryByDate, moodOptions, loading, error } =
    useJournal(projectId);

  // Load month data when month changes
  useMemo(() => {
    const loadMonth = async () => {
      const year = getYear(currentDate);
      const month = getMonth(currentDate) + 1;
      setLoadingMonth(true);
      try {
        const data = await fetchMonthEntries(year, month);
        if (data) {
          setMonthData(data);
        }
      } finally {
        setLoadingMonth(false);
      }
    };
    loadMonth();
  }, [currentDate, fetchMonthEntries]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEntryForDate = (date) => {
    if (!monthData?.entries) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    return monthData.entries.find((entry) => entry.entry_date === dateStr);
  };

  const getDayMood = (date) => {
    const entry = getEntryForDate(date);
    return entry?.mood || null;
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    // Navigate to entry for this date or create new
    const entry = getEntryForDate(date);
    if (entry) {
      navigate(`/${entry.id}`);
    } else {
      // Navigate to create with date pre-filled
      navigate("new", { state: { date: format(date, "yyyy-MM-dd") } });
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getMoodEmoji = (mood) => {
    return mood || "📝";
  };

  const getMoodColor = (mood) => {
    const colors = {
      "😊": "bg-green-100 border-green-400",
      "🎉": "bg-green-100 border-green-400",
      "🤔": "bg-blue-100 border-blue-400",
      "😐": "bg-gray-100 border-gray-400",
      "😴": "bg-yellow-100 border-yellow-400",
      "😔": "bg-orange-100 border-orange-400",
      "😰": "bg-red-100 border-red-400",
      "😡": "bg-red-100 border-red-400",
    };
    return colors[mood] || "bg-neutral-100 border-neutral-300";
  };

  if (loading && !monthData) {
    return <LoadingSpinner size="lg" className="mx-auto my-12" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Journal Calendar - {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            →
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-neutral-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const mood = getDayMood(day);
          const hasEntry = !!getEntryForDate(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`
                relative aspect-square p-2 rounded-lg border-2 transition-all
                ${
                  isCurrentMonth ? "bg-white" : "bg-neutral-50 text-neutral-400"
                }
                ${
                  isTodayDate
                    ? "border-primary-500 ring-2 ring-primary-500/20"
                    : "border-transparent"
                }
                ${isSelected ? "border-primary-500 bg-primary-50" : ""}
                ${hasEntry ? "hover:shadow-md" : "hover:bg-neutral-100"}
                ${!isCurrentMonth ? "opacity-50" : ""}
                focus:outline-none focus:ring-2 focus:ring-primary-500/40
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span
                  className={`
                    text-sm font-medium
                    ${isTodayDate ? "text-primary-600" : ""}
                    ${isCurrentMonth ? "text-neutral-800" : "text-neutral-400"}
                  `}
                >
                  {format(day, "d")}
                </span>
                {hasEntry && (
                  <span className="text-xl mt-0.5">{getMoodEmoji(mood)}</span>
                )}
                {isTodayDate && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-200">
        <span className="text-sm text-neutral-500">Legend:</span>
        {moodOptions.map((mood) => (
          <div key={mood} className="flex items-center gap-1">
            <span
              className={`w-4 h-4 rounded border-2 ${getMoodColor(mood)}`}
            />
            <span className="text-sm">{mood}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded border-2 bg-neutral-100 border-neutral-300" />
          <span className="text-sm">📝</span>
        </div>
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <Card className="p-4 mt-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">
                {format(selectedDate, "MMMM d, yyyy")}
              </span>
              {getEntryForDate(selectedDate) ? (
                <Badge variant="success" className="ml-2">
                  ✅ Has entry
                </Badge>
              ) : (
                <Badge variant="neutral" className="ml-2">
                  No entry
                </Badge>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDateClick(selectedDate)}
            >
              {getEntryForDate(selectedDate) ? "View Entry" : "Create Entry"}
            </Button>
          </div>
        </Card>
      )}

      {/* Month summary */}
      {monthData?.summary && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">Month Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Total Entries</div>
              <div className="text-lg font-bold">
                {monthData.summary.total || 0}
              </div>
            </div>
            {monthData.summary.moodTrend && (
              <>
                <div>
                  <div className="text-sm text-neutral-500">Dominant Mood</div>
                  <div className="text-lg">
                    {monthData.summary.moodTrend.dominantMood || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Average Score</div>
                  <div className="text-lg">
                    {monthData.summary.moodTrend.averageScore?.toFixed(1) ||
                      "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500">Month</div>
                  <div className="text-lg">
                    {format(currentDate, "MMMM yyyy")}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JournalCalendar;
