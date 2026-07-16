import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const dailyProgressSchema = new mongoose.Schema(
  {
    dayKey: { type: String, default: "" },
    expensesLogged: { type: Number, default: 0 },
    categories: { type: [String], default: [] },
    completedQuestIds: { type: [String], default: [] },
  },
  { _id: false }
);

const createDefaultTodayProgress = () => ({
  dayKey: "",
  expensesLogged: 0,
  categories: [],
  completedQuestIds: [],
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.googleId;
        },
        "Password is required",
      ],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    googleId: { type: String, unique: true, sparse: true, select: false },
    avatarUrl: { type: String, default: "" },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDayKey: { type: String, default: null },
    todayProgress: { type: dailyProgressSchema, default: createDefaultTodayProgress },
    monthlyBudget: { type: Number, default: 0 }, // optional, used for future budget-alert bonus
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.todayProgress || typeof this.todayProgress !== "object") {
    this.todayProgress = createDefaultTodayProgress();
  }

  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Google-only account, no password set
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    xp: this.xp,
    streak: this.streak,
    monthlyBudget: this.monthlyBudget,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);
export default User;
