export const THEME_STORAGE_KEY = "huntpilot-theme";

export function ThemeScript() {
  // Runs before React hydration to prevent theme flash.
  const code = `
(function () {
  try {
    var key = ${JSON.stringify("huntpilot-theme")};
    var saved = localStorage.getItem(key);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || 'system';
    var shouldDark = theme === 'dark' || (theme === 'system' && prefersDark);
    var root = document.documentElement;
    if (shouldDark) root.classList.add('dark'); else root.classList.remove('dark');
  } catch (e) {}
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

