// Oişbiting — Modal System
// Celestial DNA — Nebula blur backdrop, yıldız parıltısı giriş

const Modal = {
    confirmModal: null,
    confirmResolve: null,

    init() {
        this.confirmModal = document.getElementById('confirm-modal');
        if (!this.confirmModal) return;

        this.confirmModal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeConfirm(false);
        });

        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.closeConfirm(false);
        });

        document.getElementById('confirm-ok').addEventListener('click', () => {
            this.closeConfirm(true);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.confirmModal.classList.contains('hidden')) {
                this.closeConfirm(false);
            }
        });
    },

    confirm(message, title = 'Onay', okText = 'Tamam', cancelText = 'İptal') {
        return new Promise((resolve) => {
            this.confirmResolve = resolve;
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            document.getElementById('confirm-ok').textContent = okText;
            document.getElementById('confirm-cancel').textContent = cancelText;
            this.confirmModal.classList.remove('hidden');
            document.getElementById('confirm-ok').focus();
        });
    },

    closeConfirm(result) {
        this.confirmModal.classList.add('hidden');
        if (this.confirmResolve) {
            this.confirmResolve(result);
            this.confirmResolve = null;
        }
    },

    create(options) {
        const {
            title = '',
            content = '',
            actions = [],
            closable = true,
            size = 'medium'
        } = options;

        const modal = document.createElement('div');
        modal.className = 'modal custom-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content modal-${size}">
                ${title ? `
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        ${closable ? `
                            <button class="modal-close" aria-label="Kapat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="modal-body">${content}</div>
                ${actions.length > 0 ? `
                    <div class="modal-actions">
                        ${actions.map(a => `
                            <button class="btn ${a.class || 'btn-ghost'}" data-action="${a.id}">${a.label}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        if (closable) {
            modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
                e.stopPropagation();
                this.close(modal);
            });
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.addEventListener('click', () => this.close(modal));
        }

        actions.forEach(action => {
            const btn = modal.querySelector(`[data-action="${action.id}"]`);
            if (btn && action.handler) btn.addEventListener('click', () => action.handler(modal));
        });

        document.body.appendChild(modal);
        return modal;
    },

    close(modal) {
        if (!modal) return;
        const content = modal.querySelector('.modal-content');
        if (content) content.classList.add('animate-scale-out');
        setTimeout(() => {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 250);
    },

    showLoading(message = 'Harita genişliyor...') {
        return this.create({
            content: `
                <div style="text-align: center; padding: var(--space-xl);">
                    <div class="loading-spinner" style="margin: 0 auto var(--space-md);"></div>
                    <p style="color: var(--text-secondary);">${message}</p>
                </div>
            `,
            closable: false,
            size: 'small'
        });
    },

    alert(message, title = 'Bilgi') {
        return new Promise((resolve) => {
            this.create({
                title,
                content: `<p style="color: var(--text-secondary);">${message}</p>`,
                actions: [{
                    id: 'ok', label: 'Tamam', class: 'btn-primary',
                    handler: (modal) => { this.close(modal); resolve(); }
                }],
                size: 'small'
            });
        });
    },

    prompt(message, title = 'Giriş', defaultValue = '') {
        return new Promise((resolve) => {
            const modal = this.create({
                title,
                content: `
                    <p style="margin-bottom: var(--space-md); color: var(--text-secondary);">${message}</p>
                    <input type="text" class="form-input prompt-input" value="${Helpers.escapeHtml(defaultValue)}">
                `,
                actions: [
                    { id: 'cancel', label: 'İptal', class: 'btn-ghost', handler: (m) => { this.close(m); resolve(null); } },
                    { id: 'ok', label: 'Tamam', class: 'btn-primary', handler: (m) => { this.close(m); resolve(m.querySelector('.prompt-input').value); } }
                ],
                size: 'small'
            });

            const input = modal.querySelector('.prompt-input');
            if (input) {
                input.focus();
                input.select();
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') { this.close(modal); resolve(input.value); }
                });
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Modal.init());
window.Modal = Modal;
