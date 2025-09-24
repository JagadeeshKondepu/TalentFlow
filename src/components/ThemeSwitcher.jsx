import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { currentTheme, setCurrentTheme, themes } = useTheme();

  return (
    <div className="theme-switcher">
      <Palette size={20} />
      <select 
        value={currentTheme} 
        onChange={(e) => setCurrentTheme(e.target.value)}
        className="theme-select"
      >
        {Object.entries(themes).map(([key, theme]) => (
          <option key={key} value={key}>{theme.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;