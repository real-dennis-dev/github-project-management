/**
 * Journal Utilities
 * Handles journal-related helper functions
 */
class JournalUtils {
  /**
   * Validates mood enum value
   * @param {string} mood - Mood emoji to validate
   * @returns {boolean} - True if valid
   */
  validateMood(mood) {
    const validMoods = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];
    return validMoods.includes(mood);
  }

  /**
   * Formats journal date for display
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string (default: 'MMM DD, YYYY')
   * @returns {string} - Formatted date
   */
  formatJournalDate(date, format = "MMM DD, YYYY") {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    // Format: MMM DD, YYYY
    if (format === "MMM DD, YYYY") {
      return `${month} ${day.toString().padStart(2, "0")}, ${year}`;
    }

    // Format: YYYY-MM-DD
    if (format === "YYYY-MM-DD") {
      return `${year}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
    }

    // Format: DD/MM/YYYY
    if (format === "DD/MM/YYYY") {
      return `${day.toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${year}`;
    }

    // Format: Full date with time
    if (format === "full") {
      return d.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return d.toISOString().split("T")[0];
  }

  /**
   * Calculates mood trends from entries
   * @param {Array} entries - Journal entries
   * @returns {Object} - Mood trend analysis
   */
  calculateMoodTrend(entries) {
    if (!entries || entries.length === 0) {
      return {
        overall: "neutral",
        trend: "stable",
        distribution: {},
        weeklyAverage: null,
        dominantMood: null,
        moodChanges: [],
      };
    }

    // Count mood distribution
    const distribution = entries.reduce((acc, entry) => {
      const mood = entry.mood || "😐";
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    // Find dominant mood
    let dominantMood = null;
    let maxCount = 0;
    for (const [mood, count] of Object.entries(distribution)) {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    }

    // Calculate mood score (1-5 scale)
    const moodScores = {
      "😊": 5,
      "🎉": 5,
      "🤔": 3.5,
      "😐": 3,
      "😔": 2,
      "😴": 2.5,
      "😡": 1.5,
      "😰": 1,
    };

    const totalScore = entries.reduce((sum, entry) => {
      return sum + (moodScores[entry.mood] || 3);
    }, 0);

    const averageScore = totalScore / entries.length;

    // Determine overall mood
    let overall = "neutral";
    if (averageScore >= 4.5) overall = "excellent";
    else if (averageScore >= 3.5) overall = "good";
    else if (averageScore >= 2.5) overall = "neutral";
    else if (averageScore >= 1.5) overall = "poor";
    else overall = "bad";

    // Calculate trend (last 7 days vs previous 7 days)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.entry_date) - new Date(b.entry_date)
    );

    const recent = sortedEntries.slice(-7);
    const previous = sortedEntries.slice(-14, -7);

    const recentAvg =
      recent.reduce((sum, e) => sum + (moodScores[e.mood] || 3), 0) /
      (recent.length || 1);
    const previousAvg =
      previous.reduce((sum, e) => sum + (moodScores[e.mood] || 3), 0) /
      (previous.length || 1);

    let trend = "stable";
    if (recentAvg > previousAvg + 0.5) trend = "improving";
    else if (recentAvg < previousAvg - 0.5) trend = "declining";

    // Calculate weekly average
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekEntries = entries.filter(
      (e) => new Date(e.entry_date) >= weekAgo
    );
    const weeklyAverage =
      weekEntries.length > 0
        ? weekEntries.reduce((sum, e) => sum + (moodScores[e.mood] || 3), 0) /
          weekEntries.length
        : null;

    // Detect mood changes
    const moodChanges = [];
    for (let i = 1; i < sortedEntries.length; i++) {
      const prev = sortedEntries[i - 1];
      const curr = sortedEntries[i];
      const prevScore = moodScores[prev.mood] || 3;
      const currScore = moodScores[curr.mood] || 3;

      if (Math.abs(currScore - prevScore) >= 1.5) {
        moodChanges.push({
          date: curr.entry_date,
          from: prev.mood,
          to: curr.mood,
          change: currScore - prevScore,
          description: currScore > prevScore ? "Improvement" : "Decline",
        });
      }
    }

    return {
      overall,
      trend,
      distribution,
      weeklyAverage: weeklyAverage ? Math.round(weeklyAverage * 10) / 10 : null,
      dominantMood,
      averageScore: Math.round(averageScore * 10) / 10,
      totalEntries: entries.length,
      moodChanges: moodChanges.slice(-5), // Last 5 changes
    };
  }

  /**
   * Extracts tags from journal entry content
   * @param {Object} entry - Journal entry
   * @returns {Array} - Extracted tags
   */
  extractJournalTags(entry) {
    const tags = [];
    const content = [
      entry.finished_today,
      entry.problems,
      entry.tomorrow_plan,
      entry.notes,
    ]
      .filter(Boolean)
      .join(" ");

    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      tags.push(match[1].toLowerCase());
    }

    // Extract common keywords (simple implementation)
    const keywords = [
      "meeting",
      "deadline",
      "bug",
      "feature",
      "deploy",
      "review",
      "design",
      "planning",
      "debug",
      "testing",
      "release",
      "fix",
      "update",
      "improve",
      "optimize",
      "refactor",
      "discuss",
    ];

    keywords.forEach((keyword) => {
      if (content.toLowerCase().includes(keyword)) {
        tags.push(keyword);
      }
    });

    // Remove duplicates and return unique tags
    return [...new Set(tags)];
  }

  /**
   * Generates weekly summary from journal entries
   * @param {Array} entries - Journal entries for the week
   * @returns {Object} - Weekly summary
   */
  generateWeeklySummary(entries) {
    if (!entries || entries.length === 0) {
      return {
        hasEntries: false,
        message: "No journal entries for this week",
        summary: null,
      };
    }

    // Sort entries by date
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.entry_date) - new Date(b.entry_date)
    );

    // Get mood scores
    const moodScores = {
      "😊": 5,
      "🎉": 5,
      "🤔": 3.5,
      "😐": 3,
      "😔": 2,
      "😴": 2.5,
      "😡": 1.5,
      "😰": 1,
    };

    // Calculate statistics
    const totalEntries = entries.length;
    const completedDays = entries.filter(
      (e) => e.finished_today && e.finished_today.trim()
    ).length;
    const problemDays = entries.filter(
      (e) => e.problems && e.problems.trim()
    ).length;
    const plannedDays = entries.filter(
      (e) => e.tomorrow_plan && e.tomorrow_plan.trim()
    ).length;

    // Calculate average mood
    const avgMood =
      entries.reduce((sum, e) => sum + (moodScores[e.mood] || 3), 0) /
      entries.length;

    // Find best and worst days
    let bestDay = null;
    let worstDay = null;
    let bestScore = -1;
    let worstScore = 6;

    entries.forEach((entry) => {
      const score = moodScores[entry.mood] || 3;
      if (score > bestScore) {
        bestScore = score;
        bestDay = entry;
      }
      if (score < worstScore) {
        worstScore = score;
        worstDay = entry;
      }
    });

    // Extract common accomplishments
    const accomplishments = entries
      .filter((e) => e.finished_today && e.finished_today.trim())
      .map((e) => e.finished_today.trim())
      .join(". ");

    // Extract common problems
    const problems = entries
      .filter((e) => e.problems && e.problems.trim())
      .map((e) => e.problems.trim())
      .join(". ");

    // Generate summary text
    const moodEmojis = ["😊", "🎉", "😐", "🤔", "😔", "😴", "😡", "😰"];
    const dominantMood = entries.reduce((acc, e) => {
      const mood = e.mood || "😐";
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    let dominantMoodKey = "😐";
    let maxCount = 0;
    for (const [mood, count] of Object.entries(dominantMood)) {
      if (count > maxCount) {
        maxCount = count;
        dominantMoodKey = mood;
      }
    }

    let moodLabel = "neutral";
    if (avgMood >= 4.5) moodLabel = "very positive";
    else if (avgMood >= 3.5) moodLabel = "positive";
    else if (avgMood >= 2.5) moodLabel = "neutral";
    else if (avgMood >= 1.5) moodLabel = "negative";
    else moodLabel = "very negative";

    const summary = {
      weekRange: {
        start: this.formatJournalDate(sortedEntries[0].entry_date),
        end: this.formatJournalDate(
          sortedEntries[sortedEntries.length - 1].entry_date
        ),
      },
      totalEntries,
      completionRate: Math.round((completedDays / totalEntries) * 100),
      problemRate: Math.round((problemDays / totalEntries) * 100),
      planningRate: Math.round((plannedDays / totalEntries) * 100),
      averageMood: Math.round(avgMood * 10) / 10,
      moodLabel,
      dominantMood: dominantMoodKey,
      bestDay: bestDay
        ? {
            date: this.formatJournalDate(bestDay.entry_date),
            mood: bestDay.mood,
            accomplishment: bestDay.finished_today,
          }
        : null,
      worstDay: worstDay
        ? {
            date: this.formatJournalDate(worstDay.entry_date),
            mood: worstDay.mood,
            problem: worstDay.problems,
          }
        : null,
      keyAccomplishments: accomplishments
        .split(".")
        .filter((s) => s.trim())
        .slice(0, 5),
      keyProblems: problems
        .split(".")
        .filter((s) => s.trim())
        .slice(0, 5),
      summaryText:
        `This week had ${totalEntries} journal entries with ${completedDays} days of documented accomplishments. ` +
        `The overall mood was ${moodLabel} (${
          Math.round(avgMood * 10) / 10
        }/5). ` +
        `${problemDays} days had reported problems, and ${plannedDays} days had plans for tomorrow.`,
    };

    return {
      hasEntries: true,
      summary,
    };
  }

  /**
   * Gets mood options for UI
   * @returns {Array} - Mood options with labels
   */
  getMoodOptions() {
    return [
      { value: "😊", label: "Happy", emoji: "😊", score: 5 },
      { value: "🎉", label: "Excited", emoji: "🎉", score: 5 },
      { value: "🤔", label: "Thoughtful", emoji: "🤔", score: 3.5 },
      { value: "😐", label: "Neutral", emoji: "😐", score: 3 },
      { value: "😔", label: "Sad", emoji: "😔", score: 2 },
      { value: "😴", label: "Tired", emoji: "😴", score: 2.5 },
      { value: "😡", label: "Frustrated", emoji: "😡", score: 1.5 },
      { value: "😰", label: "Anxious", emoji: "😰", score: 1 },
    ];
  }

  /**
   * Gets mood emoji by mood string
   * @param {string} mood - Mood emoji
   * @returns {string} - Emoji character
   */
  getMoodEmoji(mood) {
    const validMoods = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];
    return validMoods.includes(mood) ? mood : "😐";
  }

  /**
   * Gets mood color for UI
   * @param {string} mood - Mood emoji
   * @returns {string} - Color code
   */
  getMoodColor(mood) {
    const colors = {
      "😊": "#4CAF50",
      "🎉": "#FFD700",
      "🤔": "#FFA726",
      "😐": "#9E9E9E",
      "😔": "#78909C",
      "😴": "#5C6BC0",
      "😡": "#F44336",
      "😰": "#D32F2F",
    };
    return colors[mood] || "#9E9E9E";
  }

  /**
   * Validates journal data
   * @param {Object} data - Journal data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateJournalData(data) {
    const errors = [];

    if (data.finished_today && data.finished_today.length > 2000) {
      errors.push("Finished today content exceeds 2000 characters");
    }

    if (data.problems && data.problems.length > 2000) {
      errors.push("Problems content exceeds 2000 characters");
    }

    if (data.tomorrow_plan && data.tomorrow_plan.length > 2000) {
      errors.push("Tomorrow plan content exceeds 2000 characters");
    }

    if (data.notes && data.notes.length > 5000) {
      errors.push("Notes content exceeds 5000 characters");
    }

    if (data.mood && !this.validateMood(data.mood)) {
      errors.push("Invalid mood value");
    }

    if (data.entry_date) {
      const date = new Date(data.entry_date);
      if (isNaN(date.getTime())) {
        errors.push("Invalid entry date");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculates journal activity streak
   * @param {Array} entries - Journal entries
   * @returns {Object} - Streak information
   */
  calculateStreak(entries) {
    if (!entries || entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalDays: 0 };
    }

    // Get unique dates
    const dates = entries
      .map((e) => new Date(e.entry_date).toISOString().split("T")[0])
      .sort();

    const uniqueDates = [...new Set(dates)];

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const date of uniqueDates) {
      if (prevDate) {
        const diff =
          (new Date(date) - new Date(prevDate)) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = date;
    }

    return {
      currentStreak,
      longestStreak,
      totalDays: uniqueDates.length,
    };
  }

  /**
   * Formats journal entry for display
   * @param {Object} entry - Journal entry
   * @returns {Object} - Formatted entry
   */
  formatJournalEntry(entry) {
    return {
      ...entry,
      formatted_date: this.formatJournalDate(entry.entry_date),
      mood_display: {
        emoji: entry.mood || "😐",
        color: this.getMoodColor(entry.mood || "😐"),
      },
      tags: this.extractJournalTags(entry),
      has_content: {
        finished_today: !!(entry.finished_today && entry.finished_today.trim()),
        problems: !!(entry.problems && entry.problems.trim()),
        tomorrow_plan: !!(entry.tomorrow_plan && entry.tomorrow_plan.trim()),
        notes: !!(entry.notes && entry.notes.trim()),
      },
      entry_date_formatted: this.formatJournalDate(entry.entry_date, "full"),
    };
  }
}

const journalUtils = new JournalUtils();

module.exports = journalUtils;
module.exports.journalUtils = journalUtils;
