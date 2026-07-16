import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { RANK_COLORS } from "../utils/gamification.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const status = user?.status;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Hunter's <span>Ledger</span>
      </div>

      {status && (
        <div className="system-window" style={{ padding: "0.9rem 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="rank-badge" style={{ borderColor: RANK_COLORS[status.rank], color: RANK_COLORS[status.rank] }}>
              {status.rank}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>Lv. {status.level}</div>
              <div className="stat-label" style={{ marginBottom: 0 }}>{user.name}</div>
            </div>
          </div>
          <div style={{ marginTop: "0.6rem" }}>
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{ width: `${(status.xpIntoLevel / status.xpForNextLevel) * 100}%` }}
              />
            </div>
            <div className="stat-label" style={{ marginTop: "0.3rem", marginBottom: 0 }}>
              {status.xpIntoLevel} / {status.xpForNextLevel} XP · 🔥 {status.streak}d streak
            </div>
          </div>
        </div>
      )}

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Expenses
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Profile
        </NavLink>
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <ThemeToggle />
        <button className="btn btn-block" onClick={logout}>
          Log Out
        </button>
      </div>
    </aside>
  );
}
