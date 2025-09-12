import { useState } from "react"
import "../style/ThemePicker.css"

interface ThemeColors {
  background: string;
  calendar: string;
}

interface ThemePickerProps {
  initialColors: ThemeColors;
  onClose: () => void;
  onApply: (colors: ThemeColors) => void;
}

export default function ThemePicker({ initialColors, onClose, onApply }: ThemePickerProps) {
  const [colors, setColors] = useState<ThemeColors>(initialColors);

  return (
    <div className="theme-overlay" onClick={onClose}>
      <div className="theme-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🎨 Pick Your Theme</h3>

        <div className="theme-picker-section">
          <label>
            Background
            <input
              type="color"
              value={colors.background}
              onChange={(e) =>
                setColors({ ...colors, background: e.target.value })
              }
            />
          </label>

          <label>
            Calendar Accent
            <input
              type="color"
              value={colors.calendar}
              onChange={(e) =>
                setColors({ ...colors, calendar: e.target.value })
              }
            />
          </label>
        </div>

        <div className="theme-buttons">
          <button className="theme-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="theme-apply"
            onClick={() => {
              onApply(colors);
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
