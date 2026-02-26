// Oişbiting — Router + Tier 2 Signature Transition
// Celestial Cartography DNA — Yıldız choreography
// Çıkış-Önce-Giriş prensibi
// 4 Aşama: Anticipation → Action → Canvas Burst → Settle
// Easing: power2 ailesi (TEK easing sistemi)

const Router = {
    currentPage: null,
    currentParams: null,
    navElement: null,
    mainContent: null,
    headerElement: null,
    idleTimer: null,
    studyTimerPaused: false,
    isTransitioning: false,
    navigationHistory: [],
    hasGSAP: typeof gsap !== 'undefined',

    init() {
        this.navElement = document.getElementById('bottom-nav');
        this.mainContent = document.getElementById('main-content');
        this.headerElement = document.getElementById('app-header');

        // Hash navigation
        window.addEventListener('popstate', (e) => {
            if (e.state?.page) {
                this.navigate(e.state.page, e.state.params, false);
            }
        });

        // Nav click handlers
        if (this.navElement) {
            this.navElement.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    const page = item.dataset.page;
                    if (page) this.navigate(page);
                });
            });
        }

        this.setupIdleDetection();
    },

    getDirection(newPage) {
        const pageOrder = ['home', 'flashcards', 'study', 'competition', 'forum', 'reports', 'profile', 'admin'];
        const oldIdx = pageOrder.indexOf(this.currentPage);
        const newIdx = pageOrder.indexOf(newPage);
        if (oldIdx === -1 || newIdx === -1) return 'forward';
        return newIdx > oldIdx ? 'forward' : 'back';
    },

    async navigate(page, params = {}, pushState = true) {
        if (this.isTransitioning) return;
        if (this.currentPage === page && JSON.stringify(this.currentParams) === JSON.stringify(params)) return;

        this.isTransitioning = true;

        // Cleanup current page
        if (this.currentPage) {
            const pageMap = this.getPageMap();
            const currentInstance = pageMap[this.currentPage];
            if (currentInstance?.cleanup) currentInstance.cleanup();
        }

        const prevPage = this.currentPage;
        const direction = this.getDirection(page);
        this.currentPage = page;
        this.currentParams = params;

        if (pushState) {
            history.pushState({ page, params }, '', `#${page}`);
            this.navigationHistory.push(page);
        }

        this.updateNav(page);

        // Show/hide header and nav for auth page
        const isAuth = page === CONFIG.ROUTES.AUTH;
        if (this.headerElement) this.headerElement.classList.toggle('hidden', isAuth);
        if (this.navElement) this.navElement.classList.toggle('hidden', isAuth);

        const hasOldContent = prevPage && prevPage !== page && !isAuth;

        // === PHASE 1: EXIT + BREATH (parallelized) ===
        if (hasOldContent) {
            if (window.CanvasBg?.onTransition) window.CanvasBg.onTransition();
            if (navigator.vibrate) navigator.vibrate(8);
            if (this.hasGSAP) await this.choreographExit(direction);
        }

        // === PHASE 2: RENDER NEW CONTENT (no loader) ===
        this.mainContent.innerHTML = '';

        let pageElement;
        try {
            const pageMap = this.getPageMap();
            const pageInstance = pageMap[page];
            if (pageInstance) {
                pageElement = await pageInstance.render(params);
            } else {
                pageElement = await (pageMap[CONFIG.ROUTES.FLASHCARDS] || { render: () => document.createElement('div') }).render();
            }
        } catch (error) {
            console.error('Sayfa render hatası:', error);
            pageElement = document.createElement('div');
            pageElement.className = 'empty-state';
            pageElement.style.minHeight = '60vh';
            pageElement.innerHTML = `
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <h3 class="empty-state-title">Kara Delik</h3>
                <p class="empty-state-text">${Helpers.escapeHtml(error.message || 'Sayfa yüklenemedi')}</p>
                <button class="btn btn-primary" onclick="Router.navigate('flashcards')">Yıldızlara Dön</button>
            `;
        }

        if (pageElement) {
            pageElement.classList.add('page-enter');
            this.mainContent.innerHTML = '';
            this.mainContent.appendChild(pageElement);

            // === PHASE 4: ENTER CHOREOGRAPHY ===
            if (this.hasGSAP && hasOldContent) {
                await this.choreographEnter(pageElement, direction);
            } else if (this.hasGSAP) {
                this.choreographFirstLoad(pageElement);
            }
        }

        this.mainContent.scrollTo(0, 0);
        this.isTransitioning = false;
    },

    getPageMap() {
        return {
            [CONFIG.ROUTES.AUTH]: window.AuthPage,
            [CONFIG.ROUTES.HOME]: window.HomePage,
            [CONFIG.ROUTES.FLASHCARDS]: window.FlashcardsPage,
            [CONFIG.ROUTES.STUDY]: window.StudyPage,
            [CONFIG.ROUTES.COMPETITION]: window.CompetitionPage,
            [CONFIG.ROUTES.FORUM]: window.ForumPage,
            [CONFIG.ROUTES.REPORTS]: window.ReportsPage,
            [CONFIG.ROUTES.PROFILE]: window.ProfilePage,
            [CONFIG.ROUTES.ADMIN]: window.AdminPage
        };
    },

    // === EXIT CHOREOGRAPHY (optimized — ~120ms total) ===
    async choreographExit(direction) {
        const pageEl = this.mainContent.firstElementChild;
        if (!pageEl) { this.mainContent.innerHTML = ''; return; }

        // Single fast fade-out + slight shift — no per-element queries
        const tl = gsap.timeline();
        tl.to(pageEl, {
            opacity: 0,
            x: (direction === 'forward' ? -1 : 1) * 12,
            scale: 0.99,
            duration: 0.12,
            ease: 'power2.in'
        });

        return new Promise(resolve => tl.then(resolve));
    },

    // === ENTER CHOREOGRAPHY (optimized — ~180ms total) ===
    async choreographEnter(pageEl, direction) {
        const xDir = direction === 'forward' ? 1 : -1;

        pageEl.style.animation = 'none';
        pageEl.style.opacity = '1';

        const title = pageEl.querySelector('.page-title');
        const cards = pageEl.querySelectorAll('.card, .level-card, .study-option-card, .competition-option, .quick-action, .stat-card');
        // Cap stagger elements to prevent compound delays
        const cappedCards = cards.length > 6 ? Array.from(cards).slice(0, 6) : cards;
        const remainingCards = cards.length > 6 ? Array.from(cards).slice(6) : [];

        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        if (title) {
            gsap.set(title, { opacity: 0, y: 8 });
            tl.to(title, { opacity: 1, y: 0, duration: 0.12 }, 0);
        }

        if (cappedCards.length) {
            gsap.set(cappedCards, { opacity: 0, x: xDir * 10, y: 6 });
            tl.to(cappedCards, { opacity: 1, x: 0, y: 0, duration: 0.15, stagger: 0.02 }, 0.03);
        }

        // Remaining cards appear instantly
        if (remainingCards.length) {
            gsap.set(remainingCards, { opacity: 0 });
            tl.to(remainingCards, { opacity: 1, duration: 0.1 }, 0.08);
        }

        return new Promise(resolve => tl.then(resolve));
    },

    choreographFirstLoad(pageEl) {
        pageEl.style.animation = 'none';
        pageEl.style.opacity = '1';

        const title = pageEl.querySelector('.page-title');
        const cards = pageEl.querySelectorAll('.card, .level-card, .study-option-card, .competition-option, .quick-action, .stat-card');

        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        if (title) {
            gsap.set(title, { opacity: 0, y: 8 });
            tl.to(title, { opacity: 1, y: 0, duration: 0.15 }, 0);
        }
        if (cards.length) {
            const capped = cards.length > 6 ? Array.from(cards).slice(0, 6) : cards;
            const rest = cards.length > 6 ? Array.from(cards).slice(6) : [];
            gsap.set(capped, { opacity: 0, y: 8 });
            tl.to(capped, { opacity: 1, y: 0, duration: 0.15, stagger: 0.02 }, 0.03);
            if (rest.length) {
                gsap.set(rest, { opacity: 0 });
                tl.to(rest, { opacity: 1, duration: 0.1 }, 0.06);
            }
        }
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    updateNav(page) {
        if (!this.navElement) return;
        this.navElement.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
    },

    setupIdleDetection() {
        const resetIdle = () => {
            if (this.idleTimer) clearTimeout(this.idleTimer);
            if (this.studyTimerPaused) this.studyTimerPaused = false;
            this.idleTimer = setTimeout(() => { this.studyTimerPaused = true; }, CONFIG.IDLE_TIMEOUT);
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdle, { passive: true });
        });

        resetIdle();
    },

    getCurrentPage() {
        return this.currentPage;
    },

    back() {
        history.back();
    }
};

window.Router = Router;
