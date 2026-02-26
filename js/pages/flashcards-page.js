// Oişbiting — Flashcards Page (Takımyıldızlar)
// Celestial DNA — Her seviye bir takımyıldız, her kelime bir yıldız

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

    async render(params = {}) {
        const container = document.createElement('div');
        container.className = 'flashcards-page page-enter';

        this.mode = params.mode || 'learn';

        if (this.mode === 'review') {
            return await this.renderReviewMode(container);
        }

        // Load levels with optimized DB call
        try {
            const [levelsWithCounts, levelProgress] = await Promise.all([
                DB.levels.getAllWithCounts(),
                DB.progress.getLevelProgress(Auth.user.id)
            ]);

            this.levels = levelsWithCounts;

            // Map progress for quick lookup
            const progressMap = {};
            levelProgress.forEach(p => { progressMap[p.level_id] = p; });

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
        const progress = progressMap[level.id] || { is_unlocked: false, is_completed: false, current_word_index: 0 };
        const wordCount = level.wordCount || 0;

        // Unlock logic: first level or previous level completed
        let isUnlocked = progress.is_unlocked;
        if (!isUnlocked && index === 0) isUnlocked = true;
        if (!isUnlocked && index > 0) {
            const prevLevel = this.levels[index - 1];
            const prevProgress = progressMap[prevLevel.id];
            if (prevProgress && prevProgress.is_completed) isUnlocked = true;
        }

        const percent = wordCount > 0 ? Math.round((progress.current_word_index / wordCount) * 100) : 0;
        const statusClass = !isUnlocked ? 'locked' : progress.is_completed ? 'completed' : '';

        // Constellation star icon based on status
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
                    <span>%${percent} Keşif</span>
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

    renderStudyView(container, isReview = false) {
        container.innerHTML = '';
        container.className = 'flashcard-study page-enter';

        const word = this.words[this.currentWordIndex];
        if (!word) {
            Router.navigate('flashcards');
            return container;
        }

        const totalWords = this.allLevelWords.length;
        const progress = totalWords > 0 ? (this.learnedWordIds.length / totalWords) * 100 : 0;

        container.innerHTML = `
            <div class="flashcard-viewport">
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                        </svg>
                        Tekrar
                    </button>
                    <button class="control-btn flip-btn" id="study-flip">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 14"/>
                        </svg>
                    </button>
                    <button class="control-btn learn-btn" id="study-learn">
                        Öğrendim
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                </div>

                <button class="btn btn-ghost" id="exit-study" style="margin-top: var(--space-lg); color: var(--text-faint);">
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
        container.querySelector('#exit-study').addEventListener('click', () => this.exitStudy(isReview));

        return container;
    },

    setupEventListeners(container) {
        // Level clicks
        container.querySelectorAll('.level-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                const levelId = parseInt(card.dataset.levelId);
                this.startLevel(levelId);
            });
        });

        // Search logic
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

    async startLevel(levelId) {
        this.currentLevel = this.levels.find(l => l.id === levelId);
        try {
            this.allLevelWords = await DB.levels.getWords(levelId);
            if (this.allLevelWords.length === 0) {
                Toast.warning('Bu seviyede henüz kelime yok.');
                return;
            }

            // Progress verisini çek, yoksa oluştur
            const allProgress = (await DB.progress.getLevelProgress(Auth.user.id)) || [];
            let progress = allProgress.find(p => p.level_id === levelId);

            if (!progress) {
                progress = await DB.progress.initializeLevelProgress(Auth.user.id, levelId);
            }

            this.learnedWordIds = progress.learned_words || [];
            this.repeatWordIds = progress.repeat_words || [];
            this.firstTimeLearnedCount = this.learnedWordIds.length;

            // Öğrenilmemiş VE tekrar kuyruğunda olmayan (yani hiç kaydırılmamış) kelimeler
            const unswiped = this.allLevelWords.filter(w =>
                !this.learnedWordIds.includes(w.id) &&
                !this.repeatWordIds.includes(w.id)
            );

            if (unswiped.length > 0) {
                this.words = unswiped;
                this.isFirstPass = this.learnedWordIds.length === 0;
            } else if (this.repeatWordIds.length > 0) {
                // Eğer hiç kaydırılmamış kalmadıysa ama "Tekrar Et"e atılanlar varsa,
                // demek ki birinci turu bitirmiş, sayfayı yenilemiş ve tekrar turunda.
                this.words = this.allLevelWords.filter(w => this.repeatWordIds.includes(w.id));
                this.repeatWordIds = [];
                this.syncLevelProgress(); // Tekrar kuyruğuna başlıyoruz, temizleyip db ile eşitle.
                this.isFirstPass = false;
            } else {
                // Her şey öğrenilmişse komple tekrar modu
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
            this.syncLevelProgress(); // Her öğrendiğinde kaydet ki kaldığı yerden devam edebilsin
        }

        this.nextWord(isReview);
    },

    handleRepeat(word, isReview) {
        if (!this.repeatWordIds.includes(word.id)) this.repeatWordIds.push(word.id);

        if (isReview) {
            DB.progress.updateReview(Auth.user.id, word.id, false);
        } else {
            this.syncLevelProgress(); // Her tekrara attığında kaydet
        }

        this.nextWord(isReview);
    },

    nextWord(isReview) {
        this.currentWordIndex++;

        if (this.currentWordIndex >= this.words.length) {
            if (this.repeatWordIds.length > 0) {
                // Tekrar listesine geçiliyor
                this.words = this.allLevelWords.filter(w => this.repeatWordIds.includes(w.id));
                this.repeatWordIds = [];
                if (!isReview) this.syncLevelProgress(); // Tekrar listesini temizlediğimizi db'ye de yansıt
                this.currentWordIndex = 0;
                this.isFirstPass = false;
                this.renderStudyView(document.getElementById('main-content'), isReview);
                return;
            }
            this.completeLevel(isReview);
            return;
        }

        // Update view for next word
        this.renderStudyView(document.getElementById('main-content'), isReview);
    },

    async completeLevel(isReview) {
        const studyTime = Math.floor((Date.now() - this.studyStartTime) / 60000);
        Auth.updateStudyTime(studyTime);
        Storage.endStudySession();

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

        // Bir sonraki seviyeyi bul
        const currentIdx = this.levels.findIndex(l => l.id === this.currentLevel.id);
        const nextLevel = this.levels[currentIdx + 1];

        mainContent.innerHTML = `
            <div class="level-complete">
                <div class="level-complete-icon animate-bounce-in">🌟</div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-3xl); margin-bottom: var(--space-xs); color: var(--text-primary);">Gözlem Tamamlandı!</h2>
                <p style="color: var(--text-muted); font-size: var(--text-lg); margin-bottom: var(--space-xl);">Yeni yıldızlar haritalandı ve gökyüzün daha parlak.</p>
                
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); max-width: 400px; margin: 0 auto var(--space-2xl);">
                    <div style="background: rgba(var(--accent-1-rgb), 0.08); border: 1px solid rgba(var(--accent-1-rgb), 0.2); padding: var(--space-lg); border-radius: var(--radius-md);">
                        <div style="font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.5rem); font-weight: 800; color: var(--accent-1); line-height: 1.1;">${this.allLevelWords.length}</div>
                        <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Yıldız</div>
                    </div>
                    <div style="background: rgba(var(--accent-2-rgb), 0.08); border: 1px solid rgba(var(--accent-2-rgb), 0.2); padding: var(--space-lg); border-radius: var(--radius-md);">
                        <div style="font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.5rem); font-weight: 800; color: var(--accent-2); line-height: 1.1;">${studyTime || 0}<span style="font-size: var(--text-md);">dk</span></div>
                        <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Süre</div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: var(--space-md); max-width: 300px; margin: 0 auto;">
                    ${nextLevel ? `<button class="btn btn-primary btn-block" onclick="FlashcardsPage.startLevel('${nextLevel.id}')" style="box-shadow: 0 4px 15px rgba(var(--accent-1-rgb), 0.3);">Sonraki Seviyeye Geç</button>` : ''}
                    <button class="btn btn-secondary btn-block" onclick="FlashcardsPage.startLevel('${this.currentLevel.id}')">Tekrar Et</button>
                    <button class="btn btn-ghost btn-block" style="border: 1px solid rgba(255,255,255,0.1);" onclick="Router.navigate('flashcards')">Gözlem Evine Dön</button>
                </div>
            </div>
        `;
    },

    async exitStudy(isReview) {
        const confirmed = await Modal.confirm('Gözlemi yarıda kesmek istediğine emin misin?', 'Gözlemi Bitir', 'Çıkış Yap', 'Vazgeç');
        if (confirmed) {
            Storage.endStudySession();
            Router.navigate('flashcards');
        }
    }
};

window.FlashcardsPage = FlashcardsPage;
