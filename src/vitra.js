/**
 * Vitra CSS Framework - JavaScript Modules
 * Phase 1: Tokens & Themes - Plan 02
 *
 * Optional JS for enhanced interactivity
 * Works with data-theme attribute on <html> element
 */

const Vitra = (() => {
  'use strict';

  // Storage key for localStorage persistence
  const STORAGE_KEY = 'vitra-theme';

  // Valid theme names
  const VALID_THEMES = [
    'default',
    'light',
    'dark',
    'pastel',
    'neon',
    'earth',
    'mono',
    'midnight',
    'auto'
  ];

  // Cache for prefers-color-scheme media query
  let _prefersDarkMedia = null;
  let _prefersLightMedia = null;

  /**
   * Theme Module
   * Handles theme toggling, auto-detection, and persistence
   */
  const theme = {

    /**
     * Get the current theme from DOM
     * @returns {string} Current theme name or 'default'
     */
    get() {
      const html = document.documentElement;
      return html.dataset.theme || 'default';
    },

    /**
     * Set the theme on the document element
     * @param {string} themeName - Theme name to apply
     * @returns {boolean} Success status
     */
    set(themeName) {
      if (!VALID_THEMES.includes(themeName)) {
        console.warn(`[Vitra Theme] Invalid theme: "${themeName}". Valid themes: ${VALID_THEMES.join(', ')}`);
        return false;
      }

      const html = document.documentElement;
      html.dataset.theme = themeName;

      // Persist to localStorage if available
      if (theme._isLocalStorageAvailable()) {
        try {
          localStorage.setItem(STORAGE_KEY, themeName);
        } catch (e) {
          // localStorage may be full or disabled
          console.warn('[Vitra Theme] Could not save theme to localStorage:', e.message);
        }
      }

      return true;
    },

    /**
     * Toggle between two themes (useful for light/dark switches)
     * @param {string} themeA - First theme
     * @param {string} themeB - Second theme
     * @returns {string} The new active theme
     */
    toggle(themeA = 'light', themeB = 'dark') {
      const current = this.get();
      const next = current === themeA ? themeB : themeA;
      this.set(next);
      return next;
    },

    /**
     * Initialize theme from localStorage or system preference
     * Should be called on page load
     * @param {Object} options - Initialization options
     * @param {string} options.defaultTheme - Fallback theme if nothing stored (default: 'auto')
     * @param {boolean} options.persist - Whether to persist the theme (default: true)
     */
    init(options = {}) {
      const { defaultTheme = 'auto', persist = true } = options;

      // Try to restore from localStorage first
      let themeToSet = null;
      if (theme._isLocalStorageAvailable()) {
        try {
          themeToSet = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
          // localStorage may be disabled
        }
      }

      // If no stored theme, use default
      if (!themeToSet || !VALID_THEMES.includes(themeToSet)) {
        themeToSet = defaultTheme;
      }

      // Apply the theme (without persistence on init to avoid loops)
      const html = document.documentElement;
      html.dataset.theme = themeToSet;

      // If persist is enabled and we had to use default, save it
      if (persist && theme._isLocalStorageAvailable() && !localStorage.getItem(STORAGE_KEY)) {
        try {
          localStorage.setItem(STORAGE_KEY, themeToSet);
        } catch (e) {
          // Ignore storage errors
        }
      }

      // Listen for system theme changes when using 'auto' theme
      if (themeToSet === 'auto') {
        theme._watchSystemTheme();
      }

      return themeToSet;
    },

    /**
     * Get the effective theme (resolves 'auto' to actual theme)
     * @returns {string} The effective theme name
     */
    getEffective() {
      const current = this.get();
      if (current !== 'auto') {
        return current;
      }
      return theme._getSystemTheme();
    },

    /**
     * Get system theme preference
     * @returns {string} 'dark' or 'light'
     * @private
     */
    _getSystemTheme() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    },

    /**
     * Watch for system theme changes (when using 'auto' theme)
     * @private
     */
    _watchSystemTheme() {
      if (!window.matchMedia) return;

      const media = window.matchMedia('(prefers-color-scheme: dark)');

      // Modern browsers
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', (e) => {
          // Only react if current theme is 'auto'
          if (theme.get() === 'auto') {
            // Force re-evaluation by re-setting the attribute
            const html = document.documentElement;
            const currentTheme = html.dataset.theme;
            html.dataset.theme = '';
            // Trigger reflow
            void html.offsetHeight;
            html.dataset.theme = currentTheme;
          }
        });
      }
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     * @private
     */
    _isLocalStorageAvailable() {
      try {
        const test = '__vitra_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },

    /**
     * Clear stored theme preference
     */
    clear() {
      if (theme._isLocalStorageAvailable()) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          // Ignore
        }
      }
    },

    /**
     * Get list of valid theme names
     * @returns {string[]} Array of valid theme names
     */
    getValidThemes() {
      return [...VALID_THEMES];
    }
  };

  // Public API
  return {
    theme
  };
})();

// Export for ES modules (if using import/export)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vitra;
}

// Also attach to window for script tag usage
if (typeof window !== 'undefined') {
  window.Vitra = Vitra;
}
