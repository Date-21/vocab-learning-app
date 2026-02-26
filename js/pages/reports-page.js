// Oişbiting — Reports Page (Yıldız Haritam)
// Celestial DNA — İstatistik kartları, takımyıldız grafikleri, liderlik tablosu

const ReportsPage = {
    currentPeriod: 'weekly',

    async render(params = {}) {
        const container = document.createElement('div');
        container.className = 'reports-page page-enter';

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Yıldız Haritam</h1>
                <p class="page-subtitle">Gözlem ilerlemenizi keşfedin</p>
            </div>

            <div class="tabs" style="margin-bottom: var(--space-lg);">
                <button class="tab" data-period="daily">Günlük</button>
                <button class="tab active" data-period="weekly">Haftalık</button>
                <button class="tab" data-period="monthly">Aylık</button>
            </div>

            <div id="stats-overview" class="stats-grid" style="margin-bottom: var(--space-xl);">
                <div class="card skeleton" style="height: 80px;"></div>
                <div class="card skeleton" style="height: 80px;"></div>
                <div class="card skeleton" style="height: 80px;"></div>
                <div class="card skeleton" style="height: 80px;"></div>
                <div class="card skeleton" style="height: 80px;"></div>
                <div class="card skeleton" style="height: 80px;"></div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-md);">Işık Seyri</h3>
                <div id="points-chart" style="min-height: 150px;"></div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-md);">Gözlem Süresi</h3>
                <div id="time-chart" style="min-height: 150px;"></div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-xl);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-md);">Gözlem Dağılımı</h3>
                <div id="distribution-chart" style="min-height: 150px;"></div>
            </div>

            <div class="card" style="padding: var(--space-lg); margin-bottom: var(--space-xl);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <h3 style="font-family: var(--font-display); font-size: var(--text-md);">Karanlık Yıldızlar</h3>
                    <button class="btn btn-ghost" id="practice-weak" style="font-size: var(--text-xs);">Çalış</button>
                </div>
                <div id="weak-words-list">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            </div>

            <h3 style="font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-md);">Gözlemevi Sıralaması</h3>

            <div class="tabs" style="margin-bottom: var(--space-sm);">
                <button class="tab active" data-lb="points">Işık</button>
                <button class="tab" data-lb="time">Gözlem Süresi</button>
            </div>
            <div class="tabs" style="margin-bottom: var(--space-lg);">
                <button class="tab active" data-lb-period="all">Tüm Zamanlar</button>
                <button class="tab" data-lb-period="weekly">Haftalık</button>
                <button class="tab" data-lb-period="monthly">Aylık</button>
            </div>
            <div class="card" style="padding: var(--space-md);">
                <div id="leaderboard-content">
                    <div class="skeleton skeleton-text" style="height: 40px;"></div>
                    <div class="skeleton skeleton-text" style="height: 40px;"></div>
                    <div class="skeleton skeleton-text" style="height: 40px;"></div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        await this.loadData(container);

        return container;
    },

    setupEventListeners(container) {
        // Period tabs
        container.querySelectorAll('.tabs:first-of-type .tab[data-period]').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.tab[data-period]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentPeriod = tab.dataset.period;
                this.loadData(container);
            });
        });

        // Leaderboard type tabs
        container.querySelectorAll('[data-lb]').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('[data-lb]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadLeaderboard(container);
            });
        });

        // Leaderboard period tabs
        container.querySelectorAll('[data-lb-period]').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('[data-lb-period]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadLeaderboard(container);
            });
        });

        container.querySelector('#practice-weak')?.addEventListener('click', () => {
            Router.navigate('study');
        });
    },

    async loadData(container) {
        const userId = Auth.user.id;

        try {
            let stats = [];
            const endDate = new Date();
            const startDate = new Date();

            if (this.currentPeriod === 'daily') {
                startDate.setDate(startDate.getDate() - 1);
                stats = await DB.stats.getRange(userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
            } else if (this.currentPeriod === 'weekly') {
                startDate.setDate(startDate.getDate() - 7);
                stats = await DB.stats.getWeekly(userId);
            } else {
                startDate.setDate(startDate.getDate() - 30);
                stats = await DB.stats.getMonthly(userId);
            }

            const totals = stats.reduce((acc, day) => ({
                points: acc.points + (day.points_earned || 0),
                words: acc.words + (day.words_learned || 0),
                time: acc.time + (day.study_time || 0),
                tests: acc.tests + (day.tests_completed || 0)
            }), { points: 0, words: 0, time: 0, tests: 0 });

            const testHistory = await DB.tests.getHistory(userId, 50);
            const totalCorrect = testHistory.reduce((sum, t) => sum + t.correct_answers, 0);
            const totalQuestions = testHistory.reduce((sum, t) => sum + t.total_questions, 0);
            const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

            this.renderStatsOverview(container, totals, successRate, totalCorrect, totalQuestions - totalCorrect);
            this.renderCharts(container, stats);
            this.loadLeaderboard(container);
            this.loadWeakWords(container);
        } catch (error) {
            console.error('İstatistikler yüklenemedi:', error);
            Toast.error('İstatistikler yüklenemedi');
        }
    },

    renderStatsOverview(container, totals, successRate, correctCount, incorrectCount) {
        const statsEl = container.querySelector('#stats-overview');
        statsEl.innerHTML = `
            <div class="card" style="text-align: center; padding: var(--space-md);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">Toplanan Işık</div>
                <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--accent-1);">${Helpers.formatNumber(totals.points)}</div>
            </div>
            <div class="card" style="text-align: center; padding: var(--space-md);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">Gözlem Süresi</div>
                <div style="font-family: var(--font-display); font-size: var(--text-lg);">${Helpers.formatDuration(totals.time)}</div>
            </div>
            <div class="card" style="text-align: center; padding: var(--space-md);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">Keşfedilen Yıldız</div>
                <div style="font-family: var(--font-display); font-size: var(--text-lg);">${totals.words}</div>
            </div>
            <div class="card" style="text-align: center; padding: var(--space-md);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">Doğru Gözlem</div>
                <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--success);">${correctCount}</div>
            </div>
            <div class="card" style="text-align: center; padding: var(--space-md);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">Hatalı Gözlem</div>
                <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--error);">${incorrectCount}</div>
            </div>
            <div class="card" style="text-align: center; padding: var(--space-md);">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-xs);">Başarı Oranı</div>
                <div style="font-family: var(--font-display); font-size: var(--text-lg);">%${successRate}</div>
            </div>
        `;
    },

    renderCharts(container, stats) {
        const pointsChartEl = container.querySelector('#points-chart');
        if (stats.length > 0) {
            Charts.line(pointsChartEl, {
                labels: stats.map(s => {
                    const d = new Date(s.date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                }),
                values: stats.map(s => s.points_earned || 0),
                color: 'var(--accent-1)'
            });
        } else {
            pointsChartEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-xl); font-size: var(--text-sm);">Henüz veri yok</p>';
        }

        const timeChartEl = container.querySelector('#time-chart');
        if (stats.length > 0) {
            Charts.bar(timeChartEl, {
                labels: stats.map(s => {
                    const d = new Date(s.date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                }),
                values: stats.map(s => s.study_time || 0)
            });
        } else {
            timeChartEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-xl); font-size: var(--text-sm);">Henüz veri yok</p>';
        }

        const distChartEl = container.querySelector('#distribution-chart');
        const totalWords = stats.reduce((sum, s) => sum + (s.words_learned || 0), 0);
        const totalTests = stats.reduce((sum, s) => sum + (s.tests_completed || 0), 0);

        Charts.pie(distChartEl, {
            labels: ['Takımyıldızlar', 'Gözlemler'],
            values: [totalWords, totalTests],
            colors: ['var(--accent-1)', 'var(--accent-2)']
        });
    },

    async loadLeaderboard(container) {
        const lbContent = container.querySelector('#leaderboard-content');
        const activeType = container.querySelector('[data-lb].active')?.dataset.lb || 'points';
        const activePeriod = container.querySelector('[data-lb-period].active')?.dataset.lbPeriod || 'all';

        try {
            const leaderboard = await DB.users.getLeaderboard(activeType, activePeriod, CONFIG.LEADERBOARD_LIMIT);
            const userRank = await DB.users.getUserRank(Auth.user.id, activeType);
            const currentUserId = Auth.user.id;

            if (leaderboard.length === 0) {
                lbContent.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-lg); font-size: var(--text-sm);">Gökyüzü henüz boş</p>';
                return;
            }

            lbContent.innerHTML = leaderboard.map((user, index) => {
                const value = activeType === 'points'
                    ? Helpers.formatNumber(user.total_points) + ' ışık'
                    : Helpers.formatDuration(user.total_study_time);

                return `
                    <div class="leaderboard-item ${user.id === currentUserId ? 'current-user' : ''}">
                        <div class="leaderboard-rank ${index < 3 ? `top-${index + 1}` : ''}">${index + 1}</div>
                        <div class="leaderboard-user">
                            <span class="leaderboard-username">${Helpers.escapeHtml(user.username)}</span>
                        </div>
                        <span class="leaderboard-value">${value}</span>
                    </div>
                `;
            }).join('');

            if (userRank > CONFIG.LEADERBOARD_LIMIT) {
                const profile = Auth.getProfile();
                const value = activeType === 'points'
                    ? Helpers.formatNumber(profile.total_points) + ' ışık'
                    : Helpers.formatDuration(profile.total_study_time);

                lbContent.innerHTML += `
                    <div style="text-align: center; padding: var(--space-xs); color: var(--text-muted);">...</div>
                    <div class="leaderboard-item current-user">
                        <div class="leaderboard-rank">${userRank}</div>
                        <div class="leaderboard-user">
                            <span class="leaderboard-username">${Helpers.escapeHtml(profile.username)}</span>
                        </div>
                        <span class="leaderboard-value">${value}</span>
                    </div>
                `;
            }
        } catch (error) {
            lbContent.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: var(--text-sm);">Yüklenemedi</p>';
        }
    },

    async loadWeakWords(container) {
        const weakWordsEl = container.querySelector('#weak-words-list');
        try {
            const testHistory = await DB.tests.getHistory(Auth.user.id, 100);
            if (testHistory.length === 0) {
                weakWordsEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-md); font-size: var(--text-sm);">Henüz yeterli gözlem verisi yok</p>';
                return;
            }
            weakWordsEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-md); font-size: var(--text-sm);">Karanlık yıldızlarınızı görmek için daha fazla gözlem yapın</p>';
        } catch (error) {
            weakWordsEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: var(--text-sm);">Yüklenemedi</p>';
        }
    },

    cleanup() {}
};

window.ReportsPage = ReportsPage;
