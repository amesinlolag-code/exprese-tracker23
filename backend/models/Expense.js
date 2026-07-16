import mongoose from "mongoose";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Bills",
  "Shopping",
  "Health",
  "Other",
];

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: { values: CATEGORIES, message: "{VALUE} is not a valid category" },
      default: "Other",
    },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    date: { type: Date, required: [true, "Date is required"] },
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
