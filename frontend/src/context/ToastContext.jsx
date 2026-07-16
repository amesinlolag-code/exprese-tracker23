import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, tone = "info") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  /** Convenience helper: reads a gamification result object from the API and queues the right messages. */
  const announceGamification = useCallback(
    (gamification) => {
      if (!gamification) return;
      if (gamification.xpGained) {
        pushToast(`+${gamification.xpGained} XP earned`, "xp");
      }
      (gamification.questsCompleted || []).forEach((questId) => {
        pushToast(`Quest complete: ${questId.replace(/_/g, " ")}`, "quest");
      });
      if (gamification.leveledUp) {
        pushToast(`Level up! You are now Level ${gamification.level} (Rank ${gamification.rank})`, "levelup");
      }
    },
    [pushToast]
  );

  return (
    <ToastContext.Provider value={{ pushToast, announceGamification }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className="system-window system-toast">
            <div className="system-window-title">
              {t.tone === "levelup" ? "Rank Up" : t.tone === "quest" ? "Quest Complete" : "System"}
            </div>
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
