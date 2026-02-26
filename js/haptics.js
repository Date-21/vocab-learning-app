// ============================================
// Oisbiting — Ses & Dokunma Geri Bildirimi
// Haptic: Vibration API
// Ses: Web Audio API — cok dusuk hacim
// Varsayilan: KAPALI — kullanici ayarlardan acar
// ============================================

var Haptics = {
    // Kullanici tercihleri
    soundEnabled: false,
    hapticEnabled: false,

    // Web Audio bağlamı — lazy init
    _audioCtx: null,

    init: function () {
        // Tercih yukle
        try {
            this.soundEnabled = localStorage.getItem('oisbiting_sound') === 'true';
            this.hapticEnabled = localStorage.getItem('oisbiting_haptic') === 'true';
        } catch (e) {
            // localStorage erisim hatasi — varsayilan KAPALI
        }
    },

    // Ses tercihini degistir
    toggleSound: function (enabled) {
        this.soundEnabled = enabled;
        try {
            localStorage.setItem('oisbiting_sound', enabled ? 'true' : 'false');
        } catch (e) {}
    },

    // Dokunma tercihini degistir
    toggleHaptic: function (enabled) {
        this.hapticEnabled = enabled;
        try {
            localStorage.setItem('oisbiting_haptic', enabled ? 'true' : 'false');
        } catch (e) {}
    },

    // === HAPTIC (Vibration API) ===

    _vibrate: function (pattern) {
        if (!this.hapticEnabled) return;
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    },

    // Kart cevirme — yumusak tik
    cardFlip: function () {
        this._vibrate([8]);
        this._playTone(400, 0.15, 0.03);
    },

    // Ezberleme basari — cift darbe (muhur)
    success: function () {
        this._vibrate([10, 50, 10]);
        this._playSuccessTone();
    },

    // Hata — hafif
    error: function () {
        this._vibrate([15]);
        this._playTone(200, 0.2, 0.02);
    },

    // Swipe — minimalist
    swipe: function () {
        this._vibrate([5]);
    },

    // Navigasyon — sayfa gecisi
    navigate: function () {
        this._vibrate([5]);
        this._playTone(400, 0.15, 0.03);
    },

    // === SES (Web Audio API) ===

    _getAudioCtx: function () {
        if (!this._audioCtx) {
            try {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null;
            }
        }
        return this._audioCtx;
    },

    // Basit sine dalga tonu
    _playTone: function (freq, duration, gain) {
        if (!this.soundEnabled) return;
        var ctx = this._getAudioCtx();
        if (!ctx) return;

        try {
            var osc = ctx.createOscillator();
            var gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gainNode.gain.setValueAtTime(gain, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Ses calma hatasi — sessizce devam
        }
    },

    // Basari sesi — sine 600Hz → 800Hz sweep
    _playSuccessTone: function () {
        if (!this.soundEnabled) return;
        var ctx = this._getAudioCtx();
        if (!ctx) return;

        try {
            var osc = ctx.createOscillator();
            var gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {
            // Ses calma hatasi — sessizce devam
        }
    }
};

// Baslat
Haptics.init();
window.Haptics = Haptics;
