import asyncHandler from "express-async-handler";
import { Parser as CsvParser } from "json2csv";
import Expense, { CATEGORIES } from "../models/Expense.js";
import { applyExpenseXp } from "../utils/applyExpenseXp.js";
import { buildStatus } from "./authController.js";

const buildFilterQuery = (userId, query) => {
  const filter = { user: userId };

  if (query.category && CATEGORIES.includes(query.category)) {
    filter.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = Number(query.maxAmount);
  }

  return filter;
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
  const { amount, category, description, date } = req.body;

  if (!amount || !category || !date) {
    res.status(400);
    throw new Error("Amount, category and date are required");
  }

  const expense = await Expense.create({
    user: req.user._id,
    amount,
    category,
    description,
    date,
  });

  const gamificationResult = applyExpenseXp(req.user, expense);
  await req.user.save();

  res.status(201).json({
    expense,
    gamification: gamificationResult,
    status: buildStatus(req.user),
  });
});

// @desc    Get all expenses for logged in user (filter, sort, paginate)
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const filter = buildFilterQuery(req.user._id, req.query);

  const sortField = ["date", "amount"].includes(req.query.sortBy) ? req.query.sortBy : "date";
  const sortOrder = req.query.order === "asc" ? 1 : -1;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    Expense.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
    Expense.countDocuments(filter),
  ]);

  res.json({
    expenses,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.json(expense);
});

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  const { amount, category, description, date } = req.body;
  if (amount !== undefined) expense.amount = amount;
  if (category !== undefined) expense.category = category;
  if (description !== undefined) expense.description = description;
  if (date !== undefined) expense.date = date;

  const updated = await expense.save();
  res.json(updated);
});

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  await expense.deleteOne();
  res.json({ message: "Expense removed" });
});

// @desc    Export all of the user's expenses (respecting filters) as CSV
// @route   GET /api/expenses/export
// @access  Private
const exportExpensesCsv = asyncHandler(async (req, res) => {
  const filter = buildFilterQuery(req.user._id, req.query);
  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

  const escapeCsvValue = (value) => {
    const stringValue = value == null ? "" : String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const rows = expenses.map((e) => {
    const date = new Date(e.date).toISOString().slice(0, 10);
    return [date, e.category, e.amount, e.description || ""].map(escapeCsvValue).join(",");
  });

  const csv = ["date,category,amount,description", ...rows].join("\n");

  res.header("Content-Type", "text/csv");
  res.attachment(`expenses-${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(csv);
});

export {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  exportExpensesCsv,
  CATEGORIES,
};
