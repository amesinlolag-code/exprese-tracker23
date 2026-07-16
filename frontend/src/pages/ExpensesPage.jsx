import { useCallback, useEffect, useState } from "react";
import {
  listExpensesRequest,
  createExpenseRequest,
  updateExpenseRequest,
  deleteExpenseRequest,
  exportExpensesUrl,
} from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatCurrency, CATEGORIES } from "../utils/gamification.js";
import ExpenseForm from "../components/ExpenseForm.jsx";

const defaultFilters = {
  category: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",
};

export default function ExpensesPage() {
  const { refreshStatus } = useAuth();
  const { announceGamification } = useToast();

  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ expenses: [], pages: 1, total: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeParams = useCallback(() => {
    const params = { ...filters, page };
    Object.keys(params).forEach((k) => {
      if (params[k] === "") delete params[k];
    });
    return params;
  }, [filters, page]);

  const load = useCallback(() => {
    setLoading(true);
    listExpensesRequest(activeParams())
      .then((res) => setResult(res.data))
      .finally(() => setLoading(false));
  }, [activeParams]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (field) => (e) => {
    setPage(1);
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleCreate = async (data) => {
    const res = await createExpenseRequest(data);
    announceGamification(res.data.gamification);
    refreshStatus(res.data.status);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (data) => {
    await updateExpenseRequest(editing._id, data);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense? This cannot be undone.")) return;
    await deleteExpenseRequest(id);
    load();
  };

  const toggleOrder = () => {
    setFilters({ ...filters, order: filters.order === "asc" ? "desc" : "asc" });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Expense Log</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.35rem" }}>
            {result.total} entr{result.total === 1 ? "y" : "ies"} tracked
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <a className="btn" href={exportExpensesUrl(activeParams())} download>
            Export CSV
          </a>
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "+ Log Expense"}
          </button>
        </div>
      </div>

      {showForm && <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editing && (
        <ExpenseForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      )}

      <div className="system-window">
        <div className="filters-bar">
          <div className="form-field">
            <label>Category</label>
            <select value={filters.category} onChange={handleFilterChange("category")}>
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>From</label>
            <input type="date" value={filters.startDate} onChange={handleFilterChange("startDate")} />
          </div>
          <div className="form-field">
            <label>To</label>
            <input type="date" value={filters.endDate} onChange={handleFilterChange("endDate")} />
          </div>
          <div className="form-field">
            <label>Min Amount</label>
            <input type="number" value={filters.minAmount} onChange={handleFilterChange("minAmount")} />
          </div>
          <div className="form-field">
            <label>Max Amount</label>
            <input type="number" value={filters.maxAmount} onChange={handleFilterChange("maxAmount")} />
          </div>
          <div className="form-field">
            <label>Sort By</label>
            <select value={filters.sortBy} onChange={handleFilterChange("sortBy")}>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <button className="btn btn-sm" onClick={toggleOrder} type="button">
            {filters.order === "asc" ? "Ascending ↑" : "Descending ↓"}
          </button>
          <button className="btn btn-sm" type="button" onClick={() => setFilters(defaultFilters)}>
            Reset
          </button>
        </div>

        {loading ? (
          <div className="stat-label">Loading...</div>
        ) : result.expenses.length === 0 ? (
          <div className="empty-state">No expenses match these filters. Try widening your search, or log a new one.</div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {result.expenses.map((e) => (
                    <tr key={e._id}>
                      <td className="mono">{new Date(e.date).toLocaleDateString()}</td>
                      <td>
                        <span className="category-pill">{e.category}</span>
                      </td>
                      <td>{e.description || "—"}</td>
                      <td className="mono" style={{ textAlign: "right" }}>
                        {formatCurrency(e.amount)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-sm" onClick={() => setEditing(e)}>
                          Edit
                        </button>{" "}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="stat-label" style={{ marginBottom: 0 }}>
                Page {result.page} of {result.pages}
              </span>
              <button
                className="btn btn-sm"
                disabled={page >= result.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
