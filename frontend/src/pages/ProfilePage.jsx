import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { RANK_COLORS } from "../utils/gamification.js";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const status = user?.status;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      setMessage("Profile updated.");
      setForm({ ...form, password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Hunter Profile</h1>
      </div>

      <div className="grid grid-2">
        <div className="system-window">
          <div className="system-window-title">Update Details</div>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>New Password (optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            {message && <div style={{ color: "var(--success)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{message}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {status && (
          <div className="system-window">
            <div className="system-window-title">Hunter Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div
                className="rank-badge"
                style={{ width: "3.5rem", height: "3.5rem", fontSize: "1.8rem", borderColor: RANK_COLORS[status.rank], color: RANK_COLORS[status.rank] }}
              >
                {status.rank}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700 }}>
                  Level {status.level}
                </div>
                <div className="stat-label" style={{ marginBottom: 0 }}>{status.xp} total XP</div>
              </div>
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${(status.xpIntoLevel / status.xpForNextLevel) * 100}%` }} />
            </div>
            <div className="stat-label" style={{ marginTop: "0.4rem" }}>
              {status.xpIntoLevel} / {status.xpForNextLevel} XP to next level
            </div>
            {status.nextRank ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Reach Level {status.nextRank.minLevel} to become Rank {status.nextRank.rank}.
              </p>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "var(--accent-gold)" }}>Max rank achieved. You are an S-Rank Hunter.</p>
            )}
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>🔥 Current streak: {status.streak} day(s)</p>
          </div>
        )}
      </div>
    </div>
  );
}
