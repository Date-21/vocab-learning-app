// Oişbiting — Tier 1: Living Background — Star Field (Optimized)
// Celestial Cartography DNA — Yıldız parçacık sistemi + nebula + pointer reaktif
// Performance: squared distance, cached nebula, visibility API, capped stars

class StellarAtmosphere {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.shootingStars = [];
        this.W = 0;
        this.H = 0;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.pointer = { x: 0, y: 0, lx: 0, ly: 0 };
        this.time = 0;
        this.transitionBurst = 0;
        this.isVisible = true;
        this.nebulaFrame = 0;
        this.animId = null;

        this.resize();
        this.initStars();

        window.addEventListener('resize', () => this.resize());

        // Throttled pointer tracking (every 32ms ~30fps)
        let pointerThrottle = 0;
        document.addEventListener('pointermove', (e) => {
            const now = Date.now();
            if (now - pointerThrottle < 32) return;
            pointerThrottle = now;
            this.pointer.x = e.clientX;
            this.pointer.y = e.clientY;
        }, { passive: true });

        // Page Visibility API — pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible && !this.animId) this.animate();
        });

        this.animate();
    }

    resize() {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.canvas.width = this.W * this.dpr;
        this.canvas.height = this.H * this.dpr;
        this.canvas.style.width = this.W + 'px';
        this.canvas.style.height = this.H + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        if (this.pointer.x === 0) {
            this.pointer.x = this.W / 2;
            this.pointer.y = this.H / 2;
            this.pointer.lx = this.W / 2;
            this.pointer.ly = this.H / 2;
        }
    }

    initStars() {
        // Capped at 80 stars (was 150)
        const count = Math.min(80, Math.floor((this.W * this.H) / 12000));
        this.stars = [];

        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                size: Math.random() * 2 + 0.5,
                baseAlpha: Math.random() * 0.6 + 0.2,
                twinkleSpeed: Math.random() * 0.003 + 0.001,
                twinkleOffset: Math.random() * Math.PI * 2,
                color: Math.random() > 0.7
                    ? { r: 96, g: 165, b: 250 }
                    : Math.random() > 0.5
                        ? { r: 245, g: 197, b: 66 }
                        : { r: 226, g: 224, b: 214 }
            });
        }
    }

    spawnShootingStar() {
        if (this.shootingStars.length >= 1) return;
        if (Math.random() > 0.002) return;

        const angle = Math.random() * 0.4 + 0.3;
        this.shootingStars.push({
            x: Math.random() * this.W * 0.8,
            y: Math.random() * this.H * 0.3,
            vx: Math.cos(angle) * (3 + Math.random() * 4),
            vy: Math.sin(angle) * (3 + Math.random() * 4),
            life: 1,
            decay: 0.015 + Math.random() * 0.01,
            length: 20 + Math.random() * 30
        });
    }

    onTransition() {
        this.transitionBurst = 1;
    }

    animate() {
        if (!this.isVisible) { this.animId = null; return; }

        const ctx = this.ctx;
        const W = this.W;
        const H = this.H;

        ctx.clearRect(0, 0, W, H);
        this.time++;

        // Smooth pointer tracking
        this.pointer.lx += (this.pointer.x - this.pointer.lx) * 0.06;
        this.pointer.ly += (this.pointer.y - this.pointer.ly) * 0.06;

        // Nebula gradient — only update every 4th frame
        this.nebulaFrame++;
        if (this.nebulaFrame >= 4) {
            this.nebulaFrame = 0;
            const px = this.pointer.lx / W;
            const py = this.pointer.ly / H;

            const nebula1 = ctx.createRadialGradient(
                W * (0.3 + px * 0.1), H * (0.4 + py * 0.1), 0,
                W * 0.3, H * 0.4, W * 0.5
            );
            nebula1.addColorStop(0, 'rgba(96, 165, 250, 0.03)');
            nebula1.addColorStop(1, 'transparent');
            this._nebula1 = nebula1;

            const nebula2 = ctx.createRadialGradient(
                W * (0.7 - px * 0.1), H * (0.6 - py * 0.1), 0,
                W * 0.7, H * 0.6, W * 0.4
            );
            nebula2.addColorStop(0, 'rgba(139, 92, 246, 0.02)');
            nebula2.addColorStop(1, 'transparent');
            this._nebula2 = nebula2;
        }

        if (this._nebula1) {
            ctx.fillStyle = this._nebula1;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = this._nebula2;
            ctx.fillRect(0, 0, W, H);
        }

        // Stars — use squared distance (avoid Math.sqrt)
        const burstMultiplier = 1 + this.transitionBurst * 2;
        const plx = this.pointer.lx;
        const ply = this.pointer.ly;
        const GLOW_DIST_SQ = 14400; // 120 * 120

        for (const star of this.stars) {
            const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset);
            const alpha = star.baseAlpha + twinkle * 0.25;

            const dx = plx - star.x;
            const dy = ply - star.y;
            const distSq = dx * dx + dy * dy;
            const glowBoost = distSq < GLOW_DIST_SQ ? (1 - distSq / GLOW_DIST_SQ) * 0.5 : 0;

            const burstAlpha = this.transitionBurst > 0
                ? Math.min(1, alpha * burstMultiplier)
                : Math.min(1, alpha + glowBoost);

            const size = star.size * (1 + glowBoost * 0.5);
            const { r, g, b } = star.color;

            // Glow only for large stars near pointer (raised threshold)
            if (size > 1.8 && glowBoost > 0.15) {
                ctx.globalAlpha = burstAlpha * 0.2;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.beginPath();
                ctx.arc(star.x | 0, star.y | 0, size * 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = burstAlpha;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            ctx.arc(star.x | 0, star.y | 0, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shooting stars
        this.spawnShootingStar();

        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const ss = this.shootingStars[i];
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.life -= ss.decay;

            if (ss.life <= 0 || ss.x > W || ss.y > H) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = ss.life * 0.8;
            const grad = ctx.createLinearGradient(
                ss.x, ss.y,
                ss.x - ss.vx * ss.length / 4, ss.y - ss.vy * ss.length / 4
            );
            grad.addColorStop(0, 'rgba(245, 197, 66, 0.9)');
            grad.addColorStop(1, 'transparent');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(
                ss.x - ss.vx * ss.length / 4,
                ss.y - ss.vy * ss.length / 4
            );
            ctx.stroke();

            ctx.fillStyle = '#f5c542';
            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        if (this.transitionBurst > 0) {
            this.transitionBurst *= 0.92;
            if (this.transitionBurst < 0.01) this.transitionBurst = 0;
        }

        this.animId = requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.CanvasBg = new StellarAtmosphere();
});
