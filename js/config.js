// Oişbiting - Configuration

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://qcirfsxvdotvylvsphpj.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjaXJmc3h2ZG90dnlsdnNwaHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDIxMjgsImV4cCI6MjA4NTE3ODEyOH0.EtvN0mEvA9-Rcu11PuqcsGuPtikUi60jD5Cu4wIUzj4',

    // App Settings
    APP_NAME: 'Oişbiting',
    APP_VERSION: '1.0.0',

    // Flashcard Settings
    WORDS_PER_LEVEL: 50,
    CARD_FLIP_DURATION: 400,
    SWIPE_THRESHOLD: 100,

    // Test Settings
    TEST_QUESTION_TIME: 15, // seconds
    COMPETITION_QUESTION_TIME: 15, // seconds

    // Points System
    POINTS: {
        WORD_LEARNED: 10,
        TEST_CORRECT: 10,
        TEST_INCORRECT: -5,
        TRANSLATION_EASY: 10,
        TRANSLATION_MEDIUM: 15,
        TRANSLATION_HARD: 20,
        COMPETITION_1ST: 10,
        COMPETITION_2ND: 8,
        COMPETITION_3RD: 6,
        COMPETITION_4TH: 4,
        COMPETITION_OTHER: 2
    },

    // Spaced Repetition Intervals (days)
    SPACED_REPETITION: [1, 3, 7, 14, 30, 60],

    // Session Settings
    IDLE_TIMEOUT: 5 * 60 * 1000, // 5 minutes in ms
    ROOM_TIMEOUT: 60 * 1000, // 1 minute in ms
    ROOM_TIMEOUT_WARNING: 10 * 1000, // 10 seconds in ms

    // Validation
    USERNAME_MIN: 3,
    USERNAME_MAX: 20,
    PASSWORD_MIN: 8,
    USERNAME_CHANGE_DAYS: 30,

    // File Upload
    MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png'],

    // Room Settings
    MIN_PARTICIPANTS: 2,
    MAX_PARTICIPANTS: 10,
    ROOM_CODE_LENGTH: 5,

    // Leaderboard
    LEADERBOARD_LIMIT: 10,

    // Forum
    COMMENTS_PER_PAGE: 20,

    // Toast Settings
    TOAST_DURATION: 4000, // ms

    // Local Storage Keys
    STORAGE_KEYS: {
        THEME: 'vocabmaster_theme',
        CARD_SIZE: 'vocabmaster_card_size',
        ACCENT_COLOR: 'vocabmaster_accent',
        SOUND_EFFECTS: 'vocabmaster_sound',
        SESSION_ID: 'vocabmaster_session',
        STUDY_START_TIME: 'vocabmaster_study_start'
    },

    // Routes
    ROUTES: {
        HOME: 'home',
        FLASHCARDS: 'flashcards',
        STUDY: 'study',
        COMPETITION: 'competition',
        REPORTS: 'reports',
        FORUM: 'forum',
        PROFILE: 'profile',
        ADMIN: 'admin',
        AUTH: 'auth'
    },

    // Badges
    BADGES: {
        // Word Badges
        BEGINNER: { id: 'beginner', name: 'Çaylak', icon: '🌱', condition: 'words', value: 1 },
        STUDENT: { id: 'student', name: 'Öğrenci', icon: '📚', condition: 'words', value: 100 },
        EXPERT: { id: 'expert', name: 'Uzman', icon: '🎓', condition: 'words', value: 500 },
        MASTER: { id: 'master', name: 'Üstat', icon: '🏆', condition: 'words', value: 1000 },

        // Streak Badges
        WARMING_UP: { id: 'warming_up', name: 'Isındım', icon: '🔥', condition: 'streak', value: 3 },
        ON_FIRE: { id: 'on_fire', name: 'Yanıyorum', icon: '🔥🔥', condition: 'streak', value: 7 },
        BLAZING: { id: 'blazing', name: 'Alev Alev', icon: '🔥🔥🔥', condition: 'streak', value: 30 },
        SUN: { id: 'sun', name: 'Güneş', icon: '☀️', condition: 'streak', value: 100 },

        // Test Badges
        ACCURATE: { id: 'accurate', name: 'Doğrucu', icon: '✅', condition: 'perfect_test', value: 1 },
        SHARPSHOOTER: { id: 'sharpshooter', name: 'Keskin Nişancı', icon: '🎯', condition: 'correct_streak', value: 10 },
        PERFECTIONIST: { id: 'perfectionist', name: 'Mükemmelci', icon: '💯', condition: 'perfect_tests', value: 10 },

        // Competition Badges
        PARTICIPANT: { id: 'participant', name: 'Katılımcı', icon: '🤝', condition: 'competitions', value: 1 },
        CHAMPION: { id: 'champion', name: 'Şampiyon', icon: '🥇', condition: 'competition_wins', value: 1 },
        KING: { id: 'king', name: 'Kral', icon: '👑', condition: 'competition_wins', value: 10 }
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.POINTS);
Object.freeze(CONFIG.SPACED_REPETITION);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.ROUTES);
Object.freeze(CONFIG.BADGES);

