// Oişbiting — App Initialization
// Celestial Cartography DNA — Yıldız haritası başlatma

const App = {
    async init() {
        try {
            Router.init();
            await Auth.init();

            if (Auth.isLoggedIn()) {
                await this.onAuthenticated();
            } else {
                Router.navigate(CONFIG.ROUTES.AUTH, {}, false);
            }

            this.hideLoadingScreen();
            this.setupAuthListener();
            this.setupThemeToggle();
        } catch (error) {
            console.error('Uygulama başlatma hatası:', error);
            this.hideLoadingScreen();
            Router.navigate(CONFIG.ROUTES.AUTH, {}, false);
        }
    },

    async onAuthenticated() {
        try {
            await Auth.checkAndUpdateStreak();
        } catch (e) {
            console.error('Seri kontrolü başarısız:', e);
        }

        Storage.startStudySession();

        const hash = window.location.hash.replace('#', '');
        const validRoutes = Object.values(CONFIG.ROUTES);

        // Try to restore navigation context from before page refresh
        const savedContext = Storage.getNavigationContext();

        if (savedContext && Date.now() - savedContext.timestamp < 3600000) {
            // Context is less than 1 hour old, restore it
            Router.navigate(savedContext.page, savedContext.params || {}, false);
        } else if (hash && validRoutes.includes(hash) && hash !== CONFIG.ROUTES.AUTH) {
            Router.navigate(hash, {}, false);
        } else {
            Router.navigate(CONFIG.ROUTES.FLASHCARDS, {}, false);
        }
    },

    setupAuthListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'sb-auth-token' && !e.newValue) {
                Router.navigate(CONFIG.ROUTES.AUTH, {}, false);
            }
        });

        window.addEventListener('beforeunload', async () => {
            const duration = Storage.endStudySession();
            if (duration > 0 && Auth.user) {
                try { await Auth.updateStudyTime(duration); } catch (e) {}
            }
        });

        // Save study time every 5 minutes
        setInterval(async () => {
            if (Auth.user && !Router.studyTimerPaused) {
                const duration = Storage.endStudySession();
                if (duration > 0) {
                    try { await Auth.updateStudyTime(duration); } catch (e) {}
                    Storage.startStudySession();
                }
            }
        }, 5 * 60 * 1000);
    },

    onAuthChange(isLoggedIn) {
        if (isLoggedIn) {
            this.onAuthenticated();
        } else {
            Router.navigate(CONFIG.ROUTES.AUTH, {}, false);
        }
    },

    setupThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const current = Storage.getTheme();
                const newTheme = current === 'dark' ? 'light' : 'dark';
                Storage.setTheme(newTheme);
            });
        }
    },

    hideLoadingScreen() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.classList.add('fade-out');
            setTimeout(() => { loading.style.display = 'none'; }, 500);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;
