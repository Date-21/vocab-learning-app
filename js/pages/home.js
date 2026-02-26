// Oişbiting — Home Page (Keşif)
// Celestial DNA — Göklerden merhaba, yörünge hedefleri, yıldız hızlı erişim

const HomePage = {
    reviewWords: [],

    async render() {
        const container = document.createElement('div');
        container.className = 'home-page page-enter';

        const profile = Auth.getProfile();
        const username = profile?.username || 'Gözlemci';
        const streak = profile?.current_streak || 0;
        const totalPoints = profile?.total_points || 0;

        container.innerHTML = `
            <div class="welcome-section">
                <p style="color: var(--text-muted); font-size: var(--text-sm);">Göklerden Merhaba</p>
                <h2 class="welcome-name">${Helpers.escapeHtml(username)}</h2>
                ${streak > 0 ? `
                    <div class="streak-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L8 8H3l4 5-2 7 7-4 7 4-2-7 4-5h-5L12 2z"/>
                        </svg>
                        ${streak} günlük seri
                    </div>
                ` : ''}
            </div>

            <div id="review-reminder-area"></div>

            <div class="daily-goals" id="daily-goals">
                <div class="goal-item skeleton" style="height: 64px;"></div>
                <div class="goal-item skeleton" style="height: 64px;"></div>
                <div class="goal-item skeleton" style="height: 64px;"></div>
            </div>

            <h3 class="section-title">Hızlı Keşif</h3>
            <div class="quick-actions">
                <div class="quick-action" onclick="Router.navigate('flashcards')">
                    <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="5" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/>
                        <circle cx="12" cy="12" r="2"/><circle cx="5" cy="19" r="1.5"/>
                        <line x1="5" y1="5" x2="12" y2="12" opacity="0.5"/>
                        <line x1="19" y1="5" x2="12" y2="12" opacity="0.5"/>
                    </svg>
                    <span class="quick-action-label">Takımyıldızlar</span>
                </div>
                <div class="quick-action" onclick="Router.navigate('study')">
                    <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="M8 22l4-6 4 6"/>
                    </svg>
                    <span class="quick-action-label">Gözlemevi</span>
                </div>
                <div class="quick-action" onclick="Router.navigate('competition')">
                    <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 2L8 8H3l4 5-2 7 7-4 7 4-2-7 4-5h-5L12 2z"/>
                    </svg>
                    <span class="quick-action-label">Uzay Yarışı</span>
                </div>
                <div class="quick-action" onclick="Router.navigate('reports')">
                    <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span class="quick-action-label">Yıldız Haritam</span>
                </div>
            </div>

            <h3 class="section-title" style="margin-top: var(--space-lg);">Gözlemevi Sıralaması</h3>
            <div class="card" id="mini-leaderboard">
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>

            ${Auth.isAdmin ? `
                <div style="margin-top: var(--space-lg);">
                    <button class="btn btn-secondary btn-block" onclick="Router.navigate('admin')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        Yönetici Paneli
                    </button>
                </div>
            ` : ''}
        `;

        this.loadData(container);
        return container;
    },

    async loadData(container) {
        try {
            // Load daily stats
            const today = await DB.stats.getOrCreate(Auth.user.id);
            this.renderGoals(container, today);

            // Load review words
            const reviewWords = await DB.progress.getWordsForReview(Auth.user.id);
            this.reviewWords = reviewWords || [];
            this.renderReviewReminder(container);

            // Load leaderboard
            const leaderboard = await DB.users.getLeaderboard('points', 'all', 5);
            this.renderLeaderboard(container, leaderboard);
        } catch (error) {
            console.error('Ana sayfa verileri yüklenemedi:', error);
        }
    },

    renderGoals(container, today) {
        const goalsEl = container.querySelector('#daily-goals');
        const wordsLearned = today?.words_learned || 0;
        const studyTime = today?.study_time || 0;
        const pointsEarned = today?.points_earned || 0;

        const wordsGoal = 20;
        const timeGoal = 30;
        const pointsGoal = 100;

        goalsEl.innerHTML = `
            <div class="goal-item">
                <div class="goal-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="2"/><circle cx="5" cy="5" r="1.5"/><line x1="5" y1="5" x2="12" y2="12" opacity="0.5"/>
                    </svg>
                </div>
                <div class="goal-info">
                    <div class="goal-label">Keşfedilen Yıldızlar</div>
                    <div class="goal-value">${wordsLearned} / ${wordsGoal}</div>
                    <div class="progress"><div class="progress-bar" style="width: ${Math.min(100, (wordsLearned / wordsGoal) * 100)}%"></div></div>
                </div>
            </div>
            <div class="goal-item">
                <div class="goal-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
                <div class="goal-info">
                    <div class="goal-label">Gözlem Süresi</div>
                    <div class="goal-value">${Helpers.formatDuration(studyTime)} / ${Helpers.formatDuration(timeGoal)}</div>
                    <div class="progress"><div class="progress-bar" style="width: ${Math.min(100, (studyTime / timeGoal) * 100)}%"></div></div>
                </div>
            </div>
            <div class="goal-item">
                <div class="goal-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </div>
                <div class="goal-info">
                    <div class="goal-label">Toplanan Işık</div>
                    <div class="goal-value">${pointsEarned} / ${pointsGoal} puan</div>
                    <div class="progress"><div class="progress-bar" style="width: ${Math.min(100, (pointsEarned / pointsGoal) * 100)}%"></div></div>
                </div>
            </div>
        `;
    },

    renderReviewReminder(container) {
        const area = container.querySelector('#review-reminder-area');
        if (this.reviewWords.length > 0) {
            area.innerHTML = `
                <div class="review-reminder" onclick="Router.navigate('flashcards')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div>
                        <div style="font-weight: 600; color: var(--accent-1);">${this.reviewWords.length} yıldız tekrar bekliyor</div>
                        <div style="font-size: var(--text-xs); color: var(--text-muted);">Işıklarını korumak için tekrar et</div>
                    </div>
                </div>
            `;
        } else {
            area.innerHTML = '';
        }
    },

    renderLeaderboard(container, leaderboard) {
        const lbEl = container.querySelector('#mini-leaderboard');
        if (!leaderboard || leaderboard.length === 0) {
            lbEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-md);">Gökyüzü henüz boş</p>';
            return;
        }

        lbEl.innerHTML = `<div class="leaderboard-list">
            ${leaderboard.map((user, i) => `
                <div class="leaderboard-item ${user.id === Auth.user.id ? 'current-user' : ''}">
                    <div class="leaderboard-rank ${i < 3 ? `top-${i + 1}` : ''}">${i + 1}</div>
                    <div class="leaderboard-user">
                        <span class="leaderboard-username">${Helpers.escapeHtml(user.username)}</span>
                    </div>
                    <span class="leaderboard-value">${Helpers.formatNumber(user.total_points)}</span>
                </div>
            `).join('')}
        </div>`;
    },

    cleanup() {}
};

window.HomePage = HomePage;
