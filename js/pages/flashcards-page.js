// Flashcards Page — Celestial DNA
// Her seviye bir takımyıldız, her kelime bir yıldız
// Session persistence: localStorage + Supabase sync

const FlashcardsPage = {
    levels: [],
    currentLevel: null,
    allLevelWords: [],
    words: [],
    currentWordIndex: 0,
    learnedWordIds: [],
    repeatWordIds: [],
    firstTimeLearnedCount: 0,
    mode: 'learn',
    studyStartTime: null,
    isFirstPass: true,

    // === CLEANUP (called by Router on page exit) ===
    cleanup() {
        // DON'T save session here - only save when user actively swipes/learns
        // If they just navigate away without action, let them return to level select

        // Cleanup flashcard swipe listeners
        if (Flashcard._cleanupSwipeListeners) Flashcard._cleanupSwipeListeners();
        // Stop any speech
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },

    // === SESSION PERSISTENCE KEYS ===
    SESSION_KEY: 'flashcard_session',

    saveSession() {
        if (!this.currentLevel) return;
        const session = {
            levelId: this.currentLevel.id,
            wordIndex: this.currentWordIndex,
            learnedWordIds: this.learnedWordIds,
            repeatWordIds: this.repeatWordIds,
            isFirstPass: this.isFirstPass,
            studyStartTime: this.studyStartTime,
            mode: this.mode,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        } catch (e) { /* quota exceeded */ }
    },

    loadSession() {
        try {
            const raw = localStorage.getItem(this.SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            // Expire after 24 hours
            if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
                this.clearSession();
                return null;
            }
            return session;
        } catch { return null; }
    },

    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
    },

    // === RENDER ===
    async render(params = {}) {
        const container = document.createElement('div');
        container.className = 'flashcards-page page-enter';

        this.mode = params.mode || 'learn';

        if (this.mode === 'review') {
            return await this.renderReviewMode(container);
        }

        try {
            const [levelsWithCounts, levelProgress] = await Promise.all([
                DB.levels.getAllWithCounts(),
                DB.progress.getLevelProgress(Auth.user.id)
            ]);

            this.levels = levelsWithCounts;

            const progressMap = {};
            levelProgress.forEach(p => { progressMap[p.level_id] = p; });

            // Check for saved session — resume if exists
            const savedSession = this.loadSession();
            if (savedSession && savedSession.mode !== 'review') {
                const level = this.levels.find(l => l.id === savedSession.levelId);
                if (level) {
                    return await this.resumeSession(savedSession, container);
                }
            }

            container.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title">Takımyıldızlar</h1>
                    <p class="page-subtitle">Bir takımyıldız seç, yıldızlarını keşfet</p>
                </div>

                <div class="word-search-section" style="margin-bottom: var(--space-lg);">
                    <div style="position: relative;">
                        <svg style="position: absolute; left: var(--space-sm); top: 50%; transform: translateY(-50%); opacity: 0.4;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input type="text" class="form-input" id="word-search" placeholder="Yıldız haritanda ara..." style="padding-left: 36px;">
                    </div>
                    <div id="search-results" class="search-results hidden"></div>
                </div>

                <div class="levels-grid" id="levels-grid">
                    ${this.levels.length === 0 ? this.renderEmptyState() : this.levels.map((l, i) => this.renderLevelCard(l, i, progressMap)).join('')}
                </div>
            `;

            this.setupEventListeners(container);

        } catch (error) {
            console.error('Takımyıldız verileri yüklenemedi:', error);
            container.innerHTML = `
                <div class="error-state">
                    <p>Gökyüzü şu an bulutlu, daha sonra tekrar dene.</p>
                </div>
            `;
        }

        return container;
    },

    renderEmptyState() {
        return `
            <div class="empty-state" style="grid-column: 1/-1; min-height: 40vh;">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                </svg>
                <h3 class="empty-state-title">Gökyüzü Henüz Boş</h3>
                <p class="empty-state-text">Takımyıldızlar henüz haritalanmadı</p>
            </div>
        `;
    },

    renderLevelCard(level, index, progressMap) {
        const progress = progressMap[level.id] || { is_unlocked: false, is_completed: false, learned_words: [] };
        const wordCount = level.wordCount || 0;

        let isUnlocked = progress.is_unlocked;
        if (!isUnlocked && index === 0) isUnlocked = true;
        if (!isUnlocked && index > 0) {
            const prevLevel = this.levels[index - 1];
            const prevProgress = progressMap[prevLevel.id];
            if (prevProgress && prevProgress.is_completed) isUnlocked = true;
        }

        // Calculate progress based on learned_words array length
        const learnedCount = (progress.learned_words || []).length;
        const percent = wordCount > 0 ? Math.round((learnedCount / wordCount) * 100) : 0;
        const statusClass = !isUnlocked ? 'locked' : progress.is_completed ? 'completed' : '';

        let statusIcon = '';
        if (progress.is_completed) {
            statusIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="var(--accent-1)" opacity="0.4"/>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>`;
        } else if (!isUnlocked) {
            statusIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>`;
        } else {
            statusIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="1.5">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>`;
        }

        return `
            <div class="level-card card ${statusClass}" data-level-id="${level.id}" style="cursor: ${isUnlocked ? 'pointer' : 'not-allowed'}; opacity: ${isUnlocked ? 1 : 0.6};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                    <span style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Seviye ${level.order_index}</span>
                    ${statusIcon}
                </div>
                <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-sm);">${Helpers.escapeHtml(level.name)}</h3>
                <div style="display: flex; align-items: center; gap: var(--space-sm); font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-md);">
                    <span>${wordCount} Yıldız</span>
                    <span>${learnedCount} Keşif</span>
                </div>
                ${isUnlocked ? `
                    <div class="progress" style="height: 4px;">
                        <div class="progress-bar" style="width: ${percent}%"></div>
                    </div>
                ` : '<div style="font-size: var(--text-xs); color: var(--text-faint);">Henüz keşfedilmedi</div>'}
            </div>
        `;
    },

    async renderReviewMode(container) {
        try {
            const reviewData = await DB.progress.getWordsForReview(Auth.user.id);
            this.allLevelWords = reviewData.map(r => r.words);
            this.words = [...this.allLevelWords];
        } catch (error) {
            this.allLevelWords = [];
            this.words = [];
        }

        if (this.words.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="min-height: 60vh;">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        <polyline points="9 12 11 14 15 10"/>
                    </svg>
                    <h3 class="empty-state-title">Gökyüzü Temiz</h3>
                    <p class="empty-state-text">Bugün tekrar bekleyen yıldız yok</p>
                    <button class="btn btn-primary" id="back-to-levels" style="margin-top: var(--space-lg);">Seviyelere Dön</button>
                </div>
            `;
            container.querySelector('#back-to-levels').addEventListener('click', () => Router.navigate('flashcards'));
            return container;
        }

        this.initStudyState();
        return this.renderStudyView(container, true);
    },

    initStudyState() {
        this.currentWordIndex = 0;
        this.learnedWordIds = [];
        this.repeatWordIds = [];
        this.firstTimeLearnedCount = 0;
        this.isFirstPass = true;
        this.studyStartTime = Date.now();
        Storage.startStudySession();
    },

    // === STUDY VIEW ===
    renderStudyView(container, isReview = false) {
        container.innerHTML = '';
        container.className = 'flashcard-study page-enter';

        const word = this.words[this.currentWordIndex];
        if (!word) {
            this.clearSession();
            Router.navigate('flashcards');
            return container;
        }

        const totalWords = this.allLevelWords.length;
        const progress = totalWords > 0 ? (this.learnedWordIds.length / totalWords) * 100 : 0;

        container.innerHTML = `
            <div class="flashcard-study-inner">
                <div class="flashcard-progress">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                        <span style="font-family: var(--font-display); font-size: var(--text-sm); color: var(--accent-1);">
                            ${isReview ? 'Yıldız Tekrarı' : Helpers.escapeHtml(this.currentLevel?.name || 'Keşif')}
                        </span>
                        <span style="font-size: var(--text-xs); color: var(--text-muted);">
                            ${this.learnedWordIds.length}/${totalWords}
                        </span>
                    </div>
                    <div class="progress"><div class="progress-bar" style="width: ${progress}%"></div></div>
                </div>

                <div id="flashcard-container"></div>

                <div class="flashcard-controls">
                    <button class="control-btn repeat-btn" id="study-repeat">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                        </svg>
                        Tekrar
                    </button>
                    <button class="control-btn flip-btn" id="study-flip">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                    </button>
                    <button class="control-btn learn-btn" id="study-learn">
                        Öğrendim
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                </div>

                <button class="exit-study-btn" id="exit-study">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Gözlemi Bitir
                </button>
            </div>
        `;

        // Create card component
        const cardContainer = container.querySelector('#flashcard-container');
        const cardElement = Flashcard.create(word, {
            onLearn: () => this.handleLearn(word, isReview),
            onRepeat: () => this.handleRepeat(word, isReview)
        });
        cardContainer.appendChild(cardElement);

        // Control listeners
        container.querySelector('#study-flip').addEventListener('click', () => Flashcard.flip());
        container.querySelector('#study-repeat').addEventListener('click', () => this.handleRepeat(word, isReview));
        container.querySelector('#study-learn').addEventListener('click', () => this.handleLearn(word, isReview));

        // Exit study — moved outside viewport, guaranteed clickable
        const exitBtn = container.querySelector('#exit-study');
        exitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.exitStudy(isReview);
        });

        return container;
    },

    setupEventListeners(container) {
        container.querySelectorAll('.level-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                const levelId = parseInt(card.dataset.levelId);
                this.startLevel(levelId);
            });
        });

        const searchInput = container.querySelector('#word-search');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce(async (e) => {
                const results = await DB.progress.searchLearnedWords(Auth.user.id, e.target.value);
                const resultsContainer = container.querySelector('#search-results');
                if (e.target.value.length < 2) {
                    resultsContainer.classList.add('hidden');
                    return;
                }
                resultsContainer.innerHTML = results.map(w => `
                    <div class="search-result-item" data-word-id="${w.id}">
                        <b>${w.english_word}</b>: ${w.turkish_meaning}
                    </div>
                `).join('');
                resultsContainer.classList.remove('hidden');
            }, 300));
        }
    },

    // === START / RESUME LEVEL ===
    async startLevel(levelId) {
        this.currentLevel = this.levels.find(l => l.id === levelId);
        try {
            this.allLevelWords = await DB.levels.getWords(levelId);
            if (this.allLevelWords.length === 0) {
                Toast.warning('Bu seviyede henüz kelime yok.');
                return;
            }

            const allProgress = (await DB.progress.getLevelProgress(Auth.user.id)) || [];
            let progress = allProgress.find(p => p.level_id === levelId);

            if (!progress) {
                progress = await DB.progress.initializeLevelProgress(Auth.user.id, levelId);
            }

            this.learnedWordIds = progress.learned_words || [];
            this.repeatWordIds = progress.repeat_words || [];
            this.firstTimeLearnedCount = this.learnedWordIds.length;

            const unswiped = this.allLevelWords.filter(w =>
                !this.learnedWordIds.includes(w.id) &&
                !this.repeatWordIds.includes(w.id)
            );

            if (unswiped.length > 0) {
                this.words = unswiped;
                this.isFirstPass = this.learnedWordIds.length === 0;
            } else if (this.repeatWordIds.length > 0) {
                this.words = this.allLevelWords.filter(w => this.repeatWordIds.includes(w.id));
                this.repeatWordIds = [];
                this.syncLevelProgress();
                this.isFirstPass = false;
            } else {
                this.words = [...this.allLevelWords];
                this.isFirstPass = false;
            }

            this.currentWordIndex = 0;
            this.studyStartTime = Date.now();
            Storage.startStudySession();

            const mainContent = document.getElementById('main-content');
            this.renderStudyView(mainContent, progress.is_completed);

        } catch (error) {
            console.error('Seviye başlatılamadı:', error);
            Toast.error('Bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        }
    },

    async resumeSession(session, container) {
        try {
            this.currentLevel = this.levels.find(l => l.id === session.levelId);
            if (!this.currentLevel) { this.clearSession(); return container; }

            this.allLevelWords = await DB.levels.getWords(session.levelId);
            if (this.allLevelWords.length === 0) { this.clearSession(); return container; }

            this.learnedWordIds = session.learnedWordIds || [];
            this.repeatWordIds = session.repeatWordIds || [];
            this.isFirstPass = session.isFirstPass;
            this.studyStartTime = session.studyStartTime || Date.now();
            this.mode = session.mode || 'learn';

            // Rebuild the words array: unswiped words
            const unswiped = this.allLevelWords.filter(w =>
                !this.learnedWordIds.includes(w.id) &&
                !this.repeatWordIds.includes(w.id)
            );

            if (unswiped.length > 0) {
                this.words = unswiped;
            } else if (this.repeatWordIds.length > 0) {
                this.words = this.allLevelWords.filter(w => this.repeatWordIds.includes(w.id));
            } else {
                this.words = [...this.allLevelWords];
            }

            // Clamp wordIndex
            this.currentWordIndex = Math.min(session.wordIndex || 0, this.words.length - 1);
            if (this.currentWordIndex < 0) this.currentWordIndex = 0;

            // Render into the container that Router will append (not directly to mainContent)
            return this.renderStudyView(container, false);
        } catch (error) {
            console.error('Oturum devam ettirilemedi:', error);
            this.clearSession();
            return container;
        }
    },

    // === PROGRESS SYNC ===
    syncLevelProgress() {
        if (!this.currentLevel || !Auth.user) return;
        DB.progress.updateLevelProgress(Auth.user.id, this.currentLevel.id, {
            learned_words: this.learnedWordIds,
            repeat_words: this.repeatWordIds
        }).catch(err => console.error('Failed to sync progress:', err));
    },

    handleLearn(word, isReview) {
        if (!this.learnedWordIds.includes(word.id)) this.learnedWordIds.push(word.id);

        Auth.addPoints(CONFIG.POINTS.WORD_LEARNED);
        if (isReview) {
            DB.progress.updateReview(Auth.user.id, word.id, true);
        } else {
            DB.progress.markWordLearned(Auth.user.id, word.id);
            this.syncLevelProgress();
        }

        this.nextWord(isReview);
    },

    handleRepeat(word, isReview) {
        if (!this.repeatWordIds.includes(word.id)) this.repeatWordIds.push(word.id);

        if (isReview) {
            DB.progress.updateReview(Auth.user.id, word.id, false);
        } else {
            this.syncLevelProgress();
        }

        this.nextWord(isReview);
    },

    nextWord(isReview) {
        this.currentWordIndex++;

        if (this.currentWordIndex >= this.words.length) {
            if (this.repeatWordIds.length > 0) {
                this.words = this.allLevelWords.filter(w => this.repeatWordIds.includes(w.id));
                this.repeatWordIds = [];
                if (!isReview) this.syncLevelProgress();
                this.currentWordIndex = 0;
                this.isFirstPass = false;
                this.renderStudyView(document.getElementById('main-content'), isReview);
                return;
            }
            this.completeLevel(isReview);
            return;
        }

        this.renderStudyView(document.getElementById('main-content'), isReview);
    },

    // === LEVEL COMPLETE ===
    async completeLevel(isReview) {
        const studyTime = Math.floor((Date.now() - this.studyStartTime) / 60000);
        Auth.updateStudyTime(studyTime);
        Storage.endStudySession();
        this.clearSession();

        if (!isReview && this.currentLevel) {
            await DB.progress.updateLevelProgress(Auth.user.id, this.currentLevel.id, {
                is_completed: true,
                completed_at: new Date().toISOString()
            });
        }

        this.renderCompletionScreen(studyTime);
    },

    renderCompletionScreen(studyTime) {
        const mainContent = document.getElementById('main-content');
        Flashcard.celebrateCompletion(mainContent);

        const currentIdx = this.levels.findIndex(l => l.id === this.currentLevel.id);
        const nextLevel = this.levels[currentIdx + 1];

        mainContent.innerHTML = `
            <div class="level-complete">
                <div class="level-complete-icon">&#11088;</div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xs); color: var(--text);">
                    Gözlem Tamamlandı!
                </h2>
                <p style="color: var(--text-muted); font-size: var(--text-base); margin-bottom: var(--space-xl); max-width: 280px;">
                    Yeni yıldızlar haritalandı ve gökyüzün daha parlak.
                </p>

                <div class="complete-stats">
                    <div class="complete-stat-card" style="background: rgba(var(--accent-1-rgb), 0.08); border: 1px solid rgba(var(--accent-1-rgb), 0.2);">
                        <div class="stat-value" style="color: var(--accent-1);">${this.allLevelWords.length}</div>
                        <div class="stat-label">Yıldız</div>
                    </div>
                    <div class="complete-stat-card" style="background: rgba(var(--accent-2-rgb), 0.08); border: 1px solid rgba(var(--accent-2-rgb), 0.2);">
                        <div class="stat-value" style="color: var(--accent-2);">${studyTime || '<1'}<span style="font-size: var(--text-sm);">dk</span></div>
                        <div class="stat-label">Süre</div>
                    </div>
                </div>

                <div class="complete-actions">
                    ${nextLevel ? `
                        <button class="btn btn-next-level" id="btn-next-level">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;">
                                <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
                            </svg>
                            Sonraki Seviyeye Geç
                        </button>
                    ` : ''}
                    <button class="btn btn-repeat-level" id="btn-repeat-level">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;">
                            <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                        </svg>
                        Tekrar Et
                    </button>
                    <button class="btn btn-back-levels" id="btn-back-levels">
                        Seviyelere Dön
                    </button>
                </div>
            </div>
        `;

        // Button listeners
        if (nextLevel) {
            mainContent.querySelector('#btn-next-level').addEventListener('click', () => {
                this.startLevel(nextLevel.id);
            });
        }
        mainContent.querySelector('#btn-repeat-level').addEventListener('click', () => {
            this.startLevel(this.currentLevel.id);
        });
        mainContent.querySelector('#btn-back-levels').addEventListener('click', () => {
            Router.navigate('flashcards');
        });
    },

    // === EXIT STUDY ===
    exitStudy(isReview) {
        // Save progress to DB
        if (!isReview) this.syncLevelProgress();
        // Clear session so it doesn't resume on next visit
        this.clearSession();
        Storage.endStudySession();

        // Force navigate even if same page name (clear currentPage first)
        Router.currentPage = null;
        Router.navigate('flashcards');
    }
};

window.FlashcardsPage = FlashcardsPage;
