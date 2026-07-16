import { useState } from "react";

/**
 * Ambient background for the auth screens.
 *
 * Drop your own royalty-free video (e.g. from Pexels or Pixabay) into
 * `frontend/public/ambient-bg.mp4` and it will autoplay, muted and looped, behind the
 * login/register cards. If no video file is present (or it fails to load), this quietly
 * falls back to a subtle animated CSS gradient instead — no external video is embedded here,
 * so there's nothing to fetch and nothing copyrighted bundled with the app.
 */
export default function AmbientBackground() {
  const [videoFailed, setVideoFailed] = useState(false);

  if (videoFailed) {
    return <div className="ambient-bg ambient-bg-fallback" aria-hidden="true" />;
  }

  return (
    <video
      className="ambient-bg"
      autoPlay
      muted
      loop
      playsInline
      onError={() => setVideoFailed(true)}
      aria-hidden="true"
    >
      <source src="/ambient-bg.mp4" type="video/mp4" />
    </video>
  );
}
