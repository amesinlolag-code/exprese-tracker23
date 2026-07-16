import asyncHandler from "express-async-handler";
import Expense from "../models/Expense.js";
import { DAILY_QUESTS, dayKey } from "../utils/gamification.js";
import { buildStatus } from "./authController.js";

// @desc    Get dashboard summary for logged in user
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [monthAgg, yearAgg, byCategory, recent] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfYear } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.find({ user: userId }).sort({ date: -1 }).limit(5),
  ]);

  // Quest state: only relevant if progress is for today, otherwise all quests are fresh/incomplete
  const today = dayKey();
  const progress =
    req.user.lastActiveDayKey === today
      ? req.user.todayProgress
      : { expensesLogged: 0, categories: [], completedQuestIds: [] };

  const quests = DAILY_QUESTS.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    xp: q.xp,
    completed: progress.completedQuestIds.includes(q.id),
  }));

  res.json({
    totalThisMonth: monthAgg[0]?.total || 0,
    totalThisYear: yearAgg[0]?.total || 0,
    byCategory: byCategory.map((c) => ({ category: c._id, total: c.total, count: c.count })),
    recentExpenses: recent,
    quests,
    status: buildStatus(req.user),
  });
});

export { getDashboard };
