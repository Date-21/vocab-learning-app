// Oişbiting — Study Page (Gözlemevi)
// Celestial DNA — Çoktan seçmeli sınav + Çeviri gözlemi
// Yörünge zamanlayıcı, yıldız puanlama

const StudyPage = {
    selectedLevelStart: 0,
    selectedLevelEnd: 50,
    maxLevel: 50,

    async render() {
        const container = document.createElement('div');
        container.className = 'study-page page-enter';

        // Get user's max unlocked level
        try {
            const levelProgress = await DB.progress.getLevelProgress(Auth.user.id);
            const completedLevels = levelProgress.filter(p => p.is_completed).length;
            this.maxLevel = (completedLevels + 1) * CONFIG.WORDS_PER_LEVEL;
        } catch (e) {
            this.maxLevel = CONFIG.WORDS_PER_LEVEL;
        }

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Gözlemevi</h1>
                <p class="page-subtitle">Bilgini sına, yıldızlarını parlat</p>
            </div>

            <div class="study-options" id="study-options" style="display: flex; flex-direction: column; gap: var(--space-md);">
                <div class="study-option-card card" data-type="multiple-choice" style="cursor: pointer; padding: var(--space-lg);">
                    <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(96, 165, 250, 0.1); border-radius: var(--radius); flex-shrink: 0;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="1.5">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-xs);">Çoktan Seçmeli Sınav</h3>
                            <p style="font-size: var(--text-sm); color: var(--text-muted);">Öğrendiğin yıldızları dört seçenekle sına</p>
                        </div>
                    </div>
                </div>

                <div class="study-option-card card" data-type="translation" style="cursor: pointer; padding: var(--space-lg);">
                    <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(245, 197, 66, 0.1); border-radius: var(--radius); flex-shrink: 0;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" stroke-width="1.5">
                                <path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/>
                                <path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-xs);">Cümle Çevirisi</h3>
                            <p style="font-size: var(--text-sm); color: var(--text-muted);">Cümleleri çevirerek gözlem yeteneğini geliştir</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Test Setup -->
            <div id="test-setup" class="hidden" style="margin-top: var(--space-md);">
                <button class="btn btn-ghost" id="back-to-options" style="margin-bottom: var(--space-lg); font-size: var(--text-sm);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Geri
                </button>
                <div id="setup-content"></div>
            </div>

            <!-- Test Container -->
            <div id="test-container" class="hidden"></div>
        `;

        this.setupEventListeners(container);
        return container;
    },

    setupEventListeners(container) {
        container.querySelectorAll('.study-option-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                this.showSetup(container, type);
            });
        });

        container.querySelector('#back-to-options').addEventListener('click', () => {
            this.hideSetup(container);
        });
    },

    showSetup(container, type) {
        const optionsEl = container.querySelector('#study-options');
        const setupEl = container.querySelector('#test-setup');
        const setupContent = container.querySelector('#setup-content');

        optionsEl.classList.add('hidden');
        setupEl.classList.remove('hidden');

        if (type === 'multiple-choice') {
            setupContent.innerHTML = this.renderMultipleChoiceSetup();
            this.setupMultipleChoiceEvents(container);
        } else if (type === 'translation') {
            setupContent.innerHTML = this.renderTranslationSetup();
            this.setupTranslationEvents(container);
        }
    },

    hideSetup(container) {
        const optionsEl = container.querySelector('#study-options');
        const setupEl = container.querySelector('#test-setup');
        const testContainer = container.querySelector('#test-container');

        optionsEl.classList.remove('hidden');
        setupEl.classList.add('hidden');
        testContainer.classList.add('hidden');
        testContainer.innerHTML = '';
    },

    renderMultipleChoiceSetup() {
        return `
            <h2 style="font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-lg);">Gözlem Ayarları</h2>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                <h3 style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-md);">Takımyıldız Aralığı</h3>
                <div style="display: flex; align-items: center; justify-content: center; gap: var(--space-lg);">
                    <div style="text-align: center;">
                        <button class="btn btn-ghost" data-picker="start" data-dir="up" style="padding: var(--space-xs);">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                        </button>
                        <div id="level-start" style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--accent-2); padding: var(--space-sm) 0;">0</div>
                        <button class="btn btn-ghost" data-picker="start" data-dir="down" style="padding: var(--space-xs);">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                    </div>
                    <span style="font-size: var(--text-lg); color: var(--text-muted);">—</span>
                    <div style="text-align: center;">
                        <button class="btn btn-ghost" data-picker="end" data-dir="up" style="padding: var(--space-xs);">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                        </button>
                        <div id="level-end" style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--accent-2); padding: var(--space-sm) 0;">${Math.min(50, this.maxLevel)}</div>
                        <button class="btn btn-ghost" data-picker="end" data-dir="down" style="padding: var(--space-xs);">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                <h3 style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-md);">Soru Türleri</h3>
                <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                    <label class="checkbox-label" style="display: flex; align-items: center; gap: var(--space-sm); cursor: pointer;">
                        <input type="checkbox" name="category" value="word_to_meaning" checked>
                        <span style="font-size: var(--text-sm);">Yıldızdan Anlama</span>
                    </label>
                    <label class="checkbox-label" style="display: flex; align-items: center; gap: var(--space-sm); cursor: pointer;">
                        <input type="checkbox" name="category" value="meaning_to_word" checked>
                        <span style="font-size: var(--text-sm);">Anlamdan Yıldıza</span>
                    </label>
                    <label class="checkbox-label" style="display: flex; align-items: center; gap: var(--space-sm); cursor: pointer;">
                        <input type="checkbox" name="category" value="memory_to_word">
                        <span style="font-size: var(--text-sm);">Hafıza Cümlesiyle</span>
                    </label>
                </div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-lg);">
                <h3 style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-md);">Soru Sayısı</h3>
                <div style="display: flex; gap: var(--space-sm);">
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="question-count" value="5" style="display: none;">
                        <div class="radio-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--surface-2); border-radius: var(--radius); font-size: var(--text-sm); transition: all 0.2s;">5</div>
                    </label>
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="question-count" value="10" checked style="display: none;">
                        <div class="radio-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--accent-2); border-radius: var(--radius); font-size: var(--text-sm); color: var(--accent-2); background: rgba(96, 165, 250, 0.1); transition: all 0.2s;">10</div>
                    </label>
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="question-count" value="20" style="display: none;">
                        <div class="radio-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--surface-2); border-radius: var(--radius); font-size: var(--text-sm); transition: all 0.2s;">20</div>
                    </label>
                </div>
            </div>

            <button class="btn btn-primary" id="start-mc-test" style="width: 100%;">
                Gözlemi Başlat
            </button>
        `;
    },

    setupMultipleChoiceEvents(container) {
        this.selectedLevelStart = 0;
        this.selectedLevelEnd = Math.min(50, this.maxLevel);

        // Number picker controls
        container.querySelectorAll('[data-picker]').forEach(btn => {
            btn.addEventListener('click', () => {
                const picker = btn.dataset.picker;
                const dir = btn.dataset.dir;
                this.adjustLevel(container, picker, dir);
            });
        });

        // Radio visual toggle
        container.querySelectorAll('input[name="question-count"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="question-count"]').forEach(r => {
                    const div = r.parentElement.querySelector('.radio-option');
                    if (r.checked) {
                        div.style.borderColor = 'var(--accent-2)';
                        div.style.color = 'var(--accent-2)';
                        div.style.background = 'rgba(96, 165, 250, 0.1)';
                    } else {
                        div.style.borderColor = 'var(--surface-2)';
                        div.style.color = '';
                        div.style.background = '';
                    }
                });
            });
        });

        // Start test button
        container.querySelector('#start-mc-test').addEventListener('click', () => {
            this.startMultipleChoiceTest(container);
        });
    },

    adjustLevel(container, picker, direction) {
        const step = CONFIG.WORDS_PER_LEVEL;
        const el = container.querySelector(picker === 'start' ? '#level-start' : '#level-end');

        if (picker === 'start') {
            if (direction === 'up' && this.selectedLevelStart + step < this.selectedLevelEnd) {
                this.selectedLevelStart += step;
            } else if (direction === 'down' && this.selectedLevelStart - step >= 0) {
                this.selectedLevelStart -= step;
            }
            el.textContent = this.selectedLevelStart;
        } else {
            if (direction === 'up' && this.selectedLevelEnd + step <= this.maxLevel) {
                this.selectedLevelEnd += step;
            } else if (direction === 'down' && this.selectedLevelEnd - step > this.selectedLevelStart) {
                this.selectedLevelEnd -= step;
            }
            el.textContent = this.selectedLevelEnd;
        }
    },

    async startMultipleChoiceTest(container) {
        const categories = Array.from(container.querySelectorAll('input[name="category"]:checked'))
            .map(c => c.value);

        if (categories.length === 0) {
            Toast.warning('En az bir soru türü seçin');
            return;
        }

        const questionCount = parseInt(container.querySelector('input[name="question-count"]:checked').value);

        const startLevel = Math.floor(this.selectedLevelStart / CONFIG.WORDS_PER_LEVEL) + 1;
        const endLevel = Math.floor(this.selectedLevelEnd / CONFIG.WORDS_PER_LEVEL);

        let words;
        try {
            words = await DB.levels.getWordsInRange(startLevel, endLevel);
        } catch (error) {
            Toast.error('Yıldızlar yüklenemedi');
            return;
        }

        if (words.length < 4) {
            Toast.warning('Yeterli yıldız yok. Daha geniş bir aralık seçin.');
            return;
        }

        const questions = Test.generateQuestions(words, categories, Math.min(questionCount, words.length));

        container.querySelector('#test-setup').classList.add('hidden');
        const testContainer = container.querySelector('#test-container');
        testContainer.classList.remove('hidden');

        const settings = {
            categories,
            questionCount,
            levelRange: [this.selectedLevelStart, this.selectedLevelEnd],
            timed: false
        };

        const testElement = Test.start(questions, settings, (event) => {
            this.handleTestEvent(container, event);
        });

        testContainer.innerHTML = '';
        testContainer.appendChild(testElement);

        Storage.startStudySession();
    },

    handleTestEvent(container, event) {
        const testContainer = container.querySelector('#test-container');

        if (event.type === 'next') {
            testContainer.innerHTML = '';
            testContainer.appendChild(event.element);
        } else if (event.type === 'complete') {
            this.showTestResults(container, event.results);
        }
    },

    async showTestResults(container, results) {
        const testContainer = container.querySelector('#test-container');

        try {
            await DB.tests.saveResult(Auth.user.id, {
                type: 'multiple_choice',
                category: results.settings.categories.join(','),
                totalQuestions: results.totalQuestions,
                correctAnswers: results.correctAnswers,
                points: results.netPoints
            });

            await Auth.addPoints(results.netPoints);
            await DB.stats.update(Auth.user.id, { tests: 1 });

            const studyTime = Storage.endStudySession();
            await Auth.updateStudyTime(studyTime);
        } catch (error) {
            console.error('Sonuç kaydedilemedi:', error);
        }

        const resultsElement = Test.renderResults(results);
        testContainer.innerHTML = '';
        testContainer.appendChild(resultsElement);

        resultsElement.querySelector('#retry-test').addEventListener('click', () => {
            testContainer.classList.add('hidden');
            container.querySelector('#test-setup').classList.remove('hidden');
        });

        resultsElement.querySelector('#back-to-study').addEventListener('click', () => {
            this.hideSetup(container);
        });
    },

    renderTranslationSetup() {
        return `
            <h2 style="font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-lg);">Çeviri Ayarları</h2>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                <h3 style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-md);">Çeviri Yönü</h3>
                <div style="display: flex; gap: var(--space-sm);">
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="direction" value="tr_to_en" checked style="display: none;">
                        <div class="dir-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--accent-2); border-radius: var(--radius); font-size: var(--text-sm); color: var(--accent-2); background: rgba(96, 165, 250, 0.1); transition: all 0.2s;">TR → EN</div>
                    </label>
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="direction" value="en_to_tr" style="display: none;">
                        <div class="dir-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--surface-2); border-radius: var(--radius); font-size: var(--text-sm); transition: all 0.2s;">EN → TR</div>
                    </label>
                </div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                <h3 style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-md);">Zorluk</h3>
                <div style="display: flex; gap: var(--space-sm);">
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="difficulty" value="easy" style="display: none;">
                        <div class="diff-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--surface-2); border-radius: var(--radius); font-size: var(--text-sm); transition: all 0.2s;">
                            <div>Kolay</div>
                            <div style="font-size: var(--text-xs); color: var(--text-muted);">+10</div>
                        </div>
                    </label>
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="difficulty" value="medium" checked style="display: none;">
                        <div class="diff-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--accent-1); border-radius: var(--radius); font-size: var(--text-sm); color: var(--accent-1); background: rgba(245, 197, 66, 0.1); transition: all 0.2s;">
                            <div>Orta</div>
                            <div style="font-size: var(--text-xs); opacity: 0.7;">+15</div>
                        </div>
                    </label>
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="difficulty" value="hard" style="display: none;">
                        <div class="diff-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--surface-2); border-radius: var(--radius); font-size: var(--text-sm); transition: all 0.2s;">
                            <div>Zor</div>
                            <div style="font-size: var(--text-xs); color: var(--text-muted);">+20</div>
                        </div>
                    </label>
                </div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-lg);">
                <h3 style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-md);">Soru Sayısı</h3>
                <div style="display: flex; gap: var(--space-sm);">
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="tr-count" value="5" style="display: none;">
                        <div class="cnt-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--surface-2); border-radius: var(--radius); font-size: var(--text-sm); transition: all 0.2s;">5</div>
                    </label>
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="tr-count" value="10" checked style="display: none;">
                        <div class="cnt-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--accent-2); border-radius: var(--radius); font-size: var(--text-sm); color: var(--accent-2); background: rgba(96, 165, 250, 0.1); transition: all 0.2s;">10</div>
                    </label>
                    <label style="flex: 1; display: block; cursor: pointer;">
                        <input type="radio" name="tr-count" value="20" style="display: none;">
                        <div class="cnt-option" style="text-align: center; padding: var(--space-sm); border: 1px solid var(--surface-2); border-radius: var(--radius); font-size: var(--text-sm); transition: all 0.2s;">20</div>
                    </label>
                </div>
            </div>

            <button class="btn btn-primary" id="start-translation" style="width: 100%;">
                Çeviriyi Başlat
            </button>
        `;
    },

    setupTranslationEvents(container) {
        // Direction radio visual toggle
        container.querySelectorAll('input[name="direction"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="direction"]').forEach(r => {
                    const div = r.parentElement.querySelector('.dir-option');
                    if (r.checked) {
                        div.style.borderColor = 'var(--accent-2)';
                        div.style.color = 'var(--accent-2)';
                        div.style.background = 'rgba(96, 165, 250, 0.1)';
                    } else {
                        div.style.borderColor = 'var(--surface-2)';
                        div.style.color = '';
                        div.style.background = '';
                    }
                });
            });
        });

        // Difficulty radio visual toggle
        container.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="difficulty"]').forEach(r => {
                    const div = r.parentElement.querySelector('.diff-option');
                    if (r.checked) {
                        div.style.borderColor = 'var(--accent-1)';
                        div.style.color = 'var(--accent-1)';
                        div.style.background = 'rgba(245, 197, 66, 0.1)';
                    } else {
                        div.style.borderColor = 'var(--surface-2)';
                        div.style.color = '';
                        div.style.background = '';
                    }
                });
            });
        });

        // Count radio visual toggle
        container.querySelectorAll('input[name="tr-count"]').forEach(radio => {
            radio.addEventListener('change', () => {
                container.querySelectorAll('input[name="tr-count"]').forEach(r => {
                    const div = r.parentElement.querySelector('.cnt-option');
                    if (r.checked) {
                        div.style.borderColor = 'var(--accent-2)';
                        div.style.color = 'var(--accent-2)';
                        div.style.background = 'rgba(96, 165, 250, 0.1)';
                    } else {
                        div.style.borderColor = 'var(--surface-2)';
                        div.style.color = '';
                        div.style.background = '';
                    }
                });
            });
        });

        container.querySelector('#start-translation').addEventListener('click', () => {
            this.startTranslationTest(container);
        });
    },

    async startTranslationTest(container) {
        const direction = container.querySelector('input[name="direction"]:checked').value;
        const difficulty = container.querySelector('input[name="difficulty"]:checked').value;
        const count = parseInt(container.querySelector('input[name="tr-count"]:checked').value);

        let sentences;
        try {
            sentences = await DB.sentences.getRandom(difficulty, count);
        } catch (error) {
            Toast.error('Cümleler yüklenemedi');
            return;
        }

        if (sentences.length === 0) {
            Toast.warning('Bu zorlukta cümle bulunamadı');
            return;
        }

        container.querySelector('#test-setup').classList.add('hidden');
        const testContainer = container.querySelector('#test-container');
        testContainer.classList.remove('hidden');

        const settings = { direction, difficulty, count };
        const testElement = TranslationTest.start(sentences, settings, (event) => {
            this.handleTranslationEvent(container, event);
        });

        testContainer.innerHTML = '';
        testContainer.appendChild(testElement);

        Storage.startStudySession();
    },

    handleTranslationEvent(container, event) {
        const testContainer = container.querySelector('#test-container');

        if (event.type === 'next') {
            testContainer.innerHTML = '';
            testContainer.appendChild(event.element);
        } else if (event.type === 'complete') {
            this.showTranslationResults(container, event.results);
        }
    },

    async showTranslationResults(container, results) {
        const testContainer = container.querySelector('#test-container');

        try {
            await DB.tests.saveResult(Auth.user.id, {
                type: 'translation',
                difficulty: results.settings.difficulty,
                totalQuestions: results.totalQuestions,
                correctAnswers: results.correctAnswers,
                points: results.netPoints
            });

            await Auth.addPoints(results.netPoints);
            await DB.stats.update(Auth.user.id, { tests: 1 });

            const studyTime = Storage.endStudySession();
            await Auth.updateStudyTime(studyTime);
        } catch (error) {
            console.error('Sonuç kaydedilemedi:', error);
        }

        const resultsElement = TranslationTest.renderResults(results);
        testContainer.innerHTML = '';
        testContainer.appendChild(resultsElement);

        resultsElement.querySelector('#retry-translation').addEventListener('click', () => {
            testContainer.classList.add('hidden');
            container.querySelector('#test-setup').classList.remove('hidden');
        });

        resultsElement.querySelector('#back-to-study').addEventListener('click', () => {
            this.hideSetup(container);
        });
    },

    cleanup() {
        Test.reset();
        TranslationTest.reset();
    }
};

window.StudyPage = StudyPage;
