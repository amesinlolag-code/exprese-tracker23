import { useTheme } from "../context/ThemeContext.jsx";

const ICONS = { system: "🖥️", light: "☀️", dark: "🌙" };
const LABELS = { system: "System", light: "Light", dark: "Dark" };

export default function ThemeToggle() {
  const { preference, cycleTheme } = useTheme();

  return (
    <button type="button" className="theme-toggle" onClick={cycleTheme} title="Click to change theme">
      <span>{ICONS[preference]}</span>
      <span>{LABELS[preference]}</span>
    </button>
  );
}
