import {
  levelFromXp,
  rankFromLevel,
  xpProgress,
  nextRankInfo,
  streakBonus,
  evaluateQuests,
  computeStreak,
  DAILY_QUESTS,
} from "../utils/gamification.js";

describe("levelFromXp", () => {
  test("0 XP is level 1", () => {
    expect(levelFromXp(0)).toBe(1);
  });
  test("100 XP is level 2", () => {
    expect(levelFromXp(100)).toBe(2);
  });
  test("250 XP is level 3", () => {
    expect(levelFromXp(250)).toBe(3);
  });
});

describe("rankFromLevel", () => {
  test("level 1 is rank E", () => {
    expect(rankFromLevel(1)).toBe("E");
  });
  test("level 5 is rank D", () => {
    expect(rankFromLevel(5)).toBe("D");
  });
  test("level 30 is rank S", () => {
    expect(rankFromLevel(30)).toBe("S");
  });
  test("level 100 is still rank S (max)", () => {
    expect(rankFromLevel(100)).toBe("S");
  });
});

describe("xpProgress", () => {
  test("computes progress within current level", () => {
    const progress = xpProgress(150);
    expect(progress.level).toBe(2);
    expect(progress.current).toBe(50);
    expect(progress.target).toBe(100);
  });
});

describe("nextRankInfo", () => {
  test("returns the next rank threshold", () => {
    expect(nextRankInfo(1)).toEqual({ rank: "D", minLevel: 5 });
  });
  test("returns null once at max rank", () => {
    expect(nextRankInfo(30)).toBeNull();
  });
});

describe("streakBonus", () => {
  test("scales with streak days", () => {
    expect(streakBonus(3)).toBe(15);
  });
  test("caps at STREAK_CAP_DAYS", () => {
    expect(streakBonus(50)).toBe(50); // capped at 10 days * 5 xp
  });
});

describe("computeStreak", () => {
  test("first ever activity starts a streak of 1", () => {
    expect(computeStreak(0, null, "2026-07-15")).toBe(1);
  });
  test("same day does not increment", () => {
    expect(computeStreak(4, "2026-07-15", "2026-07-15")).toBe(4);
  });
  test("consecutive day increments streak", () => {
    expect(computeStreak(4, "2026-07-14", "2026-07-15")).toBe(5);
  });
  test("skipped day resets streak to 1", () => {
    expect(computeStreak(4, "2026-07-10", "2026-07-15")).toBe(1);
  });
});

describe("evaluateQuests", () => {
  test("no quests complete with 0 expenses logged", () => {
    const { newlyCompleted, xpGained } = evaluateQuests({ expensesLogged: 0, categories: [] });
    expect(newlyCompleted).toEqual([]);
    expect(xpGained).toBe(0);
  });

  test("logging 1 expense completes 'log_a_kill' only", () => {
    const { newlyCompleted, xpGained } = evaluateQuests({ expensesLogged: 1, categories: ["Food"] });
    expect(newlyCompleted).toEqual(["log_a_kill"]);
    expect(xpGained).toBe(15);
  });

  test("logging 3 expenses in 2 categories completes all 3 quests", () => {
    const { newlyCompleted, xpGained } = evaluateQuests({
      expensesLogged: 3,
      categories: ["Food", "Transport"],
    });
    expect(newlyCompleted.sort()).toEqual(
      ["log_a_kill", "track_the_hunt", "categorize_the_loot"].sort()
    );
    expect(xpGained).toBe(15 + 25 + 20);
  });

  test("does not re-award already-completed quests", () => {
    const { newlyCompleted, xpGained } = evaluateQuests(
      { expensesLogged: 1, categories: ["Food"] },
      ["log_a_kill"]
    );
    expect(newlyCompleted).toEqual([]);
    expect(xpGained).toBe(0);
  });

  test("DAILY_QUESTS has exactly 3 quests", () => {
    expect(DAILY_QUESTS).toHaveLength(3);
  });
});
