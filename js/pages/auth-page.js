// Oişbiting — Auth Page
// Celestial DNA — Tam ekran yıldız alanı, glass-morphism kart

const AuthPage = {
    resendTimer: null,
    resendCountdown: 0,

    render() {
        const container = document.createElement('div');
        container.className = 'auth-page';
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-logo">
                    <svg viewBox="0 0 60 60" width="60" height="60" fill="none" style="margin-bottom: var(--space-md);">
                        <circle cx="30" cy="30" r="24" stroke="var(--accent-1)" stroke-width="1" opacity="0.3"/>
                        <circle cx="30" cy="30" r="12" stroke="var(--accent-1)" stroke-width="1" opacity="0.5"/>
                        <circle cx="30" cy="30" r="4" fill="var(--accent-1)"/>
                        <line x1="30" y1="2" x2="30" y2="14" stroke="var(--accent-1)" stroke-width="0.5" opacity="0.3"/>
                        <line x1="30" y1="46" x2="30" y2="58" stroke="var(--accent-1)" stroke-width="0.5" opacity="0.3"/>
                        <line x1="2" y1="30" x2="14" y2="30" stroke="var(--accent-1)" stroke-width="0.5" opacity="0.3"/>
                        <line x1="46" y1="30" x2="58" y2="30" stroke="var(--accent-1)" stroke-width="0.5" opacity="0.3"/>
                    </svg>
                    <h1>Oişbiting</h1>
                    <p>Yıldızlarını keşfet, gökyüzünü haritalandır</p>
                </div>

                <div class="auth-card">
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Giriş Yap</button>
                        <button class="auth-tab" data-tab="register">Kayıt Ol</button>
                    </div>

                    <!-- Login Form -->
                    <form class="auth-form" id="login-form">
                        <div class="form-group">
                            <label class="form-label">Email veya Kullanıcı Adı</label>
                            <input type="text" class="form-input" id="login-email" required
                                placeholder="email@ornek.com veya kullanıcıadı">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Şifre</label>
                            <div style="position: relative;">
                                <input type="password" class="form-input" id="login-password" required
                                    placeholder="Şifreniz">
                                <button type="button" class="password-toggle" data-target="login-password">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                            <label class="checkbox-label">
                                <input type="checkbox" id="remember-me">
                                <span>Beni hatırla</span>
                            </label>
                            <a class="forgot-password" id="forgot-password-link">Şifremi unuttum</a>
                        </div>
                        <div class="auth-actions">
                            <button type="submit" class="btn btn-primary btn-block">Giriş Yap</button>
                        </div>
                    </form>

                    <!-- Register Form -->
                    <form class="auth-form hidden" id="register-form">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="register-email" required
                                placeholder="email@ornek.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Kullanıcı Adı</label>
                            <input type="text" class="form-input" id="register-username" required
                                placeholder="3-20 karakter, harf, rakam ve _"
                                minlength="3" maxlength="20" pattern="[a-zA-Z0-9_]+">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Şifre</label>
                            <div style="position: relative;">
                                <input type="password" class="form-input" id="register-password" required
                                    placeholder="En az 8 karakter, 1 harf ve 1 rakam" minlength="8">
                                <button type="button" class="password-toggle" data-target="register-password">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Şifre Tekrar</label>
                            <div style="position: relative;">
                                <input type="password" class="form-input" id="register-password-confirm" required
                                    placeholder="Şifrenizi tekrar girin">
                                <button type="button" class="password-toggle" data-target="register-password-confirm">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="auth-actions">
                            <button type="submit" class="btn btn-primary btn-block">Kayıt Ol</button>
                        </div>
                    </form>

                    <!-- Forgot Password Form -->
                    <form class="auth-form hidden" id="forgot-form">
                        <div style="text-align: center; margin-bottom: var(--space-lg);">
                            <h3 style="font-family: var(--font-display); color: var(--accent-1); margin-bottom: var(--space-sm);">Şifre Sıfırlama</h3>
                            <p style="color: var(--text-secondary); font-size: var(--text-sm);">
                                Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="forgot-email" required
                                placeholder="email@ornek.com">
                        </div>
                        <div class="auth-actions">
                            <button type="submit" class="btn btn-primary btn-block">Sıfırlama Bağlantısı Gönder</button>
                            <button type="button" class="btn btn-ghost btn-block" id="back-to-login">Girişe Dön</button>
                        </div>
                    </form>

                    <!-- Verification Sent -->
                    <div class="verification-sent hidden" id="verification-sent">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <h2>Email Gönderildi!</h2>
                        <p id="verification-message" style="color: var(--text-secondary); margin-bottom: var(--space-lg);">
                            Email adresinize doğrulama linki gönderdik.
                        </p>
                        <button class="btn btn-secondary" id="resend-email" disabled>
                            Tekrar Gönder (<span id="resend-countdown">60</span>s)
                        </button>
                        <p style="color: var(--text-muted); font-size: var(--text-xs); margin-top: var(--space-md);">
                            Email gelmediyse spam klasörünü kontrol edin.
                        </p>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        return container;
    },

    setupEventListeners(container) {
        // Tab switching
        container.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(container, tab.dataset.tab));
        });

        // Password toggles
        container.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = container.querySelector(`#${btn.dataset.target}`);
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.innerHTML = isPassword
                    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>`
                    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>`;
            });
        });

        // Login
        container.querySelector('#login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(container);
        });

        // Register
        container.querySelector('#register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister(container);
        });

        // Forgot password
        container.querySelector('#forgot-password-link').addEventListener('click', () => {
            this.showForgotPassword(container);
        });

        container.querySelector('#forgot-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleForgotPassword(container);
        });

        container.querySelector('#back-to-login').addEventListener('click', () => {
            this.switchTab(container, 'login');
        });

        // Resend email
        container.querySelector('#resend-email').addEventListener('click', () => {
            this.handleResendEmail(container);
        });
    },

    switchTab(container, tab) {
        container.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        container.querySelector('#login-form').classList.toggle('hidden', tab !== 'login');
        container.querySelector('#register-form').classList.toggle('hidden', tab !== 'register');
        container.querySelector('#forgot-form').classList.add('hidden');
        container.querySelector('#verification-sent').classList.add('hidden');
    },

    showForgotPassword(container) {
        container.querySelector('#login-form').classList.add('hidden');
        container.querySelector('#register-form').classList.add('hidden');
        container.querySelector('#forgot-form').classList.remove('hidden');
        container.querySelector('#verification-sent').classList.add('hidden');
    },

    showVerificationSent(container, message) {
        container.querySelector('#login-form').classList.add('hidden');
        container.querySelector('#register-form').classList.add('hidden');
        container.querySelector('#forgot-form').classList.add('hidden');
        container.querySelector('#verification-sent').classList.remove('hidden');
        container.querySelector('#verification-message').textContent = message;
        this.startResendCountdown(container);
    },

    startResendCountdown(container) {
        this.resendCountdown = 60;
        const btn = container.querySelector('#resend-email');
        const countdown = container.querySelector('#resend-countdown');
        btn.disabled = true;

        if (this.resendTimer) clearInterval(this.resendTimer);
        this.resendTimer = setInterval(() => {
            this.resendCountdown--;
            countdown.textContent = this.resendCountdown;
            if (this.resendCountdown <= 0) {
                clearInterval(this.resendTimer);
                btn.disabled = false;
                btn.textContent = 'Tekrar Gönder';
            }
        }, 1000);
    },

    async handleLogin(container) {
        const emailOrUsername = container.querySelector('#login-email').value.trim();
        const password = container.querySelector('#login-password').value;

        if (!emailOrUsername || !password) {
            Toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        const btn = container.querySelector('#login-form button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner small"></span> Yörüngeye giriş yapılıyor...';

        try {
            await Auth.signIn(emailOrUsername, password);
            Toast.success('Yıldızlara hoş geldiniz!');
        } catch (error) {
            let msg = error.message || 'Giriş başarısız';
            if (msg.includes('Invalid login credentials')) msg = 'Email/kullanıcı adı veya şifre hatalı';
            else if (msg.includes('Email not confirmed')) msg = 'Email adresiniz henüz doğrulanmamış. Lütfen email kutunuzu kontrol edin.';
            Toast.error(msg);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Giriş Yap';
        }
    },

    async handleRegister(container) {
        const email = container.querySelector('#register-email').value.trim();
        const username = container.querySelector('#register-username').value.trim();
        const password = container.querySelector('#register-password').value;
        const passwordConfirm = container.querySelector('#register-password-confirm').value;

        if (!email || !username || !password || !passwordConfirm) {
            Toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        if (password !== passwordConfirm) {
            Toast.error('Şifreler eşleşmiyor');
            return;
        }

        const btn = container.querySelector('#register-form button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner small"></span> Takımyıldız oluşturuluyor...';

        try {
            const data = await Auth.signUp(email, password, username);
            if (data.user && !data.session) {
                this.showVerificationSent(container, 'Email adresinize doğrulama linki gönderdik. Lütfen email kutunuzu kontrol edin.');
                Toast.success('Kayıt başarılı! Email adresinizi doğrulayın.');
            } else if (data.session) {
                Toast.success('Kayıt başarılı! Yıldız haritanız hazır.');
            }
        } catch (error) {
            let msg = error.message || 'Kayıt başarısız';
            if (msg.includes('already registered') || msg.includes('already been registered')) {
                msg = 'Bu email adresi zaten kayıtlı. Giriş yapın veya şifrenizi sıfırlayın.';
            }
            Toast.error(msg);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Kayıt Ol';
        }
    },

    async handleForgotPassword(container) {
        const email = container.querySelector('#forgot-email').value.trim();
        if (!email) { Toast.error('Lütfen email adresinizi girin'); return; }

        const btn = container.querySelector('#forgot-form button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner small"></span> Gönderiliyor...';

        try {
            await Auth.resetPassword(email);
            this.showVerificationSent(container, 'Şifre sıfırlama bağlantısı email adresinize gönderildi.');
            Toast.success('Sıfırlama linki gönderildi!');
        } catch (error) {
            Toast.error(error.message || 'Bir hata oluştu');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sıfırlama Bağlantısı Gönder';
        }
    },

    async handleResendEmail(container) {
        const btn = container.querySelector('#resend-email');
        btn.disabled = true;
        try {
            Toast.success('Doğrulama emaili tekrar gönderildi');
            this.startResendCountdown(container);
        } catch {
            Toast.error('Email gönderilemedi');
            btn.disabled = false;
        }
    },

    cleanup() {
        if (this.resendTimer) clearInterval(this.resendTimer);
    }
};

window.AuthPage = AuthPage;
