import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Renders "Sign in with Google" using Google Identity Services (loaded via the <script>
 * tag in index.html). Silently renders nothing if VITE_GOOGLE_CLIENT_ID isn't set, so the
 * app still works fully with plain email/password if you never set up Google OAuth.
 */
export default function GoogleSignInButton({ onError }) {
  const { googleLogin } = useAuth();
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await googleLogin(response.credential);
            window.location.href = "/";
          } catch (err) {
            onError?.(err.response?.data?.message || "Google sign-in failed.");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "rectangular",
      });
    };

    // The GSI script loads async, so poll briefly until it's ready.
    if (window.google?.accounts?.id) {
      render();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          render();
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
  }, [clientId, googleLogin, onError]);

  if (!clientId) return null;

  return (
    <div style={{ margin: "1rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span className="stat-label" style={{ marginBottom: 0 }}>or</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>
      <div ref={buttonRef} style={{ display: "flex", justifyContent: "center" }} />
    </div>
  );
}
