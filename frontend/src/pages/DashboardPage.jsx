import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { dashboardRequest } from "../services/api.js";
import { formatCurrency, CATEGORY_COLORS } from "../utils/gamification.js";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardRequest()
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  if (error) return <div className="empty-state">{error}</div>;
  if (!data) return <div className="stat-label">Loading dashboard...</div>;

  const pieData = data.byCategory.map((c) => ({ name: c.category, value: c.total }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hunter Status Window</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.35rem" }}>
            Your spending, tracked like a real quest log.
          </p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: "1.25rem" }}>
        <div className="system-window">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{formatCurrency(data.totalThisMonth)}</div>
        </div>
        <div className="system-window">
          <div className="stat-label">This Year</div>
          <div className="stat-value">{formatCurrency(data.totalThisYear)}</div>
        </div>
        <div className="system-window">
          <div className="stat-label">Rank / Level</div>
          <div className="stat-value">
            {data.status.rank} · Lv.{data.status.level}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="system-window">
          <div className="system-window-title">Spending by Category</div>
          {pieData.length === 0 ? (
            <div className="empty-state">No expenses logged yet this year. Log your first one!</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#8a93a6"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#161b30", border: "1px solid #262b45", borderRadius: 6 }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="system-window">
          <div className="system-window-title">Today's Quests</div>
          {data.quests.map((q) => (
            <div key={q.id} className={`quest-item${q.completed ? " completed" : ""}`}>
              <div>
                <div className="quest-title" style={{ fontWeight: 600 }}>
                  {q.completed ? "✓ " : "◻ "}
                  {q.title}
                </div>
                <div className="stat-label" style={{ marginBottom: 0 }}>{q.description}</div>
              </div>
              <div className="quest-xp">+{q.xp} XP</div>
            </div>
          ))}
        </div>
      </div>

      <div className="system-window" style={{ marginTop: "1.25rem" }}>
        <div className="system-window-title">Recent Expenses</div>
        {data.recentExpenses.length === 0 ? (
          <div className="empty-state">Nothing logged yet. Head to Expenses to add your first entry.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentExpenses.map((e) => (
                  <tr key={e._id}>
                    <td className="mono">{new Date(e.date).toLocaleDateString()}</td>
                    <td>
                      <span className="category-pill">{e.category}</span>
                    </td>
                    <td>{e.description || "—"}</td>
                    <td className="mono" style={{ textAlign: "right" }}>
                      {formatCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
