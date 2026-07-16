import {
  XP_REWARDS,
  evaluateQuests,
  dayKey,
  computeStreak,
  streakBonus,
  levelFromXp,
  rankFromLevel,
} from "./gamification.js";

/**
 * Mutates `user` in place to reflect the effect of logging a new expense.
 * Returns a summary of what changed, useful for a "system message" toast on the frontend.
 * Does NOT save the user - caller is responsible for user.save().
 */
export function applyExpenseXp(user, expense) {
  const today = dayKey();
  const wasNewDay = user.lastActiveDayKey !== today;

  // Roll over daily progress if it's a new day
  if (wasNewDay) {
    const newStreak = computeStreak(user.streak, user.lastActiveDayKey, today);
    user.streak = newStreak;
    user.lastActiveDayKey = today;
    user.todayProgress = { dayKey: today, expensesLogged: 0, categories: [], completedQuestIds: [] };
  }

  // Update today's progress
  user.todayProgress.expensesLogged += 1;
  if (!user.todayProgress.categories.includes(expense.category)) {
    user.todayProgress.categories.push(expense.category);
  }

  let xpGained = XP_REWARDS.LOG_EXPENSE;
  const levelBefore = levelFromXp(user.xp);

  // Streak bonus only awarded once per day (on the first expense of the day)
  if (wasNewDay) {
    xpGained += streakBonus(user.streak);
  }

  const { newlyCompleted, xpGained: questXp } = evaluateQuests(
    { expensesLogged: user.todayProgress.expensesLogged, categories: user.todayProgress.categories },
    user.todayProgress.completedQuestIds
  );
  xpGained += questXp;
  user.todayProgress.completedQuestIds.push(...newlyCompleted);

  user.xp += xpGained;
  const levelAfter = levelFromXp(user.xp);

  return {
    xpGained,
    leveledUp: levelAfter > levelBefore,
    level: levelAfter,
    rank: rankFromLevel(levelAfter),
    questsCompleted: newlyCompleted,
    streak: user.streak,
  };
}
