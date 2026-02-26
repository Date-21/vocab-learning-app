// Oişbiting — Local Storage Utilities
// Celestial DNA — Theme management for stellar palette

const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove(key) {
        try { localStorage.removeItem(key); return true; } catch { return false; }
    },

    clear() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => this.remove(key));
    },

    // Theme
    getTheme() {
        const saved = this.get(CONFIG.STORAGE_KEYS.THEME);
        if (saved) return saved;
        return 'dark'; // Celestial DNA defaults to dark
    },

    setTheme(theme) {
        this.set(CONFIG.STORAGE_KEYS.THEME, theme);
        document.documentElement.setAttribute('data-theme', theme);
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0a0e1a' : '#e8e6dc');
        }
    },

    // Card size
    getCardSize() { return this.get(CONFIG.STORAGE_KEYS.CARD_SIZE, 'normal'); },
    setCardSize(size) {
        this.set(CONFIG.STORAGE_KEYS.CARD_SIZE, size);
        document.documentElement.setAttribute('data-card-size', size);
    },

    // Sound effects
    getSoundEnabled() { return this.get(CONFIG.STORAGE_KEYS.SOUND_EFFECTS, true); },
    setSoundEnabled(enabled) { this.set(CONFIG.STORAGE_KEYS.SOUND_EFFECTS, enabled); },

    // Study time tracking
    startStudySession() { this.set(CONFIG.STORAGE_KEYS.STUDY_START_TIME, Date.now()); },
    getStudyDuration() {
        const startTime = this.get(CONFIG.STORAGE_KEYS.STUDY_START_TIME);
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 60000);
    },
    endStudySession() {
        const duration = this.getStudyDuration();
        this.remove(CONFIG.STORAGE_KEYS.STUDY_START_TIME);
        return duration;
    },

    // Session ID
    getSessionId() { return this.get(CONFIG.STORAGE_KEYS.SESSION_ID); },
    setSessionId(id) { this.set(CONFIG.STORAGE_KEYS.SESSION_ID, id); }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    const cardSize = Storage.getCardSize();
    document.documentElement.setAttribute('data-card-size', cardSize);
});

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const savedTheme = Storage.get(CONFIG.STORAGE_KEYS.THEME);
        if (!savedTheme) {
            Storage.setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

window.Storage = Storage;
