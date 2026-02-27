// Flashcard Component — Celestial DNA
// Theme-coherent card with swipe, flip, TTS (male voice, instant)

const Flashcard = {
    currentCard: null,
    isFlipped: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    onLearn: null,
    onRepeat: null,
    _boundMove: null,
    _boundUp: null,
    _voicesLoaded: false,

    create(word, options = {}) {
        this.isFlipped = false;
        this.onLearn = options.onLearn || null;
        this.onRepeat = options.onRepeat || null;

        this._cleanupSwipeListeners();
        this._ensureVoicesLoaded();

        const cardContainer = document.createElement('div');
        cardContainer.className = 'flashcard-viewport';

        cardContainer.innerHTML = `
            <div class="flashcard">
                <div class="flashcard-face flashcard-front">
                    <div class="card-top-actions">
                        <button class="sound-btn" aria-label="Sesli oku" type="button">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                        </button>
                    </div>

                    <div class="front-content">
                        <div class="word">${Helpers.escapeHtml(word.english_word)}</div>
                        ${word.pronunciation ? `<div class="pronunciation">/${Helpers.escapeHtml(word.pronunciation)}/</div>` : ''}
                        <div class="meaning-hint">${Helpers.escapeHtml(word.turkish_meaning)}</div>
                    </div>

                    <div class="card-footer">
                        <p>Kalıcı olmasını istiyorsan çevir</p>
                    </div>
                </div>

                <div class="flashcard-face flashcard-back">
                    <div class="card-top-actions">
                        <button class="sound-btn" aria-label="Sesli oku" type="button">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                        </button>
                    </div>
                    <div class="memory-container">
                        <div class="memory-text">${Helpers.escapeHtml(word.memory_sentence || 'Hafıza metni eklenmemiş.')}</div>
                    </div>
                    <div class="card-footer">
                        <p>Kelimeye dönmek için dokun</p>
                    </div>
                </div>
            </div>
        `;

        const card = cardContainer.querySelector('.flashcard');

        // Flip on tap
        card.addEventListener('click', (e) => {
            if (e.target.closest('.sound-btn')) return;
            if (this.isDragging) return;
            this.flip(card);
        });

        // TTS — both front and back sound buttons
        cardContainer.querySelectorAll('.sound-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.speak(word.english_word);
            });
        });

        // Swipe handlers
        this.setupSwipe(card);

        this.currentCard = card;
        return cardContainer;
    },

    flip(card) {
        const target = card || this.currentCard;
        if (!target) return;

        this.isFlipped = !this.isFlipped;
        if (typeof gsap !== 'undefined') {
            gsap.to(target, {
                rotateY: this.isFlipped ? 180 : 0,
                duration: 0.6,
                ease: 'back.out(1.4)'
            });
        } else {
            target.style.transform = `rotateY(${this.isFlipped ? 180 : 0}deg)`;
        }
        if (navigator.vibrate) navigator.vibrate(5);
    },

    _cleanupSwipeListeners() {
        if (this._boundMove) {
            document.removeEventListener('mousemove', this._boundMove);
            this._boundMove = null;
        }
        if (this._boundUp) {
            document.removeEventListener('mouseup', this._boundUp);
            this._boundUp = null;
        }
    },

    _ensureVoicesLoaded() {
        if (this._voicesLoaded) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                this._voicesLoaded = true;
            };
        }
    },

    setupSwipe(card) {
        const handleStart = (x, y) => {
            this.startX = x;
            this.startY = y;
            this.currentX = x;
            this.isDragging = false;
        };

        const handleMove = (x) => {
            const diff = x - this.startX;
            if (Math.abs(diff) > 10) this.isDragging = true;
            this.currentX = x;

            if (typeof gsap !== 'undefined') {
                gsap.set(card, {
                    x: diff * 0.8,
                    rotation: diff * 0.05,
                    opacity: 1 - Math.abs(diff) / 800
                });
            }

            const threshold = typeof CONFIG !== 'undefined' ? CONFIG.SWIPE_THRESHOLD : 100;
            if (diff > threshold / 2) {
                card.style.boxShadow = `0 0 30px rgba(93, 138, 75, ${Math.min(0.5, Math.abs(diff) / 300)})`;
            } else if (diff < -threshold / 2) {
                card.style.boxShadow = `0 0 30px rgba(166, 61, 61, ${Math.min(0.5, Math.abs(diff) / 300)})`;
            }
        };

        const handleEnd = () => {
            const diff = this.currentX - this.startX;
            card.style.boxShadow = '';
            const threshold = typeof CONFIG !== 'undefined' ? CONFIG.SWIPE_THRESHOLD : 100;

            if (Math.abs(diff) > threshold) {
                const direction = diff > 0 ? 'right' : 'left';
                this.animateSwipeOut(card, direction);
            } else {
                if (typeof gsap !== 'undefined') {
                    gsap.to(card, { x: 0, rotation: 0, opacity: 1, duration: 0.2, ease: 'power2.out' });
                } else {
                    card.style.transform = `rotateY(${this.isFlipped ? 180 : 0}deg)`;
                    card.style.left = '0';
                    card.style.opacity = '1';
                }
            }
        };

        card.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));

        this._boundMove = (e) => {
            if (this.startX) {
                if (this.isDragging || Math.abs(e.clientX - this.startX) > 10) handleMove(e.clientX);
            }
        };
        this._boundUp = () => {
            if (this.startX) handleEnd();
            this.startX = 0;
        };

        document.addEventListener('mousemove', this._boundMove);
        document.addEventListener('mouseup', this._boundUp);

        card.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            handleStart(t.clientX, t.clientY);
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            handleMove(t.clientX);
        }, { passive: true });

        card.addEventListener('touchend', () => {
            handleEnd();
            this.startX = 0;
        });
    },

    animateSwipeOut(card, direction) {
        const xTarget = direction === 'right' ? 500 : -500;

        if (typeof gsap !== 'undefined') {
            gsap.to(card, {
                x: xTarget,
                opacity: 0,
                rotation: direction === 'right' ? 20 : -20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    if (direction === 'right' && this.onLearn) {
                        this.showPointsAnimation(card.parentElement, '+10');
                        this.onLearn();
                    } else if (direction === 'left' && this.onRepeat) {
                        this.onRepeat();
                    }
                }
            });
        } else {
            if (direction === 'right' && this.onLearn) this.onLearn();
            else if (direction === 'left' && this.onRepeat) this.onRepeat();
        }

        if (navigator.vibrate) {
            navigator.vibrate(direction === 'right' ? 10 : [5, 15, 5]);
        }
    },

    showPointsAnimation(parent, text) {
        if (!parent) return;
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800;
            color: var(--accent-1); pointer-events: none; z-index: 100;
            text-shadow: 0 0 20px rgba(245, 197, 66, 0.8);
        `;
        parent.appendChild(el);

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(el,
                { y: 0, opacity: 1, scale: 0.5 },
                {
                    y: -100, opacity: 0, scale: 1.5, duration: 0.6, ease: 'power2.out',
                    onComplete: () => el.remove()
                }
            );
        } else {
            setTimeout(() => el.remove(), 600);
        }
    },

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        if (typeof Storage !== 'undefined' && Storage.getSoundEnabled && !Storage.getSoundEnabled()) return;

        // Cancel immediately for instant response
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 0.9; // slightly lower for male voice

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            // Prefer male English voices
            const maleVoice = voices.find(v =>
                v.lang.startsWith('en') &&
                (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark') ||
                 v.name.includes('Guy') || v.name.includes('Daniel') || v.name.includes('James'))
            );

            if (maleVoice) {
                utterance.voice = maleVoice;
            } else {
                const enVoice = voices.find(v => v.lang.startsWith('en'));
                if (enVoice) utterance.voice = enVoice;
            }
        }

        window.speechSynthesis.speak(utterance);
    },

    celebrateCompletion(container) {
        if (!container) return;
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            const size = 6 + Math.random() * 8;
            star.style.cssText = `
                position: absolute; width: ${size}px; height: ${size}px;
                background: ${Math.random() > 0.5 ? 'var(--accent-1)' : 'var(--accent-2)'};
                border-radius: 50%; top: 50%; left: 50%;
                pointer-events: none; z-index: 10;
                box-shadow: 0 0 ${size * 2}px currentColor;
            `;
            container.appendChild(star);

            if (typeof gsap !== 'undefined') {
                const angle = (Math.PI * 2 / 15) * i;
                const distance = 80 + Math.random() * 120;
                gsap.fromTo(star,
                    { x: 0, y: 0, opacity: 1, scale: 0 },
                    {
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                        opacity: 0, scale: 1.2,
                        duration: 0.8,
                        ease: 'power3.out',
                        onComplete: () => star.remove()
                    }
                );
            }
        }
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    }
};

window.Flashcard = Flashcard;
