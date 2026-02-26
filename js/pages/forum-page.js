// Oişbiting — Forum Page
// Celestial DNA — Yıldız Meclisi (Gözlemcilerin fikir paylaştığı astronomik toplantı yeri)

const ForumPage = {
    currentTopic: null,
    currentPost: null,

    async render() {
        const container = document.createElement('div');
        container.className = 'forum-page page-enter';

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Yıldız Meclisi</h1>
                <p class="page-subtitle">Fikirlerini paylaş, meclise katıl</p>
            </div>

            <div id="forum-content">
                <div style="display: flex; justify-content: center; padding: var(--space-2xl);">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        await this.loadTopics(container);
        return container;
    },

    async loadTopics(container) {
        const content = container.querySelector('#forum-content');

        try {
            const topics = await DB.forum.getTopics();

            if (topics.length === 0) {
                content.innerHTML = `
                    <div style="min-height: 40vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-xl);">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1" style="margin-bottom: var(--space-md); opacity: 0.4;">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <circle cx="9" cy="10" r="1" fill="var(--text-muted)" opacity="0.3"/>
                            <circle cx="15" cy="10" r="1" fill="var(--text-muted)" opacity="0.3"/>
                        </svg>
                        <h3 style="font-family: var(--font-display); color: var(--text); margin-bottom: var(--space-xs);">Gökyüzü Sessiz</h3>
                        <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-lg);">Henüz konu açılmamış — başlıklar yönetici tarafından açılır</p>
                        <button class="btn btn-primary" id="new-suggestion">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                            Görüş / Öneri Gönder
                        </button>
                    </div>
                `;

                content.querySelector('#new-suggestion')?.addEventListener('click', () => {
                    this.showNewSuggestion(container);
                });
                return;
            }

            content.innerHTML = `
                <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-lg);">
                    <button class="btn btn-primary" id="new-suggestion" style="font-size: var(--text-sm);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Görüş / Öneri Gönder
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                    ${topics.map(topic => `
                        <div class="card forum-topic" data-topic-id="${topic.id}" style="padding: var(--space-md); cursor: pointer; transition: all 0.2s;">
                            <div style="display: flex; align-items: center; gap: var(--space-md);">
                                <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(96, 165, 250, 0.08); border-radius: var(--radius); flex-shrink: 0;">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="1.5">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="color: var(--text); font-weight: 500; margin-bottom: 2px;">${Helpers.escapeHtml(topic.title)}</div>
                                    <div style="display: flex; align-items: center; gap: var(--space-md); font-size: var(--text-xs); color: var(--text-muted);">
                                        <span>${Helpers.formatDate(topic.created_at)}</span>
                                        <span style="display: flex; align-items: center; gap: 4px;">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                            </svg>
                                            ${topic.forum_posts?.[0]?.count || 0} görüş
                                        </span>
                                    </div>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="flex-shrink: 0; opacity: 0.5;">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Konu tıklama
            content.querySelectorAll('.forum-topic').forEach(el => {
                el.addEventListener('click', () => {
                    const topicId = parseInt(el.dataset.topicId);
                    this.showTopic(container, topicId);
                });
            });

            content.querySelector('#new-suggestion')?.addEventListener('click', () => {
                this.showNewSuggestion(container);
            });

        } catch (error) {
            content.innerHTML = `
                <div style="min-height: 40vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-xl);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="1" style="margin-bottom: var(--space-md); opacity: 0.5;">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 8l8 8M16 8l-8 8" stroke-width="1.5"/>
                    </svg>
                    <h3 style="font-family: var(--font-display); color: var(--text); margin-bottom: var(--space-xs);">Kara Delik</h3>
                    <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-lg);">Meclis yüklenemedi — lütfen tekrar deneyin</p>
                    <button class="btn btn-ghost" id="retry-forum">Tekrar Dene</button>
                </div>
            `;
            content.querySelector('#retry-forum')?.addEventListener('click', () => {
                content.innerHTML = '<div style="display: flex; justify-content: center; padding: var(--space-2xl);"><div class="loading-spinner"></div></div>';
                this.loadTopics(container);
            });
        }
    },

    async showTopic(container, topicId) {
        const content = container.querySelector('#forum-content');
        content.innerHTML = '<div style="display: flex; justify-content: center; padding: var(--space-2xl);"><div class="loading-spinner"></div></div>';

        try {
            const topic = await DB.forum.getTopic(topicId);
            const posts = await DB.forum.getPosts(topicId);

            this.currentTopic = topic;

            content.innerHTML = `
                <button class="btn btn-ghost" id="back-to-topics" style="margin-bottom: var(--space-lg); font-size: var(--text-sm);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Meclise Dön
                </button>

                <!-- Konu Kartı -->
                <div class="card" style="padding: var(--space-lg); border-left: 4px solid var(--accent-1); margin-bottom: var(--space-lg);">
                    <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-xs);">${Helpers.escapeHtml(topic.title)}</h2>
                    <span style="font-size: var(--text-xs); color: var(--text-muted);">${Helpers.formatDate(topic.created_at)}</span>
                    ${topic.content ? `<p style="color: var(--text); margin-top: var(--space-md); line-height: 1.6;">${Helpers.escapeHtml(topic.content)}</p>` : ''}
                </div>

                <!-- Görüşler Başlığı -->
                <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">
                    Görüşler & Yorumlar (${posts.length})
                </h3>

                <!-- Gönderi Listesi -->
                <div id="posts-list" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    ${posts.length === 0
                        ? `<p style="color: var(--text-muted); text-align: center; padding: var(--space-xl); font-size: var(--text-sm);">
                            Henüz görüş yazılmamış. İlk sen yaz!
                           </p>`
                        : posts.map(post => this.renderPost(post)).join('')
                    }
                </div>

                <!-- Gönderi Yazma -->
                <div class="card" style="padding: var(--space-lg); margin-top: var(--space-xl);">
                    <h4 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">Görüşünüzü Yazın</h4>
                    <div style="margin-bottom: var(--space-sm);">
                        <input type="text" class="form-input" id="post-title" placeholder="Başlık (opsiyonel)">
                    </div>
                    <div style="margin-bottom: var(--space-md);">
                        <textarea class="form-input" id="post-content" placeholder="Görüşünüzü yazın..." rows="4" style="resize: vertical;"></textarea>
                    </div>
                    <button class="btn btn-primary" id="submit-post">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Gönder
                    </button>
                </div>
            `;

            // Geri butonu
            content.querySelector('#back-to-topics').addEventListener('click', () => {
                this.loadTopics(container);
            });

            // Gönderi gönder
            content.querySelector('#submit-post').addEventListener('click', () => {
                this.submitPost(container, topicId);
            });

            // Beğen/beğenme/yorum aksiyonları
            this.setupPostActions(content);

        } catch (error) {
            Toast.error('Konu yüklenemedi');
            this.loadTopics(container);
        }
    },

    renderPost(post) {
        return `
            <div class="card" data-post-id="${post.id}" style="padding: var(--space-md);">
                <!-- Yazar Bilgisi -->
                <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--canvas); flex-shrink: 0;">
                        ${Helpers.getInitials(post.users?.username || '?')}
                    </div>
                    <div>
                        <div style="color: var(--text); font-weight: 500; font-size: var(--text-sm);">${Helpers.escapeHtml(post.users?.username || 'Anonim')}</div>
                        <div style="color: var(--text-muted); font-size: var(--text-xs);">${Helpers.formatRelativeTime(post.created_at)}</div>
                    </div>
                </div>

                <!-- İçerik -->
                ${post.title ? `<h4 style="color: var(--text); font-weight: 600; margin-bottom: var(--space-xs);">${Helpers.escapeHtml(post.title)}</h4>` : ''}
                <p style="color: var(--text); font-size: var(--text-sm); line-height: 1.6; margin-bottom: var(--space-md);">${Helpers.escapeHtml(post.content)}</p>

                <!-- Aksiyon Butonları -->
                <div style="display: flex; align-items: center; gap: var(--space-md); padding-top: var(--space-sm); border-top: 1px solid rgba(96, 165, 250, 0.06);">
                    <button class="like-btn" data-post-id="${post.id}" style="display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: var(--text-sm); padding: 4px 8px; border-radius: var(--radius); transition: all 0.2s; font-family: var(--font-body);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="dislike-btn" data-post-id="${post.id}" style="display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: var(--text-sm); padding: 4px 8px; border-radius: var(--radius); transition: all 0.2s; font-family: var(--font-body);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                        </svg>
                        <span>${post.dislikes || 0}</span>
                    </button>
                    <button class="comment-btn" data-post-id="${post.id}" style="display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: var(--text-sm); padding: 4px 8px; border-radius: var(--radius); transition: all 0.2s; font-family: var(--font-body);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Yorum
                    </button>
                </div>

                <!-- Yorum Paneli (gizli) -->
                <div class="forum-comments" id="comments-${post.id}" style="display: none; margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid rgba(96, 165, 250, 0.06);">
                    <div style="display: flex; justify-content: center; padding: var(--space-md);">
                        <div class="loading-spinner" style="width: 20px; height: 20px;"></div>
                    </div>
                </div>
            </div>
        `;
    },

    setupPostActions(content) {
        // Beğen butonları
        content.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const postId = parseInt(btn.dataset.postId);
                try {
                    await DB.forum.likePost(postId);
                    const countEl = btn.querySelector('span');
                    countEl.textContent = parseInt(countEl.textContent) + 1;
                    btn.style.color = 'var(--success)';
                    if (navigator.vibrate) navigator.vibrate(5);
                } catch (error) {
                    Toast.error('İşlem başarısız');
                }
            });
        });

        // Beğenme butonları
        content.querySelectorAll('.dislike-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const postId = parseInt(btn.dataset.postId);
                try {
                    await DB.forum.dislikePost(postId);
                    const countEl = btn.querySelector('span');
                    countEl.textContent = parseInt(countEl.textContent) + 1;
                    btn.style.color = 'var(--error)';
                    if (navigator.vibrate) navigator.vibrate(5);
                } catch (error) {
                    Toast.error('İşlem başarısız');
                }
            });
        });

        // Yorum butonları
        content.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const postId = parseInt(btn.dataset.postId);
                const commentsEl = content.querySelector(`#comments-${postId}`);

                if (commentsEl.style.display === 'none') {
                    commentsEl.style.display = 'block';
                    await this.loadComments(commentsEl, postId);
                } else {
                    commentsEl.style.display = 'none';
                }
            });
        });
    },

    async loadComments(container, postId) {
        try {
            const comments = await DB.forum.getComments(postId);

            container.innerHTML = `
                ${comments.length === 0
                    ? '<p style="color: var(--text-muted); font-size: var(--text-sm); padding: var(--space-sm);">Henüz yorum yok</p>'
                    : `<div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-md);">
                        ${comments.map(c => `
                            <div style="padding: var(--space-sm); background: rgba(96, 165, 250, 0.03); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: 4px;">
                                    <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; color: var(--canvas); flex-shrink: 0;">
                                        ${Helpers.getInitials(c.users?.username || '?')}
                                    </div>
                                    <span style="font-size: var(--text-xs); font-weight: 500; color: var(--text);">${Helpers.escapeHtml(c.users?.username || 'Anonim')}</span>
                                    <span style="font-size: var(--text-xs); color: var(--text-muted);">${Helpers.formatRelativeTime(c.created_at)}</span>
                                </div>
                                <p style="font-size: var(--text-sm); color: var(--text); line-height: 1.5; padding-left: 32px;">${Helpers.escapeHtml(c.content)}</p>
                            </div>
                        `).join('')}
                       </div>`
                }

                <div style="display: flex; gap: var(--space-xs);">
                    <input type="text" class="form-input" placeholder="Yorum yaz..." id="comment-input-${postId}" style="flex: 1; font-size: var(--text-sm);">
                    <button class="btn btn-primary comment-submit" data-post-id="${postId}" style="font-size: var(--text-sm); padding: var(--space-xs) var(--space-md); white-space: nowrap;">Gönder</button>
                </div>
            `;

            container.querySelector('.comment-submit')?.addEventListener('click', async () => {
                const input = container.querySelector(`#comment-input-${postId}`);
                const text = input.value.trim();
                if (!text) return;

                try {
                    await DB.forum.addComment(Auth.user.id, postId, text);
                    input.value = '';
                    Toast.success('Yorumunuz onaya sunuldu');
                    if (navigator.vibrate) navigator.vibrate(5);
                } catch (error) {
                    Toast.error('Yorum gönderilemedi');
                }
            });

            // Enter tuşu ile gönder
            container.querySelector(`#comment-input-${postId}`)?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    container.querySelector('.comment-submit')?.click();
                }
            });

        } catch (error) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: var(--text-sm); padding: var(--space-sm);">Yorumlar yüklenemedi</p>';
        }
    },

    async submitPost(container, topicId) {
        const title = container.querySelector('#post-title').value.trim();
        const postContent = container.querySelector('#post-content').value.trim();

        if (!postContent) {
            Toast.warning('Lütfen görüşünüzü yazın');
            return;
        }

        const submitBtn = container.querySelector('#submit-post');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner" style="width: 16px; height: 16px;"></span> Gönderiliyor...';

        try {
            await DB.forum.createPost(Auth.user.id, topicId, title, postContent);
            Toast.success('Görüşünüz onaya sunuldu');
            container.querySelector('#post-title').value = '';
            container.querySelector('#post-content').value = '';
            if (navigator.vibrate) navigator.vibrate(8);
        } catch (error) {
            Toast.error('Gönderilemedi');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Gönder
            `;
        }
    },

    showNewSuggestion(container) {
        Modal.create({
            title: 'Görüş / Öneri Gönder',
            content: `
                <div style="margin-bottom: var(--space-md);">
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Başlık</label>
                    <input type="text" class="form-input" id="suggestion-title" placeholder="Önerinizin başlığı">
                </div>
                <div>
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">İçerik</label>
                    <textarea class="form-input" id="suggestion-content" placeholder="Görüşünüzü detaylı yazın..." rows="4" style="resize: vertical;"></textarea>
                </div>
            `,
            actions: [
                {
                    id: 'cancel',
                    label: 'İptal',
                    class: 'btn-ghost',
                    handler: (m) => Modal.close(m)
                },
                {
                    id: 'submit',
                    label: 'Gönder',
                    class: 'btn-primary',
                    handler: async (m) => {
                        const title = m.querySelector('#suggestion-title').value.trim();
                        const suggestionContent = m.querySelector('#suggestion-content').value.trim();

                        if (!title || !suggestionContent) {
                            Toast.warning('Tüm alanları doldurun');
                            return;
                        }

                        try {
                            await DB.forum.createPost(Auth.user.id, null, title, suggestionContent);
                            Toast.success('Öneriniz onaya sunuldu');
                            Modal.close(m);
                            if (navigator.vibrate) navigator.vibrate(8);
                        } catch (error) {
                            Toast.error('Gönderilemedi');
                        }
                    }
                }
            ]
        });
    },

    cleanup() {
        this.currentTopic = null;
        this.currentPost = null;
    }
};

window.ForumPage = ForumPage;
