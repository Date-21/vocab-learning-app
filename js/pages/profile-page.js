// Oişbiting — Profile Page (Gözlemcinin Günlüğü)
// Celestial DNA — Profil kartı, rozet vitrini, ayarlar, mesajlar

const ProfilePage = {
    userBadges: [],

    async render() {
        const container = document.createElement('div');
        container.className = 'profile-page page-enter';

        const profile = Auth.getProfile();
        if (!profile) {
            container.innerHTML = '<div class="empty-state"><h3 class="empty-state-title">Profil yüklenemedi</h3></div>';
            return container;
        }

        try {
            this.userBadges = await DB.badges.getUserBadges(Auth.user.id);
        } catch (e) {
            this.userBadges = [];
        }

        const totalLearned = await DB.progress.getTotalLearnedWords(Auth.user.id).catch(() => 0);

        container.innerHTML = `
            <!-- Profile Header -->
            <div style="text-align: center; padding: var(--space-xl) 0 var(--space-lg);">
                <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-md); font-family: var(--font-display); font-size: var(--text-xl); color: var(--canvas); font-weight: 700;">
                    ${Helpers.getInitials(profile.username)}
                </div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-xs);">${Helpers.escapeHtml(profile.username)}</h2>
                <p style="font-size: var(--text-sm); color: var(--text-muted);">${Helpers.escapeHtml(profile.email)}</p>
                <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-xs);">
                    Gözlemci olma tarihi: ${Helpers.formatDate(profile.created_at, 'long')}
                </p>
            </div>

            <!-- Stats Row -->
            <div class="stats-grid" style="margin-bottom: var(--space-xl);">
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--accent-1);">${Helpers.formatNumber(profile.total_points || 0)}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Işık</div>
                </div>
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg);">${totalLearned}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Yıldız</div>
                </div>
                <div class="card" style="text-align: center; padding: var(--space-md);">
                    <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--accent-1);">${profile.current_streak || 0}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted);">Seri</div>
                </div>
            </div>

            <!-- Badges -->
            <div style="margin-bottom: var(--space-xl);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-md);">Rozet Vitrini</h3>
                <div class="badge-grid" id="badges-grid">
                    ${this.renderBadges()}
                </div>
            </div>

            <!-- Messages -->
            <div class="card" id="open-messages" style="padding: var(--space-md); margin-bottom: var(--space-md); cursor: pointer;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Gözlemevinden Mesajlar</span>
                    </div>
                    <span id="unread-count" style="display: none; background: var(--accent-1); color: var(--canvas); font-size: var(--text-xs); padding: 2px 8px; border-radius: 10px; font-weight: 600;">0</span>
                </div>
            </div>

            <!-- Settings -->
            <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-md);">Tercihler</h3>

            <div class="card" style="margin-bottom: var(--space-md); overflow: hidden;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--surface-2);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Tema</span>
                    </div>
                    <select class="form-input" id="theme-select" style="width: auto; padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
                        <option value="light" ${Storage.getTheme() === 'light' ? 'selected' : ''}>Gündüz</option>
                        <option value="dark" ${Storage.getTheme() === 'dark' ? 'selected' : ''}>Gece</option>
                    </select>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--surface-2);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Kart Boyutu</span>
                    </div>
                    <select class="form-input" id="card-size-select" style="width: auto; padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
                        <option value="small" ${Storage.getCardSize() === 'small' ? 'selected' : ''}>Küçük</option>
                        <option value="normal" ${Storage.getCardSize() === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="large" ${Storage.getCardSize() === 'large' ? 'selected' : ''}>Büyük</option>
                    </select>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--surface-2);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Ses Efektleri</span>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="sound-toggle" ${Storage.getSoundEnabled() ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Sıralamada Görün</span>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="privacy-toggle" ${profile.settings?.privacy_leaderboard !== false ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Account -->
            <h3 style="font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-md);">Hesap</h3>

            <div class="card" style="margin-bottom: var(--space-md); overflow: hidden;">
                <div class="settings-row" id="change-username" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--surface-2); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Kullanıcı Adı Değiştir</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>

                <div class="settings-row" id="change-email" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--surface-2); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Email Değiştir</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>

                <div class="settings-row" id="change-password" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span style="font-size: var(--text-sm);">Şifre Değiştir</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="card" style="margin-bottom: var(--space-xl); overflow: hidden; border-color: rgba(248, 113, 113, 0.2);">
                <div class="settings-row" id="delete-account" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); cursor: pointer; color: var(--error);">
                    <div style="display: flex; align-items: center; gap: var(--space-sm);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="1.5">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        <span style="font-size: var(--text-sm); color: var(--error);">Hesabı Sil</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </div>

            ${Auth.isAdmin ? `
                <button class="btn btn-secondary" id="open-admin" style="width: 100%; margin-bottom: var(--space-md);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Yönetici Paneli
                </button>
            ` : ''}

            <button class="btn btn-danger" id="logout-btn" style="width: 100%; margin-bottom: var(--space-xl);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Çıkış Yap
            </button>
        `;

        this.setupEventListeners(container);
        this.loadUnreadCount(container);

        return container;
    },

    renderBadges() {
        const allBadges = Object.values(CONFIG.BADGES);
        const earnedIds = this.userBadges.map(b => b.badge_id);

        return allBadges.map(badge => {
            const isEarned = earnedIds.includes(badge.id);
            const svgIcon = (window.BADGE_ICONS && window.BADGE_ICONS[badge.id])
                ? window.BADGE_ICONS[badge.id]
                : badge.icon;

            return `
                <div class="badge-item" style="text-align: center; padding: var(--space-sm); opacity: ${isEarned ? 1 : 0.3}; ${isEarned ? 'filter: none;' : 'filter: grayscale(1);'}" title="${badge.name} — ${badge.value} ${badge.condition === 'words' ? 'yıldız' : badge.condition === 'streak' ? 'gün serisi' : 'başarı'}">
                    <div style="width: 40px; height: 40px; margin: 0 auto var(--space-xs); color: ${isEarned ? 'var(--accent-1)' : 'var(--text-muted)'};">${svgIcon}</div>
                    <div style="font-size: var(--text-xs); color: ${isEarned ? 'var(--text-primary)' : 'var(--text-muted)'};">${badge.name}</div>
                </div>
            `;
        }).join('');
    },

    setupEventListeners(container) {
        container.querySelector('#theme-select').addEventListener('change', (e) => {
            Storage.setTheme(e.target.value);
        });

        container.querySelector('#card-size-select').addEventListener('change', (e) => {
            Storage.setCardSize(e.target.value);
        });

        container.querySelector('#sound-toggle').addEventListener('change', (e) => {
            Storage.setSoundEnabled(e.target.checked);
        });

        container.querySelector('#privacy-toggle').addEventListener('change', async (e) => {
            const settings = { ...Auth.profile.settings, privacy_leaderboard: e.target.checked };
            await DB.users.updateSettings(Auth.user.id, settings);
            Auth.profile.settings = settings;
        });

        container.querySelector('#change-username').addEventListener('click', async () => {
            const newUsername = await Modal.prompt('Yeni kullanıcı adınızı girin:', 'Kullanıcı Adı Değiştir', Auth.profile.username);
            if (newUsername && newUsername !== Auth.profile.username) {
                try {
                    await Auth.updateUsername(newUsername);
                    Toast.success('Kullanıcı adı değiştirildi');
                    Router.navigate('profile');
                } catch (error) {
                    Toast.error(error.message);
                }
            }
        });

        container.querySelector('#change-email').addEventListener('click', () => {
            Modal.create({
                title: 'Email Değiştir',
                content: `
                    <div style="margin-bottom: var(--space-md);">
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Yeni Email</label>
                        <input type="email" class="form-input" id="new-email" placeholder="yeni@email.com">
                    </div>
                    <div>
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Mevcut Şifre</label>
                        <input type="password" class="form-input" id="email-password" placeholder="Şifreniz">
                    </div>
                `,
                actions: [
                    { id: 'cancel', label: 'İptal', class: 'btn-secondary', handler: (m) => Modal.close(m) },
                    {
                        id: 'save', label: 'Değiştir', class: 'btn-primary',
                        handler: async (m) => {
                            const email = m.querySelector('#new-email').value;
                            const password = m.querySelector('#email-password').value;
                            try {
                                await Auth.updateEmail(email, password);
                                Toast.success('Doğrulama emaili gönderildi');
                                Modal.close(m);
                            } catch (error) {
                                Toast.error(error.message);
                            }
                        }
                    }
                ],
                size: 'small'
            });
        });

        container.querySelector('#change-password').addEventListener('click', () => {
            Modal.create({
                title: 'Şifre Değiştir',
                content: `
                    <div style="margin-bottom: var(--space-md);">
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Mevcut Şifre</label>
                        <input type="password" class="form-input" id="current-password">
                    </div>
                    <div style="margin-bottom: var(--space-md);">
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Yeni Şifre</label>
                        <input type="password" class="form-input" id="new-password" placeholder="En az 8 karakter">
                    </div>
                    <div>
                        <label style="font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: var(--space-xs);">Yeni Şifre Tekrar</label>
                        <input type="password" class="form-input" id="new-password-confirm">
                    </div>
                `,
                actions: [
                    { id: 'cancel', label: 'İptal', class: 'btn-secondary', handler: (m) => Modal.close(m) },
                    {
                        id: 'save', label: 'Değiştir', class: 'btn-primary',
                        handler: async (m) => {
                            const current = m.querySelector('#current-password').value;
                            const newPw = m.querySelector('#new-password').value;
                            const confirm = m.querySelector('#new-password-confirm').value;
                            if (newPw !== confirm) { Toast.error('Şifreler eşleşmiyor'); return; }
                            try {
                                await Auth.updatePassword(current, newPw);
                                Toast.success('Şifre değiştirildi');
                                Modal.close(m);
                            } catch (error) {
                                Toast.error(error.message);
                            }
                        }
                    }
                ],
                size: 'small'
            });
        });

        container.querySelector('#delete-account').addEventListener('click', async () => {
            const confirmed = await Modal.confirm(
                'Hesabınız kalıcı olarak silinecek. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?',
                'Hesabı Sil', 'Sil', 'İptal'
            );
            if (confirmed) {
                const password = await Modal.prompt('İşlemin onayı için şifrenizi girin:', 'Şifre Doğrulama');
                if (password) {
                    try {
                        await Auth.deleteAccount(password);
                        Toast.success('Hesabınız silindi');
                    } catch (error) {
                        Toast.error(error.message);
                    }
                }
            }
        });

        container.querySelector('#open-messages').addEventListener('click', () => {
            this.showMessages(container);
        });

        container.querySelector('#open-admin')?.addEventListener('click', () => {
            Router.navigate('admin');
        });

        container.querySelector('#logout-btn').addEventListener('click', async () => {
            const confirmed = await Modal.confirm('Gözlemevinden ayrılmak istiyor musunuz?', 'Çıkış');
            if (confirmed) {
                await Auth.signOut();
            }
        });
    },

    async loadUnreadCount(container) {
        try {
            const count = await DB.messages.getUnreadCount(Auth.user.id);
            const badge = container.querySelector('#unread-count');
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = '';
            }
        } catch (e) {}
    },

    async showMessages(container) {
        const modal = Modal.create({
            title: 'Mesajlar',
            content: '<div class="loading-spinner" style="margin: var(--space-xl) auto;"></div>',
            size: 'large',
            actions: [
                { id: 'close', label: 'Kapat', class: 'btn-secondary', handler: (m) => Modal.close(m) }
            ]
        });

        try {
            const messages = await DB.messages.getForUser(Auth.user.id);
            const body = modal.querySelector('.modal-body');

            if (messages.length === 0) {
                body.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: var(--space-xl);">Mesajınız yok</p>';
                return;
            }

            body.innerHTML = messages.map(msg => `
                <div class="msg-item" data-msg-id="${msg.id}" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--surface-2); cursor: pointer; ${!msg.is_read ? 'background: rgba(96, 165, 250, 0.05);' : ''}">
                    <div>
                        <div style="font-size: var(--text-sm); font-weight: ${msg.is_read ? 'normal' : '600'};">${Helpers.escapeHtml(msg.title)}</div>
                        <div style="font-size: var(--text-xs); color: var(--text-muted);">${Helpers.formatRelativeTime(msg.created_at)}</div>
                    </div>
                    ${!msg.is_read ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-2); flex-shrink: 0;"></div>' : ''}
                </div>
            `).join('');

            body.querySelectorAll('.msg-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const msgId = parseInt(item.dataset.msgId);
                    const msg = messages.find(m => m.id === msgId);
                    if (msg) {
                        await DB.messages.markAsRead(msgId, Auth.user.id);
                        item.style.background = '';
                        item.querySelector('[style*="border-radius: 50%"]')?.remove();
                        Modal.alert(msg.content, msg.title);
                    }
                });
            });
        } catch (error) {
            const body = modal.querySelector('.modal-body');
            body.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Mesajlar yüklenemedi</p>';
        }
    },

    cleanup() {}
};

window.ProfilePage = ProfilePage;
