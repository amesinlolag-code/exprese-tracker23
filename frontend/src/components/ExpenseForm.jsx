import { useState } from "react";
import { CATEGORIES } from "../utils/gamification.js";

const emptyForm = { amount: "", category: "Food", description: "", date: new Date().toISOString().slice(0, 10) };

export default function ExpenseForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    if (!form.date) {
      setError("Pick a date.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="system-window" style={{ marginBottom: "1.25rem" }}>
      <div className="system-window-title">{initial ? "Edit Expense" : "Log a New Expense"}</div>
      <div className="grid grid-3">
        <div className="form-field">
          <label>Amount</label>
          <input type="number" step="0.01" min="0.01" value={form.amount} onChange={handleChange("amount")} />
        </div>
        <div className="form-field">
          <label>Category</label>
          <select value={form.category} onChange={handleChange("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Date</label>
          <input type="date" value={form.date?.slice ? form.date.slice(0, 10) : form.date} onChange={handleChange("date")} />
        </div>
      </div>
      <div className="form-field">
        <label>Description (optional)</label>
        <input value={form.description} onChange={handleChange("description")} placeholder="e.g. Grocery run" />
      </div>
      {error && <div className="error-text">{error}</div>}
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initial ? "Save Changes" : "Complete Quest"}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
