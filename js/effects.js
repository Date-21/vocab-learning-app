// ============================================
// Oisbiting — Imza Interaktif Efektler
// Tier 2: Sayfa Giris Koreografisi (GSAP)
// Tier 3: Interaktif Sihir (pointer/touch)
// ============================================
// Kart 3D Tilt: Lerped pointer + sine-wave wobble
// Card Shine: Radial altin gradient, fare takibi
// Sayfa Giris: Baslik → Kartlar → Butonlar (stagger)
// Basari Kutlamasi: 8 altin parcacik + Canvas flash
// ============================================

var Effects = {
    hasGSAP: typeof gsap !== 'undefined',

    init: function () {
        this.setupCardTilt();
        this.setupCardShine();
    },

    // ==============================
    // TIER 2: SAYFA GIRIS KOREOGRAFISI
    // Baslik → Kartlar → Flashcard → Butonlar
    // ==============================

    animatePageEnter: function (pageElement) {
        if (!this.hasGSAP || !pageElement) return;

        // Basliklar
        var headers = pageElement.querySelectorAll('.page-header, .page-title, .welcome-section');
        // Kartlar ve listeler
        var cards = pageElement.querySelectorAll('.level-card, .study-option-card, .competition-option, .quick-action, .stat-card, .forum-topic, .card, .goal-item, .list-item');
        // Flashcard
        var flashcard = pageElement.querySelector('.flashcard-container');
        // Butonlar
        var buttons = pageElement.querySelectorAll('.btn-primary, .btn-secondary, .modal-actions .btn');

        // Timeline — cikis-once-giris prensibi
        var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        // 1. Baslik girisi
        if (headers.length > 0) {
            tl.from(headers, {
                y: 25,
                opacity: 0,
                duration: 0.45,
                stagger: 0.06
            }, 0);
        }

        // 2. Kart/liste girisi — stagger 60ms
        if (cards.length > 0) {
            tl.from(cards, {
                y: 20,
                x: function (index) {
                    // Sag-sol degisimli giris
                    return index % 2 === 0 ? -30 : 30;
                },
                opacity: 0,
                duration: 0.45,
                stagger: 0.06
            }, 0.1);
        }

        // 3. Flashcard — 3D kitap sayfasi cevirme
        if (flashcard) {
            tl.from(flashcard, {
                rotateY: -15,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
                transformPerspective: 1200
            }, 0.15);
        }

        // 4. Butonlar
        if (buttons.length > 0) {
            tl.from(buttons, {
                y: 12,
                opacity: 0,
                duration: 0.3,
                stagger: 0.04
            }, 0.25);
        }

        return tl;
    },

    // ==============================
    // TIER 2: SAYFA CIKIS KOREOGRAFISI
    // Ters sirada — butonlar → kartlar → baslik
    // ==============================

    animatePageExit: function (pageElement) {
        if (!this.hasGSAP || !pageElement) {
            return Promise.resolve();
        }

        var headers = pageElement.querySelectorAll('.page-header, .page-title, .welcome-section');
        var cards = pageElement.querySelectorAll('.level-card, .study-option-card, .competition-option, .quick-action, .stat-card, .forum-topic, .card, .goal-item, .list-item');
        var buttons = pageElement.querySelectorAll('.btn-primary, .btn-secondary');

        return new Promise(function (resolve) {
            var tl = gsap.timeline({
                defaults: { ease: 'power2.in' },
                onComplete: resolve
            });

            // 1. Butonlar cikis
            if (buttons.length > 0) {
                tl.to(buttons, {
                    y: 10,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.03
                }, 0);
            }

            // 2. Kartlar cikis
            if (cards.length > 0) {
                tl.to(cards, {
                    y: -15,
                    opacity: 0,
                    scale: 0.96,
                    duration: 0.3,
                    stagger: 0.03
                }, 0.05);
            }

            // 3. Baslik cikis
            if (headers.length > 0) {
                tl.to(headers, {
                    y: -15,
                    opacity: 0,
                    scale: 0.98,
                    duration: 0.25
                }, 0.1);
            }

            // 4. Sayfa fade
            tl.to(pageElement, {
                opacity: 0,
                duration: 0.15
            }, 0.2);
        });
    },

    // ==============================
    // TIER 3: 3D KART TILT
    // Lerped pointer + sine-wave micro-wobble
    // maxAngle: 8 derece, perspective: 1200px
    // ==============================

    setupCardTilt: function () {
        var pointer = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            lx: window.innerWidth / 2,
            ly: window.innerHeight / 2
        };

        document.addEventListener('pointermove', function (e) {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        });

        var maxAngle = 8;

        function updateTilt() {
            requestAnimationFrame(updateTilt);

            // Pointer lerp — ipeksi yumusaklik
            pointer.lx += (pointer.x - pointer.lx) * 0.08;
            pointer.ly += (pointer.y - pointer.ly) * 0.08;

            var cards = document.querySelectorAll('.flashcard-container .flashcard:not(.flipped)');
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                var rect = card.getBoundingClientRect();
                var centerX = rect.left + rect.width / 2;
                var centerY = rect.top + rect.height / 2;
                var mouseX = pointer.lx - centerX;
                var mouseY = pointer.ly - centerY;

                var distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
                var maxDist = Math.max(rect.width, rect.height) * 1.5;

                if (distance < maxDist) {
                    var factor = 1 - (distance / maxDist);
                    var tiltX = (mouseY / maxDist) * -maxAngle * factor;
                    var tiltY = (mouseX / maxDist) * maxAngle * factor;

                    // Sine-wave micro-wobble — yasayan his
                    var time = performance.now() * 0.001;
                    var wobbleX = Math.sin(time * 1.5) * 0.3 * factor;
                    var wobbleY = Math.cos(time * 1.2) * 0.3 * factor;

                    card.style.transform = 'perspective(1200px) rotateX(' + (tiltX + wobbleX) + 'deg) rotateY(' + (tiltY + wobbleY) + 'deg)';
                } else {
                    card.style.transform = '';
                }
            }
        }

        updateTilt();

        // Mouse cikarinca sifirla
        document.addEventListener('mouseleave', function () {
            var cards = document.querySelectorAll('.flashcard-container .flashcard');
            for (var i = 0; i < cards.length; i++) {
                cards[i].style.transform = '';
            }
        });
    },

    // ==============================
    // TIER 3: ISIK YANSIMASI (SHINE)
    // Radial altin gradient, fare pozisyonunu takip eder
    // ==============================

    setupCardShine: function () {
        var shineSelectors = [
            '.level-card',
            '.study-option-card',
            '.competition-option',
            '.quick-action',
            '.stat-card',
            '.forum-topic'
        ];

        function injectShine() {
            for (var s = 0; s < shineSelectors.length; s++) {
                var els = document.querySelectorAll(shineSelectors[s]);
                for (var i = 0; i < els.length; i++) {
                    var card = els[i];
                    if (card.querySelector('.card-shine')) continue;

                    var shine = document.createElement('div');
                    shine.className = 'card-shine';
                    card.appendChild(shine);

                    // Closure icin IIFE
                    (function (c, sh) {
                        c.addEventListener('mousemove', function (e) {
                            var rect = c.getBoundingClientRect();
                            var x = ((e.clientX - rect.left) / rect.width) * 100;
                            var y = ((e.clientY - rect.top) / rect.height) * 100;
                            sh.style.setProperty('--shine-x', x + '%');
                            sh.style.setProperty('--shine-y', y + '%');
                            sh.style.opacity = '1';
                        });

                        c.addEventListener('mouseleave', function () {
                            sh.style.opacity = '0';
                        });
                    })(card, shine);
                }
            }
        }

        // Yeni icerik gozlemcisi
        var observer = new MutationObserver(function () {
            requestAnimationFrame(injectShine);
        });

        var mainContent = document.getElementById('main-content');
        if (mainContent) {
            observer.observe(mainContent, {
                childList: true,
                subtree: true
            });
        }

        injectShine();
    },

    // ==============================
    // TIER 3: GELISTIRILMIS FLASHCARD FLIP
    // Kagit katlama fizigi — GSAP ile
    // ==============================

    enhanceFlip: function (flashcardEl) {
        if (!this.hasGSAP || !flashcardEl) return;

        flashcardEl.addEventListener('click', function (e) {
            if (e.target.closest('.flashcard-sound') || e.target.closest('.flashcard-btn')) return;

            var isFlipped = flashcardEl.classList.contains('flipped');

            if (!isFlipped) {
                gsap.to(flashcardEl, {
                    rotateY: 180,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onStart: function () {
                        flashcardEl.classList.add('flipped');
                    }
                });
            } else {
                gsap.to(flashcardEl, {
                    rotateY: 0,
                    duration: 0.45,
                    ease: 'power2.inOut',
                    onStart: function () {
                        flashcardEl.classList.remove('flipped');
                    }
                });
            }

            // Haptic geri bildirim
            if (window.Haptics) window.Haptics.cardFlip();
        });
    },

    // ==============================
    // MUHUR DAMGA PUAN POPUP
    // Anticipation → stamp → settle → float away
    // ==============================

    enhancePointsPopup: function (element, amount) {
        if (!this.hasGSAP || !element) return;

        gsap.fromTo(element, {
            scale: 2.5,
            rotation: -15,
            opacity: 0,
            y: 0
        }, {
            scale: 1,
            rotation: 0,
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'back.out(2)',
            onComplete: function () {
                gsap.to(element, {
                    y: amount > 0 ? -40 : 20,
                    opacity: 0,
                    duration: 0.4,
                    delay: 0.3,
                    ease: 'power2.in',
                    onComplete: function () {
                        element.remove();
                    }
                });
            }
        });
    },

    // ==============================
    // BASARI KUTLAMASI
    // 8 altin parcacik patlamasi + Canvas flash
    // ==============================

    celebrateSuccess: function (targetEl) {
        if (!this.hasGSAP) return;

        // Element nabzi
        if (targetEl) {
            gsap.to(targetEl, {
                scale: 1.05,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out'
            });
        }

        // Altin parcacik patlamasi
        this.spawnGoldParticles(targetEl);

        // Canvas mum isigi flash
        if (window.CanvasBg && window.CanvasBg.flashGlow) {
            window.CanvasBg.flashGlow();
        }

        // Haptic geri bildirim
        if (window.Haptics) window.Haptics.success();
    },

    // 8 altin parcacik — kutlama efekti
    spawnGoldParticles: function (originEl) {
        var rect = originEl ? originEl.getBoundingClientRect() : {
            left: window.innerWidth / 2,
            top: window.innerHeight / 2,
            width: 0,
            height: 0
        };
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;

        var colors = ['#c9a84c', '#e8d48b', '#8b6914', '#d4af37', '#f0d060'];

        for (var i = 0; i < 8; i++) {
            var particle = document.createElement('div');
            particle.style.cssText =
                'position:fixed;width:6px;height:6px;border-radius:50%;' +
                'background:' + colors[i % colors.length] + ';' +
                'left:' + cx + 'px;top:' + cy + 'px;' +
                'pointer-events:none;z-index:10000;';
            document.body.appendChild(particle);

            var angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            var dist = 40 + Math.random() * 60;
            var tx = Math.cos(angle) * dist;
            var ty = Math.sin(angle) * dist - 20;

            gsap.to(particle, {
                x: tx,
                y: ty,
                scale: 0,
                opacity: 0,
                duration: 0.6 + Math.random() * 0.3,
                ease: 'power2.out',
                onComplete: (function (p) {
                    return function () { p.remove(); };
                })(particle)
            });
        }
    }
};

// Otomatik baslat
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        Effects.init();
    }, 100);
});

window.Effects = Effects;
