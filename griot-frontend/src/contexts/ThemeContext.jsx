import { useEffect, useState } from 'react';
import ThemeContext from './theme-context';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return { mode: 'system', palette: 'heritage', ...JSON.parse(localStorage.getItem('griot-theme') || '{}') }; }
    catch { return { mode: 'system', palette: 'heritage' }; }
  });
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.griotMode = theme.mode === 'system' ? (media.matches ? 'dark' : 'light') : theme.mode;
      document.documentElement.dataset.griotPalette = theme.palette;
    };
    apply();
    media.addEventListener('change', apply);
    try { localStorage.setItem('griot-theme', JSON.stringify(theme)); } catch { /* The theme still works for this session. */ }
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
