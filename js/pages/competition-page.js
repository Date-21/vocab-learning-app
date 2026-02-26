// Oişbiting — Competition Page (Uzay Yarışı)
// Celestial DNA — Yörünge yarışması, yıldız skor tablosu
// Supabase Realtime: Anlık puan güncellemeleri

const CompetitionPage = {
    currentRoom: null,
    roomChannel: null,
    broadcastChannel: null,
    isHost: false,
    participants: [],
    gameQuestions: [],
    currentQuestionIndex: 0,
    myScore: 0,
    questionTimer: null,
    roomTimeoutTimer: null,
    answeredPlayers: new Set(),
    myAnsweredThisQuestion: false,
    opponentScores: {},
    revealingAnswer: false,

    async render() {
        const container = document.createElement('div');
        container.className = 'competition-page page-enter';

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Uzay Yarışı</h1>
                <p class="page-subtitle">Rakiplerini yıldız bilginle alt et</p>
            </div>

            <div id="competition-content">
                ${this.renderMainMenu()}
            </div>

            <div class="card" style="margin-top: var(--space-xl);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-md);">Geçmiş Yarışlar</h3>
                <div id="game-history">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            </div>
        `;

        this.loadGameHistory(container);
        this.setupEventListeners(container);

        return container;
    },

    renderMainMenu() {
        return `
            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                <div class="card" id="create-room" style="cursor: pointer; padding: var(--space-lg);">
                    <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(245, 197, 66, 0.1); border-radius: var(--radius); flex-shrink: 0;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" stroke-width="1.5">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-xs);">Yarış Kur</h3>
                            <p style="font-size: var(--text-sm); color: var(--text-muted);">Yeni bir uzay yarışı başlat</p>
                        </div>
                    </div>
                </div>

                <div class="card" id="join-room" style="cursor: pointer; padding: var(--space-lg);">
                    <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(96, 165, 250, 0.1); border-radius: var(--radius); flex-shrink: 0;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="1.5">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-xs);">Yarışa Katıl</h3>
                            <p style="font-size: var(--text-sm); color: var(--text-muted);">Oda kodu ile mevcut yarışa gir</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    setupEventListeners(container) {
        container.querySelector('#create-room')?.addEventListener('click', () => {
            this.showCreateRoom(container);
        });
        container.querySelector('#join-room')?.addEventListener('click', () => {
            this.showJoinRoom(container);
        });
    },

    async showCreateRoom(container) {
        const content = container.querySelector('#competition-content');
        content.innerHTML = `
            <button class="btn btn-ghost" id="back-to-menu" style="margin-bottom: var(--space-lg); font-size: var(--text-sm);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Geri
            </button>
            <div style="text-align: center; padding: var(--space-xl);">
                <div class="loading-spinner" style="margin: 0 auto var(--space-lg);"></div>
                <p style="color: var(--text-muted);">Yarış hazırlanıyor...</p>
            </div>
        `;

        content.querySelector('#back-to-menu').addEventListener('click', () => {
            content.innerHTML = this.renderMainMenu();
            this.setupEventListeners(container);
        });

        try {
            const room = await DB.rooms.create(Auth.user.id, {
                levelStart: 1, levelEnd: 1,
                category: 'word_to_meaning', questionCount: 10
            });

            this.currentRoom = room;
            this.isHost = true;
            this.participants = [{ user_id: Auth.user.id, users: { username: Auth.profile.username } }];

            this.showWaitingRoom(container);
            this.subscribeToRoom(container);
            this.startRoomTimeout(container);
        } catch (error) {
            Toast.error('Yarış kurulamadı');
            content.innerHTML = this.renderMainMenu();
            this.setupEventListeners(container);
        }
    },

    showJoinRoom(container) {
        const content = container.querySelector('#competition-content');
        content.innerHTML = `
            <button class="btn btn-ghost" id="back-to-menu" style="margin-bottom: var(--space-lg); font-size: var(--text-sm);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Geri
            </button>
            <div style="text-align: center;">
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-xl);">Yarış Kodunu Girin</h2>
                <div class="room-code-input" style="display: flex; gap: var(--space-sm); justify-content: center; margin-bottom: var(--space-xl);">
                    ${[1, 2, 3, 4, 5].map(i => `
                        <input type="text" class="room-code-digit form-input" maxlength="1" data-index="${i}" inputmode="numeric" pattern="[0-9]"
                            style="width: 48px; height: 56px; text-align: center; font-family: var(--font-display); font-size: var(--text-lg);">
                    `).join('')}
                </div>
                <button class="btn btn-primary" id="join-btn" disabled style="width: 100%;">Katıl</button>
            </div>
        `;

        content.querySelector('#back-to-menu').addEventListener('click', () => {
            content.innerHTML = this.renderMainMenu();
            this.setupEventListeners(container);
        });

        const inputs = content.querySelectorAll('.room-code-digit');
        const joinBtn = content.querySelector('#join-btn');

        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                if (value && index < inputs.length - 1) inputs[index + 1].focus();
                const code = Array.from(inputs).map(i => i.value).join('');
                joinBtn.disabled = code.length !== 5;
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) inputs[index - 1].focus();
            });
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const digits = paste.replace(/\D/g, '').slice(0, 5);
                digits.split('').forEach((digit, i) => { if (inputs[i]) inputs[i].value = digit; });
                if (digits.length === 5) { joinBtn.disabled = false; joinBtn.focus(); }
            });
        });

        inputs[0].focus();

        joinBtn.addEventListener('click', async () => {
            const code = Array.from(inputs).map(i => i.value).join('');
            await this.joinRoom(container, code);
        });
    },

    async joinRoom(container, code) {
        const content = container.querySelector('#competition-content');
        const joinBtn = content.querySelector('#join-btn');
        joinBtn.disabled = true;
        joinBtn.innerHTML = '<span class="loading-spinner" style="width: 18px; height: 18px;"></span>';

        try {
            const room = await DB.rooms.getByCode(code);
            if (!room) {
                Toast.error('Yarış bulunamadı veya kapalı');
                joinBtn.disabled = false; joinBtn.textContent = 'Katıl'; return;
            }

            const participants = await DB.rooms.getParticipants(room.id);
            if (participants.length >= CONFIG.MAX_PARTICIPANTS) {
                Toast.error('Yarış dolu');
                joinBtn.disabled = false; joinBtn.textContent = 'Katıl'; return;
            }

            await DB.rooms.joinRoom(room.id, Auth.user.id);

            this.currentRoom = room;
            this.isHost = false;
            this.participants = [...participants, { user_id: Auth.user.id, users: { username: Auth.profile.username } }];

            this.showWaitingRoom(container);
            this.subscribeToRoom(container);
        } catch (error) {
            Toast.error('Yarışa katılamadı');
            joinBtn.disabled = false; joinBtn.textContent = 'Katıl';
        }
    },

    showWaitingRoom(container) {
        const content = container.querySelector('#competition-content');
        const room = this.currentRoom;

        content.innerHTML = `
            <div style="text-align: center; margin-bottom: var(--space-lg);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">Yarış Kodu</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: var(--space-sm);">
                    <span style="font-family: var(--font-display); font-size: var(--text-xl); letter-spacing: 0.15em; color: var(--accent-1);">${room.room_code}</span>
                    <button class="btn btn-ghost room-code-copy" style="padding: var(--space-xs);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <h4 style="font-size: var(--text-sm); color: var(--text-muted);">Gözlemciler (${this.participants.length}/${CONFIG.MAX_PARTICIPANTS})</h4>
                    <button class="btn btn-ghost" id="leave-room" style="padding: var(--space-xs); color: var(--error);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div id="participants-container">
                    ${this.renderParticipants()}
                </div>
            </div>

            ${this.isHost ? `
                <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                    <h4 style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-md);">Yarış Ayarları</h4>

                    <div style="margin-bottom: var(--space-md);">
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Takımyıldız Aralığı</label>
                        <div style="display: flex; gap: var(--space-sm); align-items: center;">
                            <select class="form-input" id="level-start" style="flex: 1;">
                                ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">Takımyıldız ${i + 1}</option>`).join('')}
                            </select>
                            <span style="color: var(--text-muted);">—</span>
                            <select class="form-input" id="level-end" style="flex: 1;">
                                ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${i === 0 ? 'selected' : ''}>Takımyıldız ${i + 1}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div style="margin-bottom: var(--space-md);">
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Kategori</label>
                        <select class="form-input" id="category">
                            <option value="word_to_meaning">Yıldızdan Anlama</option>
                            <option value="meaning_to_word">Anlamdan Yıldıza</option>
                            <option value="memory_to_word">Hafıza Cümlesiyle</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Soru Sayısı</label>
                        <div style="display: flex; gap: var(--space-sm);">
                            ${[5, 10, 20].map(n => `
                                <label style="flex: 1; display: block; cursor: pointer;">
                                    <input type="radio" name="game-count" value="${n}" ${n === 10 ? 'checked' : ''} style="display: none;">
                                    <div class="gc-option" style="text-align: center; padding: var(--space-sm); border: 1px solid ${n === 10 ? 'var(--accent-2)' : 'var(--surface-2)'}; border-radius: var(--radius); font-size: var(--text-sm); ${n === 10 ? 'color: var(--accent-2); background: rgba(96, 165, 250, 0.1);' : ''}">${n}</div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div id="room-timeout-warning" class="hidden" style="text-align: center; padding: var(--space-md); background: rgba(248, 113, 113, 0.1); border-radius: var(--radius); margin-bottom: var(--space-md);">
                    <p style="color: var(--error); font-size: var(--text-sm); margin-bottom: var(--space-sm);">Yarış 1 dakika içinde kapanacak</p>
                    <button class="btn btn-primary" id="extend-time" style="font-size: var(--text-sm);">Süreyi Uzat</button>
                </div>

                <button class="btn btn-primary" id="start-game" style="width: 100%;" ${this.participants.length < CONFIG.MIN_PARTICIPANTS ? 'disabled' : ''}>
                    Yarışı Başlat
                </button>
                ${this.participants.length < CONFIG.MIN_PARTICIPANTS ? `
                    <p style="text-align: center; color: var(--text-muted); margin-top: var(--space-sm); font-size: var(--text-xs);">
                        Başlatmak için en az ${CONFIG.MIN_PARTICIPANTS} gözlemci gerekli
                    </p>
                ` : ''}
            ` : `
                <div style="text-align: center; padding: var(--space-xl); color: var(--text-muted);">
                    <p>Yarış sahibinin başlatmasını bekliyorsunuz...</p>
                </div>
            `}
        `;

        // Events
        content.querySelector('.room-code-copy').addEventListener('click', async () => {
            await Helpers.copyToClipboard(room.room_code);
            Toast.success('Kod kopyalandı');
        });

        content.querySelector('#leave-room').addEventListener('click', () => this.leaveRoom(container));

        if (this.isHost) {
            content.querySelector('#start-game').addEventListener('click', () => this.startGame(container));
            content.querySelector('#extend-time')?.addEventListener('click', () => this.extendRoomTimeout(container));

            // Radio visual toggle
            content.querySelectorAll('input[name="game-count"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    content.querySelectorAll('input[name="game-count"]').forEach(r => {
                        const div = r.parentElement.querySelector('.gc-option');
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
        }
    },

    renderParticipants() {
        return this.participants.map(p => `
            <div style="display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) 0; ${p.user_id === Auth.user.id ? 'color: var(--accent-1);' : ''}">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--surface-2); display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: 600;">${Helpers.getInitials(p.users.username)}</div>
                <span style="font-size: var(--text-sm);">${Helpers.escapeHtml(p.users.username)}</span>
                ${p.user_id === this.currentRoom.host_user_id ? '<span style="font-size: var(--text-xs); color: var(--accent-1); margin-left: auto;">Kaptan</span>' : ''}
            </div>
        `).join('');
    },

    subscribeToRoom(container) {
        if (this.roomChannel) DB.rooms.unsubscribe(this.roomChannel);

        this.roomChannel = DB.rooms.subscribeToRoom(this.currentRoom.id, async (payload) => {
            if (payload.table === 'game_participants') {
                this.participants = await DB.rooms.getParticipants(this.currentRoom.id);
                const pc = container.querySelector('#participants-container');
                if (pc) pc.innerHTML = this.renderParticipants();
                const startBtn = container.querySelector('#start-game');
                if (startBtn && this.isHost) startBtn.disabled = this.participants.length < CONFIG.MIN_PARTICIPANTS;
            }

            if (payload.table === 'game_rooms') {
                if (payload.new?.status === 'playing') {
                    this.startGamePlay(container);
                } else if (payload.new?.status === 'waiting') {
                    if (this.questionTimer) clearInterval(this.questionTimer);
                    if (this.broadcastChannel) { DB.rooms.unsubscribe(this.broadcastChannel); this.broadcastChannel = null; }
                    this.gameQuestions = []; this.currentQuestionIndex = 0; this.myScore = 0;
                    this.answeredPlayers = new Set(); this.myAnsweredThisQuestion = false;
                    this.opponentScores = {}; this.revealingAnswer = false;
                    this.participants = await DB.rooms.getParticipants(this.currentRoom.id);
                    this.showWaitingRoom(container);
                }
            }
        });
    },

    startRoomTimeout(container) {
        if (this.roomTimeoutTimer) clearTimeout(this.roomTimeoutTimer);
        this.roomTimeoutTimer = setTimeout(() => {
            const warning = container.querySelector('#room-timeout-warning');
            if (warning) warning.classList.remove('hidden');
            setTimeout(() => {
                if (this.participants.length < CONFIG.MIN_PARTICIPANTS) this.closeRoom(container);
            }, CONFIG.ROOM_TIMEOUT_WARNING);
        }, CONFIG.ROOM_TIMEOUT);
    },

    extendRoomTimeout(container) {
        const warning = container.querySelector('#room-timeout-warning');
        if (warning) warning.classList.add('hidden');
        this.startRoomTimeout(container);
        Toast.success('Süre uzatıldı');
    },

    async startGame(container) {
        const settings = {
            levelStart: parseInt(container.querySelector('#level-start').value),
            levelEnd: parseInt(container.querySelector('#level-end').value),
            category: container.querySelector('#category').value,
            questionCount: parseInt(container.querySelector('input[name="game-count"]:checked').value)
        };

        try {
            const words = await DB.levels.getWordsInRange(settings.levelStart, settings.levelEnd);
            if (words.length < 4) { Toast.warning('Yeterli yıldız yok'); return; }
            this.gameQuestions = Test.generateQuestions(words, [settings.category], settings.questionCount);
            await DB.rooms.startRoom(this.currentRoom.id, this.gameQuestions);
            this.startGamePlay(container);
        } catch (error) {
            Toast.error('Yarış başlatılamadı');
        }
    },

    async startGamePlay(container) {
        if (this.roomTimeoutTimer) clearTimeout(this.roomTimeoutTimer);

        if (this.gameQuestions.length === 0) {
            try {
                const room = await DB.rooms.getRoom(this.currentRoom.id);
                this.gameQuestions = room.questions || [];
            } catch (e) {
                Toast.error('Sorular yüklenemedi'); return;
            }
        }

        this.currentQuestionIndex = 0; this.myScore = 0;
        this.answeredPlayers = new Set(); this.myAnsweredThisQuestion = false;
        this.revealingAnswer = false; this.opponentScores = {};
        this.participants.forEach(p => { if (p.user_id !== Auth.user.id) this.opponentScores[p.user_id] = 0; });

        if (this.broadcastChannel) DB.rooms.unsubscribe(this.broadcastChannel);
        this.broadcastChannel = DB.rooms.subscribeToGameBroadcast(this.currentRoom.id, (data) => {
            this.handleGameEvent(container, data);
        });

        this.showQuestion(container);
    },

    handleGameEvent(container, data) {
        if (data.type === 'answered' && data.questionIndex === this.currentQuestionIndex) {
            this.answeredPlayers.add(data.userId);
            if (data.userId !== Auth.user.id) {
                this.opponentScores[data.userId] = data.score;
                this.updateScoreDisplay(container);
            }
            this.checkAllAnswered(container);
        }
    },

    updateScoreDisplay(container) {
        const opponentScoreEl = container.querySelector('#opponent-score');
        if (opponentScoreEl) {
            const opponent = this.participants.find(p => p.user_id !== Auth.user.id);
            if (opponent) opponentScoreEl.textContent = this.opponentScores[opponent.user_id] || 0;
        }
        const myScoreEl = container.querySelector('#my-live-score');
        if (myScoreEl) myScoreEl.textContent = this.myScore;
    },

    checkAllAnswered(container) {
        if (this.revealingAnswer) return;
        if (this.participants.every(p => this.answeredPlayers.has(p.user_id))) {
            this.revealAndAdvance(container);
        }
    },

    revealAndAdvance(container) {
        if (this.revealingAnswer) return;
        this.revealingAnswer = true;
        if (this.questionTimer) clearInterval(this.questionTimer);

        const q = this.gameQuestions[this.currentQuestionIndex];
        if (q) {
            container.querySelectorAll('.answer-btn').forEach(opt => {
                opt.disabled = true;
                if (opt.getAttribute('data-value') === q.correct) opt.classList.add('correct');
            });
        }

        const waitingEl = container.querySelector('#waiting-opponent');
        if (waitingEl) waitingEl.classList.add('hidden');

        setTimeout(() => {
            this.currentQuestionIndex++;
            this.answeredPlayers = new Set();
            this.myAnsweredThisQuestion = false;
            this.revealingAnswer = false;
            this.showQuestion(container);
        }, 2000);
    },

    showQuestion(container) {
        const content = container.querySelector('#competition-content');
        const q = this.gameQuestions[this.currentQuestionIndex];

        if (!q) { this.endGame(container); return; }

        const opponent = this.participants.find(p => p.user_id !== Auth.user.id);
        const opponentName = opponent ? opponent.users.username : '?';
        const opponentScore = opponent ? (this.opponentScores[opponent.user_id] || 0) : 0;
        const myName = Auth.profile.username;

        content.innerHTML = `
            <div class="game-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding: var(--space-sm) var(--space-md); background: var(--surface); border-radius: var(--radius);">
                    <div style="text-align: center;">
                        <div style="font-size: var(--text-xs); color: var(--accent-1);">${Helpers.escapeHtml(myName)}</div>
                        <div style="font-family: var(--font-display); font-size: var(--text-lg);" id="my-live-score">${this.myScore}</div>
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">VS</div>
                    <div style="text-align: center;">
                        <div style="font-size: var(--text-xs); color: var(--accent-2);">${Helpers.escapeHtml(opponentName)}</div>
                        <div style="font-family: var(--font-display); font-size: var(--text-lg);" id="opponent-score">${opponentScore}</div>
                    </div>
                </div>

                <div class="progress" style="margin-bottom: var(--space-md);">
                    <div class="progress-bar" style="width: ${((this.currentQuestionIndex) / this.gameQuestions.length) * 100}%"></div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <span style="font-size: var(--text-sm); color: var(--text-muted);">Soru ${this.currentQuestionIndex + 1}/${this.gameQuestions.length}</span>
                    <div id="game-timer" style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--text-sm); color: var(--accent-2);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span id="timer-value">${CONFIG.COMPETITION_QUESTION_TIME}s</span>
                    </div>
                </div>

                <div class="card" style="text-align: center; padding: var(--space-lg); margin-bottom: var(--space-lg);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg);">${Helpers.escapeHtml(q.question)}</div>
                </div>

                <div class="answer-options" id="game-options">
                    ${q.options.map((option, i) => `
                        <button class="answer-btn" data-value="${Helpers.escapeHtml(option)}">
                            ${String.fromCharCode(65 + i)}) ${Helpers.escapeHtml(option)}
                        </button>
                    `).join('')}
                </div>

                <div id="waiting-opponent" class="hidden" style="text-align: center; padding: var(--space-md); color: var(--text-muted); font-size: var(--text-sm);">
                    <span class="loading-spinner" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: var(--space-xs);"></span>
                    Rakibiniz düşünüyor...
                </div>
            </div>
        `;

        content.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectGameAnswer(container, btn, q));
        });

        this.startQuestionTimer(container);
    },

    startQuestionTimer(container) {
        let timeLeft = CONFIG.COMPETITION_QUESTION_TIME;
        const timerEl = container.querySelector('#timer-value');
        const timerContainer = container.querySelector('#game-timer');

        if (this.questionTimer) clearInterval(this.questionTimer);

        this.questionTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `${timeLeft}s`;
            if (timeLeft <= 5) timerContainer.style.color = 'var(--error)';
            if (timeLeft <= 0) { clearInterval(this.questionTimer); this.timeoutQuestion(container); }
        }, 1000);
    },

    selectGameAnswer(container, btn, question) {
        if (this.myAnsweredThisQuestion) return;
        this.myAnsweredThisQuestion = true;

        container.querySelectorAll('.answer-btn').forEach(opt => { opt.disabled = true; });

        const selected = btn.getAttribute('data-value');
        const isCorrect = selected === question.correct;
        btn.classList.add(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            this.myScore += CONFIG.POINTS.COMPETITION_1ST;
            Flashcard.showPointsAnimation(container.querySelector('.game-container'), '+' + CONFIG.POINTS.COMPETITION_1ST);
            DB.rooms.updateScore(this.currentRoom.id, Auth.user.id, this.myScore).catch(console.error);
            if (navigator.vibrate) navigator.vibrate(6);
        } else {
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        }

        this.updateScoreDisplay(container);
        this.answeredPlayers.add(Auth.user.id);

        DB.rooms.broadcastGameEvent(this.broadcastChannel, {
            type: 'answered', userId: Auth.user.id,
            questionIndex: this.currentQuestionIndex, score: this.myScore
        });

        if (this.participants.every(p => this.answeredPlayers.has(p.user_id))) {
            this.revealAndAdvance(container);
        } else {
            const waitingEl = container.querySelector('#waiting-opponent');
            if (waitingEl) waitingEl.classList.remove('hidden');
        }
    },

    timeoutQuestion(container) {
        if (!this.myAnsweredThisQuestion) {
            this.myAnsweredThisQuestion = true;
            this.answeredPlayers.add(Auth.user.id);
            DB.rooms.broadcastGameEvent(this.broadcastChannel, {
                type: 'answered', userId: Auth.user.id,
                questionIndex: this.currentQuestionIndex, score: this.myScore
            });
        }
        this.revealAndAdvance(container);
    },

    async endGame(container) {
        if (this.questionTimer) clearInterval(this.questionTimer);

        try {
            await DB.rooms.updateScore(this.currentRoom.id, Auth.user.id, this.myScore);
            await DB.gameHistory.save(Auth.user.id, {
                roomCode: this.currentRoom.room_code, category: this.currentRoom.category,
                questionCount: this.gameQuestions.length, participantCount: this.participants.length,
                score: this.myScore, rank: 1
            });
            this.participants = await DB.rooms.getParticipants(this.currentRoom.id);
            if (this.isHost) {
                await DB.rooms.setFinalRanks(this.currentRoom.id);
                await DB.rooms.updateStatus(this.currentRoom.id, 'finished');
            }
        } catch (e) { console.error(e); }

        this.showGameResults(container);
    },

    showGameResults(container) {
        const content = container.querySelector('#competition-content');
        const sorted = [...this.participants].sort((a, b) => b.score - a.score);

        content.innerHTML = `
            <div style="text-align: center; padding: var(--space-xl) 0;">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="rgba(245, 197, 66, 0.2)" stroke="var(--accent-1)" stroke-width="1.5" style="margin-bottom: var(--space-lg); filter: drop-shadow(0 0 12px rgba(245, 197, 66, 0.5));">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <h2 style="font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: var(--space-lg);">Yarış Sona Erdi!</h2>

                <div style="margin-bottom: var(--space-xl);">
                    ${sorted.map((p, i) => `
                        <div class="card" style="display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md); margin-bottom: var(--space-xs); ${p.user_id === Auth.user.id ? 'border-color: var(--accent-1);' : ''}">
                            <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--text-sm); ${i === 0 ? 'background: rgba(245, 197, 66, 0.2); color: var(--accent-1);' : i === 1 ? 'background: rgba(192, 192, 192, 0.2); color: #c0c0c0;' : i === 2 ? 'background: rgba(205, 127, 50, 0.2); color: #cd7f32;' : 'background: var(--surface-2); color: var(--text-muted);'}">${i + 1}</div>
                            <span style="flex: 1; font-size: var(--text-sm);">${Helpers.escapeHtml(p.users.username)}</span>
                            <span style="font-family: var(--font-display); color: var(--accent-1);">${p.score}</span>
                        </div>
                    `).join('')}
                </div>

                <p style="color: var(--text-muted); margin-bottom: var(--space-lg);">
                    Toplanan Işık: <strong style="color: var(--accent-1);">${this.myScore}</strong>
                </p>

                <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                    <button class="btn btn-primary" id="new-game" style="width: 100%;">Yeni Yarış</button>
                    <button class="btn btn-secondary" id="exit-game" style="width: 100%;">Yarıştan Ayrıl</button>
                </div>
            </div>
        `;

        Flashcard.celebrateCompletion(content);

        content.querySelector('#new-game').addEventListener('click', async () => {
            if (this.broadcastChannel) { DB.rooms.unsubscribe(this.broadcastChannel); this.broadcastChannel = null; }
            if (this.isHost) {
                try { await DB.rooms.resetRoom(this.currentRoom.id); } catch (e) { Toast.error('Yeni yarış başlatılamadı'); return; }
            }
            this.gameQuestions = []; this.currentQuestionIndex = 0; this.myScore = 0;
            this.answeredPlayers = new Set(); this.myAnsweredThisQuestion = false;
            this.opponentScores = {}; this.revealingAnswer = false;
            this.participants = await DB.rooms.getParticipants(this.currentRoom.id);
            this.showWaitingRoom(container);
        });

        content.querySelector('#exit-game').addEventListener('click', () => {
            this.cleanup();
            content.innerHTML = this.renderMainMenu();
            this.setupEventListeners(container);
        });
    },

    async leaveRoom(container) {
        const confirmed = await Modal.confirm(
            this.isHost ? 'Çıkarsanız yarış kapanacak. Çıkmak istiyor musunuz?' : 'Yarıştan ayrılmak istiyor musunuz?',
            'Yarıştan Çık'
        );

        if (confirmed) {
            if (this.isHost) {
                await this.closeRoom(container);
            } else {
                await DB.rooms.leaveRoom(this.currentRoom.id, Auth.user.id);
                this.cleanup();
                const content = container.querySelector('#competition-content');
                content.innerHTML = this.renderMainMenu();
                this.setupEventListeners(container);
            }
        }
    },

    async closeRoom(container) {
        try { await DB.rooms.deleteRoom(this.currentRoom.id); } catch (e) { console.error(e); }
        this.cleanup();
        Toast.info('Yarış kapatıldı');
        const content = container.querySelector('#competition-content');
        content.innerHTML = this.renderMainMenu();
        this.setupEventListeners(container);
    },

    async loadGameHistory(container) {
        const historyEl = container.querySelector('#game-history');
        try {
            const history = await DB.gameHistory.getHistory(Auth.user.id, 5);
            if (history.length === 0) {
                historyEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-lg); font-size: var(--text-sm);">Henüz yarış geçmişiniz yok</p>';
            } else {
                historyEl.innerHTML = history.map(h => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) 0; border-bottom: 1px solid var(--surface-2);">
                        <div>
                            <div style="font-size: var(--text-sm);">${h.user_rank}. sırada bitirdiniz</div>
                            <div style="font-size: var(--text-xs); color: var(--text-muted);">${Helpers.formatRelativeTime(h.played_at)} — ${h.participant_count} gözlemci</div>
                        </div>
                        <span style="font-family: var(--font-display); color: var(--accent-1);">${h.user_score}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            historyEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: var(--text-sm);">Yüklenemedi</p>';
        }
    },

    cleanup() {
        if (this.roomChannel) { DB.rooms.unsubscribe(this.roomChannel); this.roomChannel = null; }
        if (this.broadcastChannel) { DB.rooms.unsubscribe(this.broadcastChannel); this.broadcastChannel = null; }
        if (this.questionTimer) { clearInterval(this.questionTimer); this.questionTimer = null; }
        if (this.roomTimeoutTimer) { clearTimeout(this.roomTimeoutTimer); this.roomTimeoutTimer = null; }
        this.currentRoom = null; this.isHost = false; this.participants = [];
        this.gameQuestions = []; this.currentQuestionIndex = 0; this.myScore = 0;
        this.answeredPlayers = new Set(); this.myAnsweredThisQuestion = false;
        this.opponentScores = {}; this.revealingAnswer = false;
    }
};

window.CompetitionPage = CompetitionPage;
