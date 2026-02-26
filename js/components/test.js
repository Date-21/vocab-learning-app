// Oişbiting — Test Components
// Celestial DNA — Yıldız sınavı, yörünge zamanlayıcı
// Çoktan seçmeli + Çeviri testleri

const Test = {
    currentQuestion: 0,
    questions: [],
    answers: [],
    correctCount: 0,
    timer: null,
    timeRemaining: 0,
    onComplete: null,
    settings: null,

    generateQuestions(words, categories, count) {
        const questions = [];
        const shuffledWords = Helpers.shuffleArray(words);
        const selectedWords = shuffledWords.slice(0, count);

        selectedWords.forEach(word => {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const question = this.createQuestion(word, words, category);
            questions.push(question);
        });

        return Helpers.shuffleArray(questions);
    },

    createQuestion(word, allWords, category) {
        let questionText, correctAnswer, options;

        const otherWords = allWords.filter(w => w.id !== word.id);
        const wrongAnswers = Helpers.getRandomItems(otherWords, 3);

        switch (category) {
            case 'word_to_meaning':
                questionText = word.english_word;
                correctAnswer = word.turkish_meaning;
                options = [word.turkish_meaning, ...wrongAnswers.map(w => w.turkish_meaning)];
                break;
            case 'meaning_to_word':
                questionText = word.turkish_meaning;
                correctAnswer = word.english_word;
                options = [word.english_word, ...wrongAnswers.map(w => w.english_word)];
                break;
            case 'memory_to_word':
                questionText = word.memory_sentence || word.turkish_meaning;
                correctAnswer = word.english_word;
                options = [word.english_word, ...wrongAnswers.map(w => w.english_word)];
                break;
            default:
                questionText = word.english_word;
                correctAnswer = word.turkish_meaning;
                options = [word.turkish_meaning, ...wrongAnswers.map(w => w.turkish_meaning)];
        }

        return {
            id: word.id,
            word: word,
            category,
            question: questionText,
            correct: correctAnswer,
            options: Helpers.shuffleArray(options)
        };
    },

    start(questions, settings, onComplete) {
        this.questions = questions;
        this.settings = settings;
        this.onComplete = onComplete;
        this.currentQuestion = 0;
        this.answers = [];
        this.correctCount = 0;

        return this.renderQuestion();
    },

    renderQuestion() {
        const q = this.questions[this.currentQuestion];
        if (!q) return this.finish();

        const categoryLabels = {
            'word_to_meaning': 'Bu yıldızın anlamı nedir?',
            'meaning_to_word': 'Bu anlamın İngilizcesi hangisi?',
            'memory_to_word': 'Bu hafıza cümlesinin yıldızı hangisi?'
        };

        const timerSeconds = this.settings.timePerQuestion || CONFIG.TEST_QUESTION_TIME;
        const circumference = 2 * Math.PI * 22;

        const container = document.createElement('div');
        container.className = 'test-container';
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                <span style="font-size: var(--text-sm); color: var(--text-muted);">${this.currentQuestion + 1} / ${this.questions.length}</span>
                <div style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--text-sm); color: var(--accent-1);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span id="score-display">${this.correctCount}/${this.currentQuestion}</span>
                </div>
                ${this.settings.timed ? `
                    <div class="test-timer" id="test-timer">
                        <svg class="test-timer-ring" viewBox="0 0 52 52">
                            <circle class="test-timer-ring-bg" cx="26" cy="26" r="22"/>
                            <circle class="test-timer-ring-progress" id="timer-ring" cx="26" cy="26" r="22"
                                style="stroke-dasharray: ${circumference}; stroke-dashoffset: 0;"/>
                        </svg>
                        <span class="test-timer-value" id="timer-value">${timerSeconds}</span>
                    </div>
                ` : ''}
            </div>
            <div class="progress" style="margin-bottom: var(--space-lg);">
                <div class="progress-bar" style="width: ${((this.currentQuestion) / this.questions.length) * 100}%"></div>
            </div>
            <div class="question-card card" style="text-align: center; padding: var(--space-xl) var(--space-lg); margin-bottom: var(--space-lg);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-sm);">${categoryLabels[q.category]}</div>
                <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text-primary);">${Helpers.escapeHtml(q.question)}</div>
            </div>
            <div class="answer-options" id="test-options">
                ${q.options.map((option, i) => `
                    <button class="answer-btn" data-index="${i}" data-value="${Helpers.escapeHtml(option)}">
                        ${Helpers.escapeHtml(option)}
                    </button>
                `).join('')}
            </div>
            <div id="test-feedback" class="test-feedback hidden"></div>
        `;

        const optionsContainer = container.querySelector('#test-options');
        optionsContainer.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectAnswer(btn, q));
        });

        if (this.settings.timed) {
            this.startTimer(container);
        }

        return container;
    },

    startTimer(container) {
        this.timeRemaining = this.settings.timePerQuestion || CONFIG.TEST_QUESTION_TIME;
        const totalTime = this.timeRemaining;
        const circumference = 2 * Math.PI * 22;
        const timerEl = container.querySelector('#timer-value');
        const timerContainer = container.querySelector('#test-timer');
        const ringEl = container.querySelector('#timer-ring');

        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            this.timeRemaining--;
            timerEl.textContent = this.timeRemaining;

            if (ringEl) {
                const progress = 1 - (this.timeRemaining / totalTime);
                ringEl.style.strokeDashoffset = circumference * progress;
            }

            if (this.timeRemaining <= 5) {
                timerContainer.classList.add('warning');
            }

            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.timeout();
            }
        }, 1000);
    },

    timeout() {
        const q = this.questions[this.currentQuestion];
        this.answers.push({
            questionId: q.id,
            selected: null,
            correct: q.correct,
            isCorrect: false,
            timedOut: true
        });

        this.showFeedback(false, q.correct, true);
    },

    selectAnswer(btn, question) {
        if (this.timer) clearInterval(this.timer);

        document.querySelectorAll('.answer-btn').forEach(opt => {
            opt.disabled = true;
        });

        const selected = btn.getAttribute('data-value');
        const isCorrect = selected === question.correct;

        btn.classList.add(isCorrect ? 'correct' : 'incorrect');

        if (!isCorrect) {
            document.querySelectorAll('.answer-btn').forEach(opt => {
                if (opt.getAttribute('data-value') === question.correct) {
                    opt.classList.add('correct');
                }
            });
        }

        this.answers.push({
            questionId: question.id,
            selected,
            correct: question.correct,
            isCorrect
        });

        if (isCorrect) {
            this.correctCount++;
        }

        this.showFeedback(isCorrect, question.correct);
    },

    showFeedback(isCorrect, correctAnswer, timedOut = false) {
        const feedback = document.getElementById('test-feedback');
        feedback.classList.remove('hidden');
        feedback.style.padding = 'var(--space-md)';
        feedback.style.marginTop = 'var(--space-md)';
        feedback.style.borderRadius = 'var(--radius)';
        feedback.style.textAlign = 'center';

        if (timedOut) {
            feedback.style.background = 'rgba(248, 113, 113, 0.1)';
            feedback.style.border = '1px solid rgba(248, 113, 113, 0.3)';
            feedback.innerHTML = `
                <div style="color: var(--error); font-weight: 600; margin-bottom: var(--space-xs);">Zaman doldu!</div>
                <div style="color: var(--text-muted); font-size: var(--text-sm);">Doğru cevap: <strong style="color: var(--success);">${Helpers.escapeHtml(correctAnswer)}</strong></div>
            `;
        } else if (isCorrect) {
            feedback.style.background = 'rgba(52, 211, 153, 0.1)';
            feedback.style.border = '1px solid rgba(52, 211, 153, 0.3)';
            feedback.innerHTML = `<div style="color: var(--success); font-weight: 600;">Doğru!</div>`;
            Flashcard.showPointsAnimation(document.querySelector('.test-container'), '+' + CONFIG.POINTS.TEST_CORRECT);
            if (navigator.vibrate) navigator.vibrate(6);
        } else {
            feedback.style.background = 'rgba(248, 113, 113, 0.1)';
            feedback.style.border = '1px solid rgba(248, 113, 113, 0.3)';
            feedback.innerHTML = `
                <div style="color: var(--error); font-weight: 600; margin-bottom: var(--space-xs);">Yanlış!</div>
                <div style="color: var(--text-muted); font-size: var(--text-sm);">Doğru cevap: <strong style="color: var(--success);">${Helpers.escapeHtml(correctAnswer)}</strong></div>
            `;
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        }

        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    },

    nextQuestion() {
        this.currentQuestion++;

        if (this.currentQuestion >= this.questions.length) {
            this.finish();
        } else {
            if (this.onComplete) {
                const container = this.renderQuestion();
                this.onComplete({ type: 'next', element: container });
            }
        }
    },

    finish() {
        if (this.timer) clearInterval(this.timer);

        const results = this.calculateResults();

        if (this.onComplete) {
            this.onComplete({ type: 'complete', results });
        }

        return results;
    },

    calculateResults() {
        const totalQuestions = this.questions.length;
        const correctAnswers = this.correctCount;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const successRate = Helpers.percentage(correctAnswers, totalQuestions);

        const pointsEarned = correctAnswers * CONFIG.POINTS.TEST_CORRECT;
        const pointsLost = incorrectAnswers * Math.abs(CONFIG.POINTS.TEST_INCORRECT);
        const netPoints = pointsEarned + (incorrectAnswers * CONFIG.POINTS.TEST_INCORRECT);

        return {
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            successRate,
            pointsEarned,
            pointsLost,
            netPoints,
            answers: this.answers,
            settings: this.settings
        };
    },

    renderResults(results) {
        const container = document.createElement('div');
        container.className = 'test-results';
        container.style.cssText = 'text-align: center; padding: var(--space-xl) var(--space-md);';

        const starFill = results.successRate >= 80 ? 'rgba(245, 197, 66, 0.3)' :
            results.successRate >= 60 ? 'rgba(96, 165, 250, 0.3)' : 'none';
        const starStroke = results.successRate >= 80 ? 'var(--accent-1)' :
            results.successRate >= 60 ? 'var(--accent-2)' : 'var(--text-muted)';

        container.innerHTML = `
            <svg width="56" height="56" viewBox="0 0 24 24" fill="${starFill}" stroke="${starStroke}" stroke-width="1.5" style="margin-bottom: var(--space-lg); filter: drop-shadow(0 0 8px ${starStroke === 'var(--accent-1)' ? 'rgba(245, 197, 66, 0.4)' : 'rgba(96, 165, 250, 0.3)'});">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <h2 style="font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: var(--space-xs);">Gözlem Tamamlandı!</h2>
            <div style="font-family: var(--font-display); font-size: var(--text-xxl); color: var(--accent-1); margin-bottom: var(--space-lg);">%${results.successRate}</div>
            <div class="stats-grid" style="margin-bottom: var(--space-lg);">
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--success);">${results.correctAnswers}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Doğru</div>
                </div>
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--error);">${results.incorrectAnswers}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Yanlış</div>
                </div>
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--success);">+${results.pointsEarned}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Kazanılan</div>
                </div>
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--error);">-${results.pointsLost}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Kaybedilen</div>
                </div>
            </div>
            <div style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-xl);">
                Net Işık: <span style="color: ${results.netPoints >= 0 ? 'var(--success)' : 'var(--error)'};">
                    ${results.netPoints >= 0 ? '+' : ''}${results.netPoints}
                </span>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                <button class="btn btn-primary" id="retry-test" style="width: 100%;">Tekrar Gözlemle</button>
                <button class="btn btn-secondary" id="back-to-study" style="width: 100%;">Gözlemevine Dön</button>
            </div>
        `;

        if (results.successRate >= 80) {
            Flashcard.celebrateCompletion(container);
        }

        return container;
    },

    reset() {
        if (this.timer) clearInterval(this.timer);
        this.currentQuestion = 0;
        this.questions = [];
        this.answers = [];
        this.correctCount = 0;
        this.timeRemaining = 0;
        this.onComplete = null;
        this.settings = null;
    }
};

// Translation Test Component
const TranslationTest = {
    currentQuestion: 0,
    sentences: [],
    answers: [],
    correctCount: 0,
    settings: null,
    onComplete: null,

    start(sentences, settings, onComplete) {
        this.sentences = sentences;
        this.settings = settings;
        this.onComplete = onComplete;
        this.currentQuestion = 0;
        this.answers = [];
        this.correctCount = 0;

        return this.renderQuestion();
    },

    renderQuestion() {
        const s = this.sentences[this.currentQuestion];
        if (!s) return this.finish();

        const isToEnglish = this.settings.direction === 'tr_to_en';
        const sourceText = isToEnglish ? s.turkish_sentence : s.english_sentence;
        const targetLang = isToEnglish ? 'İngilizce' : 'Türkçe';

        const container = document.createElement('div');
        container.className = 'translation-container';
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                <span style="font-size: var(--text-sm); color: var(--text-muted);">Soru ${this.currentQuestion + 1}/${this.sentences.length}</span>
            </div>
            <div class="progress" style="margin-bottom: var(--space-lg);">
                <div class="progress-bar" style="width: ${((this.currentQuestion) / this.sentences.length) * 100}%"></div>
            </div>
            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-lg); text-align: center;">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-sm);">${isToEnglish ? 'Türkçe' : 'İngilizce'}</div>
                <div style="font-family: var(--font-display); font-size: var(--text-md); color: var(--text-primary);">${Helpers.escapeHtml(sourceText)}</div>
            </div>
            <div style="margin-bottom: var(--space-md);">
                <textarea
                    class="form-input"
                    placeholder="${targetLang} çevirisini yazın..."
                    id="translation-input"
                    rows="3"
                    style="resize: vertical;"
                ></textarea>
            </div>
            <div id="translation-result" class="hidden" style="margin-bottom: var(--space-md);"></div>
            <button class="btn btn-primary" id="check-translation" style="width: 100%;">Kontrol Et</button>
        `;

        container.querySelector('#check-translation').addEventListener('click', () => {
            this.checkAnswer(s);
        });

        container.querySelector('#translation-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.checkAnswer(s);
            }
        });

        return container;
    },

    checkAnswer(sentence) {
        const input = document.getElementById('translation-input');
        const checkBtn = document.getElementById('check-translation');
        const resultDiv = document.getElementById('translation-result');

        const userAnswer = input.value.trim();
        if (!userAnswer) {
            Toast.warning('Lütfen çevirinizi yazın');
            return;
        }

        input.disabled = true;
        checkBtn.disabled = true;

        const isToEnglish = this.settings.direction === 'tr_to_en';
        const correctAnswer = isToEnglish ? sentence.english_sentence : sentence.turkish_sentence;

        const comparison = Helpers.compareWords(userAnswer, correctAnswer);
        const isCorrect = comparison.every(w => w.correct);

        this.answers.push({
            sentenceId: sentence.id,
            userAnswer,
            correctAnswer,
            isCorrect,
            comparison
        });

        if (isCorrect) {
            this.correctCount++;
        }

        resultDiv.classList.remove('hidden');
        resultDiv.style.borderRadius = 'var(--radius)';
        resultDiv.style.padding = 'var(--space-md)';

        if (isCorrect) {
            resultDiv.style.background = 'rgba(52, 211, 153, 0.1)';
            resultDiv.style.border = '1px solid rgba(52, 211, 153, 0.3)';
            resultDiv.innerHTML = `<div style="color: var(--success); font-weight: 600; text-align: center;">Doğru!</div>`;

            const points = this.settings.difficulty === 'easy' ? CONFIG.POINTS.TRANSLATION_EASY :
                this.settings.difficulty === 'hard' ? CONFIG.POINTS.TRANSLATION_HARD :
                    CONFIG.POINTS.TRANSLATION_MEDIUM;

            Flashcard.showPointsAnimation(document.querySelector('.translation-container'), '+' + points);
            if (navigator.vibrate) navigator.vibrate(6);
        } else {
            resultDiv.style.background = 'rgba(248, 113, 113, 0.1)';
            resultDiv.style.border = '1px solid rgba(248, 113, 113, 0.3)';

            const comparisonHtml = comparison.map(w => {
                if (w.correct) {
                    return `<span style="color: var(--success);">${Helpers.escapeHtml(w.word)}</span>`;
                } else if (w.missing) {
                    return `<span style="color: var(--error); text-decoration: line-through; opacity: 0.5;">[${Helpers.escapeHtml(w.word)}]</span>`;
                } else if (w.extra) {
                    return `<span style="color: var(--error); text-decoration: line-through;">${Helpers.escapeHtml(w.word)}</span>`;
                } else {
                    return `<span style="color: var(--error);">${Helpers.escapeHtml(w.word)}</span>`;
                }
            }).join(' ');

            resultDiv.innerHTML = `
                <div style="margin-bottom: var(--space-sm);">
                    <strong style="font-size: var(--text-sm); color: var(--text-muted);">Sizin çeviriniz:</strong>
                    <div style="margin-top: var(--space-xs);">${comparisonHtml}</div>
                </div>
                <div>
                    <strong style="font-size: var(--text-sm); color: var(--text-muted);">Doğru cevap:</strong>
                    <div style="color: var(--success); margin-top: var(--space-xs);">${Helpers.escapeHtml(correctAnswer)}</div>
                </div>
            `;
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        }

        checkBtn.textContent = this.currentQuestion < this.sentences.length - 1 ? 'Sonraki Soru' : 'Bitir';
        checkBtn.disabled = false;
        checkBtn.onclick = () => this.nextQuestion();
    },

    nextQuestion() {
        this.currentQuestion++;

        if (this.currentQuestion >= this.sentences.length) {
            this.finish();
        } else {
            if (this.onComplete) {
                const container = this.renderQuestion();
                this.onComplete({ type: 'next', element: container });
            }
        }
    },

    finish() {
        const results = this.calculateResults();

        if (this.onComplete) {
            this.onComplete({ type: 'complete', results });
        }

        return results;
    },

    calculateResults() {
        const totalQuestions = this.sentences.length;
        const correctAnswers = this.correctCount;
        const successRate = Helpers.percentage(correctAnswers, totalQuestions);

        const pointsPerCorrect = this.settings.difficulty === 'easy' ? CONFIG.POINTS.TRANSLATION_EASY :
            this.settings.difficulty === 'hard' ? CONFIG.POINTS.TRANSLATION_HARD :
                CONFIG.POINTS.TRANSLATION_MEDIUM;

        const pointsEarned = correctAnswers * pointsPerCorrect;

        return {
            totalQuestions,
            correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            successRate,
            pointsEarned,
            netPoints: pointsEarned,
            answers: this.answers,
            settings: this.settings
        };
    },

    renderResults(results) {
        const container = document.createElement('div');
        container.className = 'test-results';
        container.style.cssText = 'text-align: center; padding: var(--space-xl) var(--space-md);';

        const starFill = results.successRate >= 80 ? 'rgba(245, 197, 66, 0.3)' : 'none';
        const starStroke = results.successRate >= 80 ? 'var(--accent-1)' : 'var(--accent-2)';

        container.innerHTML = `
            <svg width="56" height="56" viewBox="0 0 24 24" fill="${starFill}" stroke="${starStroke}" stroke-width="1.5" style="margin-bottom: var(--space-lg);">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <h2 style="font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: var(--space-xs);">Çeviri Tamamlandı!</h2>
            <div style="font-family: var(--font-display); font-size: var(--text-xxl); color: var(--accent-1); margin-bottom: var(--space-lg);">%${results.successRate}</div>
            <div class="stats-grid" style="margin-bottom: var(--space-lg);">
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--success);">${results.correctAnswers}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Doğru</div>
                </div>
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--error);">${results.incorrectAnswers}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Yanlış</div>
                </div>
            </div>
            <div style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-xl);">
                Toplanan Işık: <span style="color: var(--success);">+${results.pointsEarned}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                <button class="btn btn-primary" id="retry-translation" style="width: 100%;">Tekrar Çevir</button>
                <button class="btn btn-secondary" id="back-to-study" style="width: 100%;">Gözlemevine Dön</button>
            </div>
        `;

        if (results.successRate >= 80) {
            Flashcard.celebrateCompletion(container);
        }

        return container;
    },

    reset() {
        this.currentQuestion = 0;
        this.sentences = [];
        this.answers = [];
        this.correctCount = 0;
        this.settings = null;
        this.onComplete = null;
    }
};

window.Test = Test;
window.TranslationTest = TranslationTest;
