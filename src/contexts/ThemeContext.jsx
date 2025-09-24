import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  theme1: {
    name: 'Theme 1',
    colors: {
      primary: '#0A66C2',
      primaryHover: '#004182',
      background: '#F3F2F0',
      surface: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      navBg: '#0A66C2',
      navText: 'rgba(255, 255, 255, 0.9)'
    }
  },
  theme2: {
    name: 'Theme 2',
    colors: {
      primary: '#238636',
      primaryHover: '#1a7f37',
      background: '#0d1117',
      surface: '#161b22',
      text: '#f0f6fc',
      textSecondary: '#8b949e',
      border: '#30363d',
      navBg: '#21262d',
      navText: '#f0f6fc'
    }
  },
  theme3: {
    name: 'Theme 3',
    colors: {
      primary: '#37352f',
      primaryHover: '#2f2d28',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#37352f',
      textSecondary: '#787774',
      border: '#e9e9e7',
      navBg: '#ffffff',
      navText: '#37352f'
    }
  },
  theme4: {
    name: 'Theme 4',
    colors: {
      primary: '#5865f2',
      primaryHover: '#4752c4',
      background: '#36393f',
      surface: '#2f3136',
      text: '#dcddde',
      textSecondary: '#b9bbbe',
      border: '#202225',
      navBg: '#202225',
      navText: '#dcddde'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('theme1');

  useEffect(() => {
    const savedTheme = localStorage.getItem('talentflow-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('talentflow-theme', currentTheme);
    applyTheme(themes[currentTheme]);
  }, [currentTheme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};