// Programa özel rozet SVG ikonları (frozen değil, dinamik render için)
const BADGE_ICONS = {
    // Çaylak — küçük açık kitap
    beginner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 19 Q2 9, 7 8 L11.5 7.5 L11.5 18 Q8 17.5, 5 18 Q3.5 18.5, 2 19Z"/><path d="M22 19 Q22 9, 17 8 L12.5 7.5 L12.5 18 Q16 17.5, 19 18 Q20.5 18.5, 22 19Z"/><line x1="2" y1="19" x2="22" y2="19" stroke-width="1"/></svg>',
    // Öğrenci — kitap yığını (3 kitap)
    student: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="14" width="16" height="4" rx="1"/><rect x="5" y="10" width="14" height="4" rx="1"/><rect x="6" y="6" width="12" height="4" rx="1"/></svg>',
    // Uzman — mezuniyet şapkası
    expert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8 12 14 2 8 12 2"/><path d="M6 11v5c0 2 3 4 6 4s6-2 6-4v-5"/><line x1="22" y1="8" x2="22" y2="14"/></svg>',
    // Üstat — parşömen rulosu
    master: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v3"/><path d="M14 2v5h5"/><path d="M14 2l5 5v13a2 2 0 0 1-2 2H8"/><path d="M4 7a2 2 0 0 0 0 4v8a2 2 0 0 0 4 0V11a2 2 0 0 0 0-4z"/></svg>',
    // Isındım — küçük alev
    warming_up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C6.48 22 2 17.52 2 12c0-2.5 1-4.85 2.75-6.61C6.5 3.63 9.5 3 12 3c0 2 .5 3.5 2 4.5-1-3 1-5 3-6 0 4 2 6 2 9 0 5.52-4.48 10-7 12z"/></svg>',
    // Yanıyorum — çift alev
    on_fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C6.48 22 2 17.52 2 12c0-2.5 1-4.85 2.75-6.61C6.5 3.63 9.5 3 12 3c0 2 .5 3.5 2 4.5-1-3 1-5 3-6 0 4 2 6 2 9 0 5.52-4.48 10-7 12z"/><path d="M12 17c-1.66 0-3-1.34-3-3 0-1 .5-1.85 1.25-2.36C11 10.64 11.5 10 12 10c0 .75.25 1.25.75 1.5-.5-1 .25-2 1.25-2 0 1.5.75 2.25.75 3.5 0 2.21-1.34 4-2.75 4z"/></svg>',
    // Alev Alev — üçlü alev (büyük)
    blazing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C5 22 2 16 2 12c0-3 1.5-5.5 4-7 0 2.5 1 4 3 5-1.5-4 1-6 4-8 0 5 3 7.5 3 11 0 4.5-2 9-4 9z"/><path d="M7 22c-1.66 0-3-1.34-3-3 0-2 2-3.5 2-5.5.5 1 2 2 2 3.5S7 20 7 22z"/><path d="M17 22c1.66 0 3-1.34 3-3 0-2-2-3.5-2-5.5-.5 1-2 2-2 3.5S17 20 17 22z"/></svg>',
    // Güneş — ışınlı güneş
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    // Doğrucu — sayfada tik işareti
    accurate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><polyline points="9 12 11 14 15 10"/><line x1="8" y1="7" x2="16" y2="7"/></svg>',
    // Keskin Nişancı — ok ve hedef
    sharpshooter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="22" y1="2" x2="15" y2="9"/><polyline points="19 2 22 2 22 5"/></svg>',
    // Mükemmelci — balmumu mühür
    perfectionist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 5.4L20 9.2l-4 4.1.9 5.7L12 16.4l-4.9 2.6.9-5.7-4-4.1 5.6-1.8z"/><circle cx="12" cy="12" r="3"/></svg>',
    // Katılımcı — çapraz tüy kalemler
    participant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3C17 3 14 5 11 8 8.5 11 7 15 6.5 17"/><path d="M17 3C16 5 15 7 13.5 8.5"/><path d="M7 3C7 3 10 5 13 8 15.5 11 17 15 17.5 17"/><path d="M7 3C8 5 9 7 10.5 8.5"/><line x1="5" y1="20" x2="19" y2="20"/></svg>',
    // Şampiyon — kupa
    champion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    // Kral — taç
    king: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18 L5 8 L9 14 L12 4 L15 14 L19 8 L22 18 Z"/><line x1="2" y1="22" x2="22" y2="22"/><line x1="2" y1="18" x2="22" y2="18"/></svg>'
};
window.BADGE_ICONS = BADGE_ICONS;
