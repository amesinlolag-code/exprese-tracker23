// Hunter's Ledger gamification engine
// Pure functions only -> easy to unit test and to mirror on the frontend.

export const XP_PER_LEVEL = 100;

export const RANKS = [
  { rank: "E", minLevel: 1 },
  { rank: "D", minLevel: 5 },
  { rank: "C", minLevel: 10 },
  { rank: "B", minLevel: 15 },
  { rank: "A", minLevel: 20 },
  { rank: "S", minLevel: 30 },
];

export const XP_REWARDS = {
  LOG_EXPENSE: 10,
  QUEST_LOG_A_KILL: 15, // log >= 1 expense today
  QUEST_TRACK_THE_HUNT: 25, // log >= 3 expenses today
  QUEST_CATEGORIZE_THE_LOOT: 20, // >= 2 distinct categories today
  MAX_STREAK_BONUS: 5, // per day of streak, capped
  STREAK_CAP_DAYS: 10,
};

export const DAILY_QUESTS = [
  {
    id: "log_a_kill",
    title: "Log a Kill",
    description: "Log at least 1 expense today.",
    xp: XP_REWARDS.QUEST_LOG_A_KILL,
    check: (progress) => progress.expensesLogged >= 1,
  },
  {
    id: "track_the_hunt",
    title: "Track the Hunt",
    description: "Log 3 or more expenses today.",
    xp: XP_REWARDS.QUEST_TRACK_THE_HUNT,
    check: (progress) => progress.expensesLogged >= 3,
  },
  {
    id: "categorize_the_loot",
    title: "Categorize the Loot",
    description: "Log expenses in 2+ different categories today.",
    xp: XP_REWARDS.QUEST_CATEGORIZE_THE_LOOT,
    check: (progress) => progress.categories.size >= 2 || progress.categories.length >= 2,
  },
];

/** Level from total XP. Level 1 starts at 0 XP; every XP_PER_LEVEL XP gains a level. */
export function levelFromXp(xp) {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

/** XP progress within the current level, for a progress bar. */
export function xpProgress(xp) {
  const level = levelFromXp(xp);
  const levelStartXp = (level - 1) * XP_PER_LEVEL;
  const current = xp - levelStartXp;
  return { current, target: XP_PER_LEVEL, level };
}

/** Rank string from level. */
export function rankFromLevel(level) {
  let current = RANKS[0].rank;
  for (const r of RANKS) {
    if (level >= r.minLevel) current = r.rank;
  }
  return current;
}

/** Next rank info, or null if already max rank. */
export function nextRankInfo(level) {
  for (const r of RANKS) {
    if (level < r.minLevel) return r;
  }
  return null;
}

/** Streak bonus XP, capped. */
export function streakBonus(streakDays) {
  return Math.min(streakDays, XP_REWARDS.STREAK_CAP_DAYS) * XP_REWARDS.MAX_STREAK_BONUS;
}

/**
 * Given today's progress { expensesLogged, categories (array of strings) },
 * and a set of already-completed quest ids for today, return which quests
 * are newly completed and their total XP.
 */
export function evaluateQuests(progress, alreadyCompletedIds = []) {
  const normalized = {
    expensesLogged: progress.expensesLogged || 0,
    categories: Array.isArray(progress.categories) ? progress.categories : Array.from(progress.categories || []),
  };
  const newlyCompleted = [];
  let xpGained = 0;
  for (const quest of DAILY_QUESTS) {
    const done = quest.check({
      expensesLogged: normalized.expensesLogged,
      categories: normalized.categories,
    });
    if (done && !alreadyCompletedIds.includes(quest.id)) {
      newlyCompleted.push(quest.id);
      xpGained += quest.xp;
    }
  }
  return { newlyCompleted, xpGained };
}

/** YYYY-MM-DD in UTC, used as the "day key" for streaks/quests. */
export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Given the last active day key and today's day key, compute the new streak. */
export function computeStreak(previousStreak, lastActiveDayKey, todayKey = dayKey()) {
  if (!lastActiveDayKey) return 1;
  if (lastActiveDayKey === todayKey) return previousStreak || 1;

  const prev = new Date(lastActiveDayKey + "T00:00:00.000Z");
  const today = new Date(todayKey + "T00:00:00.000Z");
  const diffDays = Math.round((today - prev) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return (previousStreak || 0) + 1;
  return 1; // streak broken, restart
}
