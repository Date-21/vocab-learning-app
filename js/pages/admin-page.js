// Oişbiting — Admin Page
// Celestial DNA — Kontrol Merkezi (Mission Control)

const AdminPage = {
    currentSection: 'dashboard',
    uploadedData: null,
    columnHeaders: [],

    async render() {
        const container = document.createElement('div');
        container.className = 'admin-page page-enter';

        // Yetki kontrolü
        if (!Auth.isAdmin) {
            container.innerHTML = `
                <div style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-xl);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom: var(--space-md); opacity: 0.5;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <h3 style="font-family: var(--font-display); color: var(--text); margin-bottom: var(--space-sm);">Erişim Engellendi</h3>
                    <p style="color: var(--text-muted); margin-bottom: var(--space-lg);">Bu bölgeye erişim yetkiniz yok</p>
                    <button class="btn btn-primary" onclick="Router.navigate('home')">Gözlemevine Dön</button>
                </div>
            `;
            return container;
        }

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Kontrol Merkezi</h1>
                <button class="btn btn-ghost" onclick="Router.navigate('profile')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Geri
                </button>
            </div>

            <div class="admin-nav" style="display: flex; gap: var(--space-xs); overflow-x: auto; padding-bottom: var(--space-sm); margin-bottom: var(--space-lg); -webkit-overflow-scrolling: touch;">
                <button class="admin-nav-item active" data-section="dashboard" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: rgba(245, 197, 66, 0.1); color: var(--accent-1); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Dashboard</button>
                <button class="admin-nav-item" data-section="words" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Kelimeler</button>
                <button class="admin-nav-item" data-section="sentences" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Cümleler</button>
                <button class="admin-nav-item" data-section="images" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Görseller</button>
                <button class="admin-nav-item" data-section="users" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Kullanıcılar</button>
                <button class="admin-nav-item" data-section="forum" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Forum</button>
                <button class="admin-nav-item" data-section="messages" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Mesajlar</button>
                <button class="admin-nav-item" data-section="settings" style="padding: var(--space-xs) var(--space-md); border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); font-size: var(--text-sm); white-space: nowrap; cursor: pointer; font-family: var(--font-body); transition: all 0.2s;">Ayarlar</button>
            </div>

            <div id="admin-content"></div>
        `;

        // Nav event listeners
        container.querySelectorAll('.admin-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.admin-nav-item').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-muted)';
                    b.style.borderColor = 'transparent';
                });
                btn.classList.add('active');
                btn.style.background = 'rgba(245, 197, 66, 0.1)';
                btn.style.color = 'var(--accent-1)';
                this.currentSection = btn.dataset.section;
                this.loadSection(container);
            });
        });

        await this.loadSection(container);
        return container;
    },

    async loadSection(container) {
        const content = container.querySelector('#admin-content');
        content.innerHTML = `
            <div style="display: flex; justify-content: center; padding: var(--space-2xl);">
                <div class="loading-spinner"></div>
            </div>
        `;

        switch (this.currentSection) {
            case 'dashboard': await this.renderDashboard(content); break;
            case 'words': this.renderWords(content); break;
            case 'sentences': this.renderSentences(content); break;
            case 'images': await this.renderImages(content); break;
            case 'users': await this.renderUsers(content); break;
            case 'forum': await this.renderForum(content); break;
            case 'messages': this.renderMessages(content); break;
            case 'settings': this.renderSettings(content); break;
        }
    },

    // ==========================================
    // DASHBOARD
    // ==========================================
    async renderDashboard(content) {
        try {
            const stats = await DB.admin.getStats();
            content.innerHTML = `
                <div style="margin-bottom: var(--space-lg);">
                    <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-lg);">Genel Bakış</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--space-md);">
                        <div class="card" style="padding: var(--space-md); text-align: center;">
                            <div style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Gözlemciler</div>
                            <div style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--accent-2);">${stats.totalUsers}</div>
                        </div>
                        <div class="card" style="padding: var(--space-md); text-align: center;">
                            <div style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Aktif (7 gün)</div>
                            <div style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--success);">${stats.activeUsers}</div>
                        </div>
                        <div class="card" style="padding: var(--space-md); text-align: center;">
                            <div style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Yıldızlar</div>
                            <div style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--accent-1);">${stats.totalWords}</div>
                        </div>
                        <div class="card" style="padding: var(--space-md); text-align: center;">
                            <div style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Takımyıldızlar</div>
                            <div style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--text);">${stats.totalLevels}</div>
                        </div>
                        <div class="card" style="padding: var(--space-md); text-align: center;">
                            <div style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Çeviri Cümleleri</div>
                            <div style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--text);">${stats.totalSentences}</div>
                        </div>
                        <div class="card" style="padding: var(--space-md); text-align: center;">
                            <div style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Bekleyen İçerik</div>
                            <div style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--warning);">${stats.pendingPosts + stats.pendingComments}</div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            content.innerHTML = '<p style="text-align: center; color: var(--error); padding: var(--space-xl);">Dashboard yüklenemedi</p>';
        }
    },

    // ==========================================
    // WORDS SECTION — Yıldız Kataloğu
    // ==========================================
    renderWords(content) {
        content.innerHTML = `
            <div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-lg);">Yıldız Kataloğu</h2>

                <div class="card" id="word-upload-area" style="padding: var(--space-xl); text-align: center; cursor: pointer; border: 2px dashed rgba(96, 165, 250, 0.2); transition: all 0.3s;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="1.5" style="margin-bottom: var(--space-sm);">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p style="color: var(--text); font-size: var(--text-base); margin-bottom: var(--space-xs);">Dosyanızı sürükleyin veya tıklayın</p>
                    <p style="color: var(--text-muted); font-size: var(--text-sm);">Excel, CSV, Google Sheets — .xlsx, .xls, .csv, .ods</p>
                    <input type="file" id="word-file-input" accept=".csv,.xlsx,.xls,.ods" style="display: none;">
                </div>

                <div id="column-mapping-section" class="hidden" style="margin-top: var(--space-lg);"></div>
                <div id="word-preview" class="hidden" style="margin-top: var(--space-lg);"></div>

                <div style="margin-top: var(--space-xl);">
                    <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">Mevcut Takımyıldızlar</h3>
                    <div id="word-list">
                        <div style="display: flex; justify-content: center; padding: var(--space-lg);">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const uploadArea = content.querySelector('#word-upload-area');
        const fileInput = content.querySelector('#word-file-input');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent-1)';
            uploadArea.style.background = 'rgba(245, 197, 66, 0.05)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'rgba(96, 165, 250, 0.2)';
            uploadArea.style.background = '';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(96, 165, 250, 0.2)';
            uploadArea.style.background = '';
            if (e.dataTransfer.files.length) this.handleWordFile(content, e.dataTransfer.files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleWordFile(content, e.target.files[0]);
        });

        this.loadWordList(content);
    },

    async handleWordFile(content, file) {
        const mappingSection = content.querySelector('#column-mapping-section');
        mappingSection.innerHTML = '<div style="display: flex; justify-content: center; padding: var(--space-lg);"><div class="loading-spinner"></div></div>';
        mappingSection.classList.remove('hidden');

        try {
            const { headers, data } = await this.parseFileWithHeaders(file);

            if (data.length === 0) {
                Toast.error('Dosyada veri bulunamadı');
                mappingSection.classList.add('hidden');
                return;
            }

            this.uploadedData = data;
            this.columnHeaders = headers;
            this.showWordColumnMapping(content, headers, data);
        } catch (error) {
            Toast.error('Dosya okunamadı: ' + error.message);
            mappingSection.classList.add('hidden');
        }
    },

    async parseFileWithHeaders(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                    if (jsonData.length < 2) {
                        reject(new Error('Dosyada yeterli veri yok'));
                        return;
                    }

                    const headers = jsonData[0].map((h, i) => ({
                        index: i,
                        name: String(h || `Sütun ${i + 1}`).trim(),
                        sample: String(jsonData[1]?.[i] || '').substring(0, 30)
                    }));

                    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''));
                    resolve({ headers, data: rows });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Dosya okunamadı'));
            reader.readAsArrayBuffer(file);
        });
    },

    showWordColumnMapping(content, headers, data) {
        const mappingSection = content.querySelector('#column-mapping-section');
        const preview = content.querySelector('#word-preview');

        const fields = [
            { id: 'english_word', label: 'İngilizce Kelime', required: true },
            { id: 'turkish_meaning', label: 'Türkçe Anlam', required: true },
            { id: 'pronunciation', label: 'Okunuşu', required: false },
            { id: 'memory_sentence', label: 'Hafıza Cümlesi', required: false },
            { id: 'example_sentence', label: 'Örnek Cümle', required: false }
        ];

        const optionsHtml = headers.map(h =>
            `<option value="${h.index}">${Helpers.escapeHtml(h.name)} (örnek: ${Helpers.escapeHtml(h.sample)}...)</option>`
        ).join('');

        mappingSection.innerHTML = `
            <div class="card" style="padding: var(--space-lg);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-sm);">Sütun Eşleştirme</h3>
                <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-lg);">
                    Dosyanızda ${data.length} satır veri bulundu. Her alanın hangi sütuna karşılık geldiğini seçin.
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md);">
                    ${fields.map(field => `
                        <div>
                            <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">
                                ${field.label} ${field.required ? '<span style="color: var(--error);">*</span>' : '<span style="opacity: 0.5;">(opsiyonel)</span>'}
                            </label>
                            <select class="form-input" id="map-${field.id}" data-field="${field.id}">
                                <option value="-1">-- Seçin --</option>
                                ${optionsHtml}
                            </select>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: var(--space-lg);">
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">
                        Takımyıldız Seçimi <span style="color: var(--error);">*</span>
                    </label>
                    <select class="form-input" id="level-select" style="max-width: 300px;">
                        <option value="new">-- Yeni Takımyıldız Oluştur --</option>
                    </select>
                </div>
                <div id="new-level-fields" style="margin-top: var(--space-sm);">
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Yeni Takımyıldız Adı</label>
                    <input type="text" class="form-input" id="new-level-name" placeholder="Örneğin: A1 - Temel Kelimeler" style="max-width: 300px;">
                </div>

                <div style="margin-top: var(--space-lg); display: flex; gap: var(--space-sm);">
                    <button class="btn btn-primary" id="preview-mapping">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Önizle
                    </button>
                    <button class="btn btn-ghost" id="cancel-mapping">İptal</button>
                </div>
            </div>
        `;

        // Auto-detect columns
        this.autoDetectWordColumns(headers);

        // Load existing levels
        this.loadLevelOptions();

        // Toggle new level fields
        const levelSelect = mappingSection.querySelector('#level-select');
        const newLevelFields = mappingSection.querySelector('#new-level-fields');
        levelSelect.addEventListener('change', () => {
            newLevelFields.style.display = levelSelect.value === 'new' ? 'block' : 'none';
        });

        mappingSection.querySelector('#preview-mapping').addEventListener('click', () => {
            this.previewWordMapping(content, data);
        });

        mappingSection.querySelector('#cancel-mapping').addEventListener('click', () => {
            mappingSection.classList.add('hidden');
            preview.classList.add('hidden');
            this.uploadedData = null;
        });
    },

    async loadLevelOptions() {
        try {
            const levels = await DB.levels.getAll();
            const select = document.querySelector('#level-select');
            if (!select) return;
            levels.forEach(level => {
                const option = document.createElement('option');
                option.value = level.id;
                option.textContent = `${level.name} (Sıra: ${level.order_index})`;
                select.appendChild(option);
            });
        } catch (e) {
            console.warn('Could not load levels:', e);
        }
    },

    autoDetectWordColumns(headers) {
        const mappings = {
            english_word: ['english', 'ingilizce', 'word', 'kelime', 'eng', 'english_word'],
            turkish_meaning: ['turkish', 'turkce', 'türkçe', 'meaning', 'anlam', 'tr', 'turkish_meaning'],
            pronunciation: ['pronunciation', 'okunusu', 'okunuşu', 'telaffuz', 'pron', 'reading'],
            memory_sentence: ['memory', 'hafiza', 'hafıza', 'hatirlatici', 'memory_sentence', 'akilda'],
            example_sentence: ['example', 'ornek', 'örnek', 'sentence', 'cumle', 'cümle', 'example_sentence']
        };

        for (const [field, keywords] of Object.entries(mappings)) {
            const select = document.querySelector(`#map-${field}`);
            if (!select) continue;

            for (const header of headers) {
                const headerLower = header.name.toLowerCase();
                if (keywords.some(kw => headerLower.includes(kw))) {
                    select.value = header.index;
                    break;
                }
            }
        }
    },

    previewWordMapping(content, data) {
        const preview = content.querySelector('#word-preview');

        const mapping = {
            english_word: parseInt(document.querySelector('#map-english_word').value),
            turkish_meaning: parseInt(document.querySelector('#map-turkish_meaning').value),
            pronunciation: parseInt(document.querySelector('#map-pronunciation').value),
            memory_sentence: parseInt(document.querySelector('#map-memory_sentence').value),
            example_sentence: parseInt(document.querySelector('#map-example_sentence').value)
        };

        if (mapping.english_word === -1 || mapping.turkish_meaning === -1) {
            Toast.warning('İngilizce Kelime ve Türkçe Anlam sütunlarını seçmelisiniz');
            return;
        }

        const transformedData = data.map(row => ({
            english_word: String(row[mapping.english_word] || '').trim(),
            turkish_meaning: String(row[mapping.turkish_meaning] || '').trim(),
            pronunciation: mapping.pronunciation >= 0 ? String(row[mapping.pronunciation] || '').trim() : '',
            memory_sentence: mapping.memory_sentence >= 0 ? String(row[mapping.memory_sentence] || '').trim() : '',
            example_sentence: mapping.example_sentence >= 0 ? String(row[mapping.example_sentence] || '').trim() : ''
        })).filter(w => w.english_word && w.turkish_meaning);

        if (transformedData.length === 0) {
            Toast.error('Geçerli veri bulunamadı');
            return;
        }

        const levelSelect = document.querySelector('#level-select');
        const selectedLevelId = levelSelect.value;
        const levelLabel = selectedLevelId === 'new'
            ? (document.querySelector('#new-level-name')?.value?.trim() || 'Yeni Takımyıldız')
            : levelSelect.options[levelSelect.selectedIndex].textContent;

        preview.classList.remove('hidden');
        preview.innerHTML = `
            <div class="card" style="padding: var(--space-lg);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">
                    Önizleme — ${transformedData.length} yıldız → ${Helpers.escapeHtml(levelLabel)}
                </h3>
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid rgba(96, 165, 250, 0.1); border-radius: var(--radius);">
                    <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">
                        <thead>
                            <tr style="background: var(--surface-2); position: sticky; top: 0;">
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); font-weight: 500;">#</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); font-weight: 500;">English</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); font-weight: 500;">Türkçe</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); font-weight: 500;">Telaffuz</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); font-weight: 500;">Hafıza</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transformedData.slice(0, 15).map((row, i) => `
                                <tr style="border-top: 1px solid rgba(96, 165, 250, 0.06);">
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text-muted);">${i + 1}</td>
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml(row.english_word)}</td>
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml(row.turkish_meaning)}</td>
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text-muted);">${Helpers.escapeHtml(row.pronunciation || '—')}</td>
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text-muted);">${Helpers.escapeHtml((row.memory_sentence || '').substring(0, 25))}${row.memory_sentence?.length > 25 ? '...' : ''}</td>
                                </tr>
                            `).join('')}
                            ${transformedData.length > 15 ? `<tr><td colspan="5" style="padding: var(--space-sm); text-align: center; color: var(--text-muted); font-size: var(--text-sm);">... ve ${transformedData.length - 15} yıldız daha</td></tr>` : ''}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: var(--space-lg);">
                    <button class="btn btn-primary" id="confirm-word-upload">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Kataloğa Ekle (${transformedData.length} Yıldız)
                    </button>
                </div>
            </div>
        `;

        preview.querySelector('#confirm-word-upload').addEventListener('click', async () => {
            await this.uploadWords(content, transformedData);
        });
    },

    async uploadWords(content, words) {
        const btn = content.querySelector('#confirm-word-upload');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner" style="width: 16px; height: 16px;"></span> Yükleniyor...';

        try {
            const levelSelect = document.querySelector('#level-select');
            const selectedLevelId = levelSelect.value;
            let levelId;

            if (selectedLevelId === 'new') {
                const newLevelName = document.querySelector('#new-level-name')?.value?.trim();
                const { data: existingLevels, error: levelsErr } = await supabaseClient
                    .from('levels')
                    .select('order_index')
                    .order('order_index', { ascending: false })
                    .limit(1);

                if (levelsErr) {
                    throw new Error('Seviye listesi alınamadı: ' + (levelsErr.message || JSON.stringify(levelsErr)));
                }

                const nextOrder = (existingLevels?.[0]?.order_index || 0) + 1;
                const levelName = newLevelName || `Takımyıldız ${nextOrder}`;

                const { data: level, error: levelError } = await supabaseClient
                    .from('levels')
                    .insert({ name: levelName, order_index: nextOrder })
                    .select()
                    .single();

                if (levelError) {
                    throw new Error('Takımyıldız oluşturulamadı: ' + (levelError.message || JSON.stringify(levelError)));
                }
                if (!level) {
                    throw new Error('Takımyıldız oluşturulamadı. RLS politikası nedeniyle erişim reddedilmiş olabilir.');
                }
                levelId = level.id;
            } else {
                levelId = parseInt(selectedLevelId);
            }

            // Batch upload
            const BATCH_SIZE = 500;
            let uploaded = 0;
            for (let i = 0; i < words.length; i += BATCH_SIZE) {
                const batch = words.slice(i, i + BATCH_SIZE).map(w => ({
                    level_id: levelId,
                    english_word: w.english_word,
                    turkish_meaning: w.turkish_meaning,
                    pronunciation: w.pronunciation || '',
                    memory_sentence: w.memory_sentence || '',
                    example_sentence: w.example_sentence || ''
                }));

                const { error: wordsError } = await supabaseClient.from('words').insert(batch);
                if (wordsError) {
                    throw new Error('Kelime yükleme hatası: ' + (wordsError.message || JSON.stringify(wordsError)));
                }

                uploaded += batch.length;
                btn.textContent = `Yükleniyor... (${uploaded}/${words.length})`;
            }

            Toast.success(`${words.length} yıldız başarıyla kataloğa eklendi`);
            content.querySelector('#column-mapping-section').classList.add('hidden');
            content.querySelector('#word-preview').classList.add('hidden');
            this.uploadedData = null;
            this.loadWordList(content);
        } catch (error) {
            console.error('Upload failed:', error);
            Toast.error(error.message || 'Yükleme başarısız');
            btn.disabled = false;
            btn.innerHTML = 'Tekrar Dene';
        }
    },

    async loadWordList(content) {
        const wordList = content.querySelector('#word-list');
        try {
            const levels = await DB.levels.getAll();
            if (levels.length === 0) {
                wordList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: var(--space-lg);">Henüz yıldız eklenmemiş</p>';
                return;
            }

            wordList.innerHTML = levels.map(level => `
                <div class="card" style="padding: var(--space-md); margin-bottom: var(--space-sm); display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="color: var(--text); font-weight: 500;">${Helpers.escapeHtml(level.name)}</div>
                        <div style="color: var(--text-muted); font-size: var(--text-sm);">Sıra: ${level.order_index}</div>
                    </div>
                    <div style="display: flex; gap: var(--space-xs);">
                        <button class="btn btn-ghost" data-view-level="${level.id}" style="font-size: var(--text-sm); padding: var(--space-xs) var(--space-sm);">Gör</button>
                        <button class="btn btn-ghost" data-delete-level="${level.id}" style="font-size: var(--text-sm); padding: var(--space-xs) var(--space-sm); color: var(--error);">Sil</button>
                    </div>
                </div>
            `).join('');

            wordList.querySelectorAll('[data-view-level]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await this.showLevelWords(parseInt(btn.dataset.viewLevel));
                });
            });

            wordList.querySelectorAll('[data-delete-level]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const confirmed = await Modal.confirm('Bu takımyıldızı ve tüm yıldızlarını silmek istiyor musunuz?', 'Sil');
                    if (confirmed) {
                        try {
                            await supabaseClient.from('words').delete().eq('level_id', parseInt(btn.dataset.deleteLevel));
                            await supabaseClient.from('levels').delete().eq('id', parseInt(btn.dataset.deleteLevel));
                            Toast.success('Takımyıldız silindi');
                            this.loadWordList(content);
                        } catch (e) {
                            Toast.error('Silinemedi');
                        }
                    }
                });
            });
        } catch (error) {
            wordList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Yüklenemedi</p>';
        }
    },

    async showLevelWords(levelId) {
        try {
            const words = await DB.levels.getWords(levelId);

            Modal.create({
                title: `Takımyıldız Yıldızları (${words.length})`,
                content: `
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">
                            <thead>
                                <tr style="background: var(--surface-2); position: sticky; top: 0;">
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">#</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">English</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">Türkçe</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">Görsel</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${words.map((w, i) => `
                                    <tr style="border-top: 1px solid rgba(96, 165, 250, 0.06);">
                                        <td style="padding: var(--space-xs) var(--space-sm); color: var(--text-muted);">${i + 1}</td>
                                        <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml(w.english_word)}</td>
                                        <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml(w.turkish_meaning)}</td>
                                        <td style="padding: var(--space-xs) var(--space-sm); color: ${w.image_url ? 'var(--success)' : 'var(--text-muted)'};">${w.image_url ? 'Var' : '—'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `,
                actions: [
                    { id: 'close', label: 'Kapat', class: 'btn-primary', handler: (m) => Modal.close(m) }
                ]
            });
        } catch (e) {
            Toast.error('Yıldızlar yüklenemedi');
        }
    },

    // ==========================================
    // SENTENCES SECTION — Çeviri Cümleleri
    // ==========================================
    renderSentences(content) {
        content.innerHTML = `
            <div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-lg);">Çeviri Cümleleri</h2>

                <div class="card" id="sentence-upload-area" style="padding: var(--space-xl); text-align: center; cursor: pointer; border: 2px dashed rgba(96, 165, 250, 0.2); transition: all 0.3s;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" stroke-width="1.5" style="margin-bottom: var(--space-sm);">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p style="color: var(--text); font-size: var(--text-base); margin-bottom: var(--space-xs);">Dosyanızı sürükleyin veya tıklayın</p>
                    <p style="color: var(--text-muted); font-size: var(--text-sm);">Excel, CSV, Google Sheets — .xlsx, .xls, .csv, .ods</p>
                    <input type="file" id="sentence-file-input" accept=".csv,.xlsx,.xls,.ods" style="display: none;">
                </div>

                <div id="sentence-mapping-section" class="hidden" style="margin-top: var(--space-lg);"></div>
                <div id="sentence-preview" class="hidden" style="margin-top: var(--space-lg);"></div>

                <div style="margin-top: var(--space-xl);">
                    <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">Mevcut Cümleler</h3>
                    <div id="sentence-list">
                        <div style="display: flex; justify-content: center; padding: var(--space-lg);">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const uploadArea = content.querySelector('#sentence-upload-area');
        const fileInput = content.querySelector('#sentence-file-input');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent-1)';
            uploadArea.style.background = 'rgba(245, 197, 66, 0.05)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'rgba(96, 165, 250, 0.2)';
            uploadArea.style.background = '';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'rgba(96, 165, 250, 0.2)';
            uploadArea.style.background = '';
            if (e.dataTransfer.files.length) this.handleSentenceFile(content, e.dataTransfer.files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleSentenceFile(content, e.target.files[0]);
        });

        this.loadSentenceList(content);
    },

    async handleSentenceFile(content, file) {
        const mappingSection = content.querySelector('#sentence-mapping-section');
        mappingSection.innerHTML = '<div style="display: flex; justify-content: center; padding: var(--space-lg);"><div class="loading-spinner"></div></div>';
        mappingSection.classList.remove('hidden');

        try {
            const { headers, data } = await this.parseFileWithHeaders(file);

            if (data.length === 0) {
                Toast.error('Dosyada veri bulunamadı');
                mappingSection.classList.add('hidden');
                return;
            }

            this.showSentenceColumnMapping(content, headers, data);
        } catch (error) {
            Toast.error('Dosya okunamadı: ' + error.message);
            mappingSection.classList.add('hidden');
        }
    },

    showSentenceColumnMapping(content, headers, data) {
        const mappingSection = content.querySelector('#sentence-mapping-section');

        const optionsHtml = headers.map(h =>
            `<option value="${h.index}">${Helpers.escapeHtml(h.name)} (örnek: ${Helpers.escapeHtml(h.sample)}...)</option>`
        ).join('');

        mappingSection.innerHTML = `
            <div class="card" style="padding: var(--space-lg);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-sm);">Sütun Eşleştirme</h3>
                <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-lg);">
                    Dosyanızda ${data.length} satır veri bulundu. Her alanın hangi sütuna karşılık geldiğini seçin.
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md);">
                    <div>
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">
                            Türkçe Cümle <span style="color: var(--error);">*</span>
                        </label>
                        <select class="form-input" id="map-turkish-sentence">
                            <option value="-1">-- Seçin --</option>
                            ${optionsHtml}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">
                            İngilizce Cümle <span style="color: var(--error);">*</span>
                        </label>
                        <select class="form-input" id="map-english-sentence">
                            <option value="-1">-- Seçin --</option>
                            ${optionsHtml}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">
                            Zorluk Seviyesi <span style="opacity: 0.5;">(opsiyonel)</span>
                        </label>
                        <select class="form-input" id="map-difficulty">
                            <option value="-1">-- Seçin (varsayılan: medium) --</option>
                            ${optionsHtml}
                        </select>
                    </div>
                </div>

                <div style="margin-top: var(--space-md);">
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Varsayılan zorluk:</label>
                    <select class="form-input" id="default-difficulty" style="max-width: 200px;">
                        <option value="easy">Kolay</option>
                        <option value="medium" selected>Orta</option>
                        <option value="hard">Zor</option>
                    </select>
                </div>

                <div style="margin-top: var(--space-lg); display: flex; gap: var(--space-sm);">
                    <button class="btn btn-primary" id="preview-sentence-mapping">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Önizle
                    </button>
                    <button class="btn btn-ghost" id="cancel-sentence-mapping">İptal</button>
                </div>
            </div>
        `;

        // Auto-detect columns
        this.autoDetectSentenceColumns(headers);

        mappingSection.querySelector('#preview-sentence-mapping').addEventListener('click', () => {
            this.previewSentenceMapping(content, data);
        });

        mappingSection.querySelector('#cancel-sentence-mapping').addEventListener('click', () => {
            mappingSection.classList.add('hidden');
            content.querySelector('#sentence-preview').classList.add('hidden');
        });
    },

    autoDetectSentenceColumns(headers) {
        const mappings = {
            'turkish-sentence': ['turkish', 'turkce', 'türkçe', 'tr', 'cumle_tr', 'turkish_sentence'],
            'english-sentence': ['english', 'ingilizce', 'eng', 'cumle_en', 'english_sentence'],
            'difficulty': ['difficulty', 'zorluk', 'level', 'seviye']
        };

        for (const [field, keywords] of Object.entries(mappings)) {
            const select = document.querySelector(`#map-${field}`);
            if (!select) continue;

            for (const header of headers) {
                const headerLower = header.name.toLowerCase();
                if (keywords.some(kw => headerLower.includes(kw))) {
                    select.value = header.index;
                    break;
                }
            }
        }
    },

    previewSentenceMapping(content, data) {
        const preview = content.querySelector('#sentence-preview');

        const turkishCol = parseInt(document.querySelector('#map-turkish-sentence').value);
        const englishCol = parseInt(document.querySelector('#map-english-sentence').value);
        const difficultyCol = parseInt(document.querySelector('#map-difficulty').value);
        const defaultDifficulty = document.querySelector('#default-difficulty').value;

        if (turkishCol === -1 || englishCol === -1) {
            Toast.warning('Türkçe ve İngilizce cümle sütunlarını seçmelisiniz');
            return;
        }

        const transformedData = data.map(row => {
            let diff = defaultDifficulty;
            if (difficultyCol >= 0) {
                const rawDiff = String(row[difficultyCol] || '').toLowerCase().trim();
                if (['easy', 'kolay'].includes(rawDiff)) diff = 'easy';
                else if (['medium', 'orta'].includes(rawDiff)) diff = 'medium';
                else if (['hard', 'zor'].includes(rawDiff)) diff = 'hard';
            }

            return {
                turkish_sentence: String(row[turkishCol] || '').trim(),
                english_sentence: String(row[englishCol] || '').trim(),
                difficulty: diff
            };
        }).filter(s => s.turkish_sentence && s.english_sentence);

        if (transformedData.length === 0) {
            Toast.error('Geçerli veri bulunamadı');
            return;
        }

        const difficultyLabels = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };
        const difficultyColors = { easy: 'var(--success)', medium: 'var(--accent-1)', hard: 'var(--error)' };

        preview.classList.remove('hidden');
        preview.innerHTML = `
            <div class="card" style="padding: var(--space-lg);">
                <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">
                    Önizleme — ${transformedData.length} cümle
                </h3>
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid rgba(96, 165, 250, 0.1); border-radius: var(--radius);">
                    <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">
                        <thead>
                            <tr style="background: var(--surface-2); position: sticky; top: 0;">
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">#</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">Türkçe</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">İngilizce</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">Zorluk</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transformedData.slice(0, 10).map((row, i) => `
                                <tr style="border-top: 1px solid rgba(96, 165, 250, 0.06);">
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text-muted);">${i + 1}</td>
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml(row.turkish_sentence.substring(0, 40))}...</td>
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml(row.english_sentence.substring(0, 40))}...</td>
                                    <td style="padding: var(--space-xs) var(--space-sm);"><span style="color: ${difficultyColors[row.difficulty]}; font-size: var(--text-xs);">${difficultyLabels[row.difficulty]}</span></td>
                                </tr>
                            `).join('')}
                            ${transformedData.length > 10 ? `<tr><td colspan="4" style="padding: var(--space-sm); text-align: center; color: var(--text-muted);">... ve ${transformedData.length - 10} cümle daha</td></tr>` : ''}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: var(--space-lg);">
                    <button class="btn btn-primary" id="confirm-sentence-upload">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Veritabanına Yükle (${transformedData.length} Cümle)
                    </button>
                </div>
            </div>
        `;

        preview.querySelector('#confirm-sentence-upload').addEventListener('click', async () => {
            const btn = preview.querySelector('#confirm-sentence-upload');
            btn.disabled = true;
            btn.innerHTML = '<span class="loading-spinner" style="width: 16px; height: 16px;"></span> Yükleniyor...';

            try {
                await DB.admin.uploadSentences(transformedData);
                Toast.success(`${transformedData.length} cümle yüklendi`);
                content.querySelector('#sentence-mapping-section').classList.add('hidden');
                preview.classList.add('hidden');
                this.loadSentenceList(content);
            } catch (error) {
                Toast.error('Yükleme başarısız');
                btn.disabled = false;
                btn.textContent = 'Tekrar Dene';
            }
        });
    },

    async loadSentenceList(content) {
        const list = content.querySelector('#sentence-list');
        try {
            const { data, count } = await supabaseClient
                .from('translation_sentences')
                .select('*', { count: 'exact' })
                .limit(10)
                .order('id', { ascending: false });

            if (!data || data.length === 0) {
                list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: var(--space-lg);">Henüz cümle eklenmemiş</p>';
                return;
            }

            const diffLabels = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };
            const diffColors = { easy: 'var(--success)', medium: 'var(--accent-1)', hard: 'var(--error)' };

            list.innerHTML = `
                <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-md);">Toplam ${count || 0} cümle (son 10 gösteriliyor)</p>
                <div style="border: 1px solid rgba(96, 165, 250, 0.1); border-radius: var(--radius); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">
                        <thead>
                            <tr style="background: var(--surface-2);">
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">Türkçe</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">İngilizce</th>
                                <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted);">Zorluk</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(s => `
                                <tr style="border-top: 1px solid rgba(96, 165, 250, 0.06);">
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml((s.turkish_sentence || '').substring(0, 30))}...</td>
                                    <td style="padding: var(--space-xs) var(--space-sm); color: var(--text);">${Helpers.escapeHtml((s.english_sentence || '').substring(0, 30))}...</td>
                                    <td style="padding: var(--space-xs) var(--space-sm);"><span style="color: ${diffColors[s.difficulty] || 'var(--text-muted)'}; font-size: var(--text-xs);">${diffLabels[s.difficulty] || 'Orta'}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            list.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Yüklenemedi</p>';
        }
    },

    // ==========================================
    // IMAGES SECTION — Yıldız Görselleri
    // ==========================================
    async renderImages(content) {
        content.innerHTML = `
            <div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-md);">Yıldız Görselleri</h2>
                <p style="color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-lg);">
                    Yıldızlara görsel ekleyin. Görseller kart arkasında gösterilir.
                </p>

                <div style="margin-bottom: var(--space-lg);">
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Takımyıldız Seç</label>
                    <select class="form-input" id="image-level-select" style="max-width: 300px;">
                        <option value="">-- Takımyıldız Seçin --</option>
                    </select>
                </div>

                <div id="words-for-images" style="display: none;">
                    <div id="image-upload-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-md);"></div>
                </div>
            </div>
        `;

        try {
            const levels = await DB.levels.getAll();
            const select = content.querySelector('#image-level-select');

            levels.forEach(level => {
                const option = document.createElement('option');
                option.value = level.id;
                option.textContent = level.name;
                select.appendChild(option);
            });

            select.addEventListener('change', async () => {
                if (select.value) {
                    await this.loadWordsForImages(content, parseInt(select.value));
                } else {
                    content.querySelector('#words-for-images').style.display = 'none';
                }
            });
        } catch (e) {
            Toast.error('Takımyıldızlar yüklenemedi');
        }
    },

    async loadWordsForImages(content, levelId) {
        const container = content.querySelector('#words-for-images');
        const grid = content.querySelector('#image-upload-grid');

        container.style.display = 'block';
        grid.innerHTML = '<div style="grid-column: 1/-1; display: flex; justify-content: center; padding: var(--space-lg);"><div class="loading-spinner"></div></div>';

        try {
            const words = await DB.levels.getWords(levelId);

            if (words.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: var(--space-lg);">Bu takımyıldızda yıldız yok</p>';
                return;
            }

            grid.innerHTML = words.map(word => `
                <div class="card" data-word-id="${word.id}" style="padding: var(--space-sm); text-align: center;">
                    <div style="width: 100%; aspect-ratio: 1; border-radius: var(--radius); overflow: hidden; background: var(--surface-2); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-sm);">
                        ${word.image_url
                            ? `<img src="${word.image_url}" alt="${Helpers.escapeHtml(word.english_word)}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1" style="opacity: 0.3;">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="M21 15l-5-5L5 21"/>
                               </svg>`
                        }
                    </div>
                    <div style="font-size: var(--text-sm); font-weight: 500; color: var(--text); margin-bottom: 2px;">${Helpers.escapeHtml(word.english_word)}</div>
                    <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-sm);">${Helpers.escapeHtml(word.turkish_meaning)}</div>
                    <div style="display: flex; gap: var(--space-xs); justify-content: center;">
                        <input type="file" accept="image/*" style="display: none;" data-word-id="${word.id}">
                        <button class="btn btn-ghost upload-image-btn" data-word-id="${word.id}" style="font-size: var(--text-xs); padding: 4px 8px;">
                            ${word.image_url ? 'Değiştir' : 'Yükle'}
                        </button>
                        ${word.image_url ? `<button class="btn btn-ghost remove-image-btn" data-word-id="${word.id}" style="font-size: var(--text-xs); padding: 4px 8px; color: var(--error);">Kaldır</button>` : ''}
                    </div>
                </div>
            `).join('');

            // Upload handlers
            grid.querySelectorAll('.upload-image-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const wordId = btn.dataset.wordId;
                    const input = grid.querySelector(`input[data-word-id="${wordId}"]`);
                    input.click();
                });
            });

            grid.querySelectorAll('input[type="file"]').forEach(input => {
                input.addEventListener('change', async (e) => {
                    if (e.target.files.length) {
                        await this.uploadWordImage(content, parseInt(input.dataset.wordId), e.target.files[0], levelId);
                    }
                });
            });

            grid.querySelectorAll('.remove-image-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const confirmed = await Modal.confirm('Görseli kaldırmak istiyor musunuz?', 'Kaldır');
                    if (confirmed) {
                        await this.removeWordImage(content, parseInt(btn.dataset.wordId), levelId);
                    }
                });
            });
        } catch (e) {
            grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--error); text-align: center;">Yıldızlar yüklenemedi</p>';
        }
    },

    async uploadWordImage(content, wordId, file, levelId) {
        try {
            Toast.info('Görsel yükleniyor...');

            const fileExt = file.name.split('.').pop();
            const fileName = `word-${wordId}-${Date.now()}.${fileExt}`;

            const { data, error } = await supabaseClient.storage
                .from('word-images')
                .upload(fileName, file, {
                    upsert: true,
                    contentType: file.type
                });

            if (error) throw error;

            const { data: urlData } = supabaseClient.storage
                .from('word-images')
                .getPublicUrl(fileName);

            await supabaseClient
                .from('words')
                .update({ image_url: urlData.publicUrl })
                .eq('id', wordId);

            Toast.success('Görsel yüklendi');
            await this.loadWordsForImages(content, levelId);
        } catch (error) {
            console.error('Image upload error:', error);
            Toast.error('Görsel yüklenemedi: ' + error.message);
        }
    },

    async removeWordImage(content, wordId, levelId) {
        try {
            await supabaseClient
                .from('words')
                .update({ image_url: null })
                .eq('id', wordId);

            Toast.success('Görsel kaldırıldı');
            await this.loadWordsForImages(content, levelId);
        } catch (error) {
            Toast.error('Görsel kaldırılamadı');
        }
    },

    // ==========================================
    // USERS SECTION — Gözlemci Yönetimi
    // ==========================================
    async renderUsers(content) {
        content.innerHTML = `
            <div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-lg);">Gözlemci Yönetimi</h2>
                <div style="position: relative; margin-bottom: var(--space-lg);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input type="text" class="form-input" id="user-search" placeholder="Gözlemci ara..." style="padding-left: 36px;">
                </div>
                <div id="users-list">
                    <div style="display: flex; justify-content: center; padding: var(--space-xl);">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </div>
        `;

        content.querySelector('#user-search').addEventListener('input', Helpers.debounce(async (e) => {
            await this.loadUsers(content, e.target.value.trim());
        }, 300));

        await this.loadUsers(content, '');
    },

    async loadUsers(content, search) {
        const usersList = content.querySelector('#users-list');
        try {
            const users = await DB.admin.getAllUsers(search);

            if (users.length === 0) {
                usersList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: var(--space-lg);">Gözlemci bulunamadı</p>';
                return;
            }

            usersList.innerHTML = `
                <div style="border: 1px solid rgba(96, 165, 250, 0.1); border-radius: var(--radius); overflow: hidden;">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">
                            <thead>
                                <tr style="background: var(--surface-2);">
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); white-space: nowrap;">Gözlemci</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); white-space: nowrap;">Email</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); white-space: nowrap;">Işık</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); white-space: nowrap;">Rol</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: left; color: var(--text-muted); white-space: nowrap;">Durum</th>
                                    <th style="padding: var(--space-xs) var(--space-sm); text-align: right; color: var(--text-muted); white-space: nowrap;">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(u => `
                                    <tr style="border-top: 1px solid rgba(96, 165, 250, 0.06);">
                                        <td style="padding: var(--space-xs) var(--space-sm); color: var(--text); font-weight: 500;">${Helpers.escapeHtml(u.username)}</td>
                                        <td style="padding: var(--space-xs) var(--space-sm); color: var(--text-muted);">${Helpers.escapeHtml(u.email || '—')}</td>
                                        <td style="padding: var(--space-xs) var(--space-sm); color: var(--accent-1);">${Helpers.formatNumber(u.total_points || 0)}</td>
                                        <td style="padding: var(--space-xs) var(--space-sm);">
                                            ${u.is_admin ? '<span style="color: var(--accent-1); font-size: var(--text-xs); font-weight: 600;">Admin</span>' : '<span style="color: var(--text-muted); font-size: var(--text-xs);">—</span>'}
                                        </td>
                                        <td style="padding: var(--space-xs) var(--space-sm);">
                                            ${u.is_active ? '<span style="color: var(--success); font-size: var(--text-xs);">Aktif</span>' : '<span style="color: var(--error); font-size: var(--text-xs);">Engelli</span>'}
                                        </td>
                                        <td style="padding: var(--space-xs) var(--space-sm); text-align: right;">
                                            <div style="display: flex; gap: 4px; justify-content: flex-end;">
                                                <button class="btn btn-ghost" title="${u.is_admin ? 'Admin Kaldır' : 'Admin Yap'}" data-toggle-admin="${u.id}" data-is-admin="${u.is_admin}" style="padding: 4px 8px; font-size: var(--text-xs);">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                    </svg>
                                                </button>
                                                <button class="btn btn-ghost" title="${u.is_active ? 'Engelle' : 'Engeli Kaldır'}" data-ban="${u.id}" data-active="${u.is_active}" style="padding: 4px 8px; font-size: var(--text-xs); color: ${u.is_active ? 'var(--error)' : 'var(--success)'};">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        ${u.is_active ? '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>' : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            usersList.querySelectorAll('[data-ban]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.ban;
                    const isActive = btn.dataset.active === 'true';
                    const confirmed = await Modal.confirm(
                        isActive ? 'Bu gözlemciyi engellemek istiyor musunuz?' : 'Engeli kaldırmak istiyor musunuz?',
                        isActive ? 'Engelle' : 'Engeli Kaldır'
                    );
                    if (confirmed) {
                        try {
                            if (isActive) await DB.admin.banUser(userId);
                            else await DB.admin.unbanUser(userId);
                            Toast.success(isActive ? 'Gözlemci engellendi' : 'Engel kaldırıldı');
                            await this.loadUsers(content, '');
                        } catch (error) {
                            Toast.error('İşlem başarısız');
                        }
                    }
                });
            });

            usersList.querySelectorAll('[data-toggle-admin]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.toggleAdmin;
                    const isAdmin = btn.dataset.isAdmin === 'true';
                    const confirmed = await Modal.confirm(
                        isAdmin ? 'Admin yetkisini kaldırmak istiyor musunuz?' : 'Bu gözlemciyi admin yapmak istiyor musunuz?',
                        isAdmin ? 'Yetkiyi Kaldır' : 'Admin Yap'
                    );
                    if (confirmed) {
                        try {
                            await supabaseClient.from('users').update({ is_admin: !isAdmin }).eq('id', userId);
                            Toast.success(isAdmin ? 'Admin yetkisi kaldırıldı' : 'Gözlemci admin yapıldı');
                            await this.loadUsers(content, '');
                        } catch (error) {
                            Toast.error('İşlem başarısız');
                        }
                    }
                });
            });
        } catch (error) {
            usersList.innerHTML = '<p style="color: var(--error); text-align: center;">Gözlemciler yüklenemedi</p>';
        }
    },

    // ==========================================
    // FORUM SECTION — Meclis Yönetimi
    // ==========================================
    async renderForum(content) {
        try {
            const pendingPosts = await DB.admin.getPendingPosts();
            const pendingComments = await DB.admin.getPendingComments();

            content.innerHTML = `
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg);">
                        <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text);">Meclis Yönetimi</h2>
                        <button class="btn btn-primary" id="create-topic" style="font-size: var(--text-sm);">Yeni Başlık</button>
                    </div>

                    <h3 style="font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">Bekleyen Görüşler (${pendingPosts.length})</h3>
                    ${pendingPosts.length === 0
                        ? '<p style="color: var(--text-muted); margin-bottom: var(--space-xl);">Gökyüzü temiz — bekleyen görüş yok</p>'
                        : `<div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-xl);">
                            ${pendingPosts.map(post => `
                                <div class="card" style="padding: var(--space-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-sm);">
                                    <div style="flex: 1; min-width: 200px;">
                                        <div style="color: var(--text); font-weight: 500;">${Helpers.escapeHtml(post.title || 'Başlıksız')}</div>
                                        <div style="color: var(--text-muted); font-size: var(--text-sm);">${Helpers.escapeHtml(post.users?.username || '?')} — ${Helpers.escapeHtml(post.content?.substring(0, 60) || '')}...</div>
                                    </div>
                                    <div style="display: flex; gap: var(--space-xs);">
                                        <button class="btn btn-ghost" data-approve-post="${post.id}" style="color: var(--success); font-size: var(--text-sm); padding: 4px 10px;">Onayla</button>
                                        <button class="btn btn-ghost" data-reject-post="${post.id}" style="color: var(--error); font-size: var(--text-sm); padding: 4px 10px;">Reddet</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>`
                    }

                    <h3 style="font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">Bekleyen Yorumlar (${pendingComments.length})</h3>
                    ${pendingComments.length === 0
                        ? '<p style="color: var(--text-muted);">Bekleyen yorum yok</p>'
                        : `<div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                            ${pendingComments.map(comment => `
                                <div class="card" style="padding: var(--space-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-sm);">
                                    <div style="flex: 1; min-width: 200px;">
                                        <div style="color: var(--text); font-weight: 500;">${Helpers.escapeHtml(comment.users?.username || '?')}</div>
                                        <div style="color: var(--text-muted); font-size: var(--text-sm);">${Helpers.escapeHtml(comment.content?.substring(0, 80) || '')}</div>
                                    </div>
                                    <div style="display: flex; gap: var(--space-xs);">
                                        <button class="btn btn-ghost" data-approve-comment="${comment.id}" style="color: var(--success); font-size: var(--text-sm); padding: 4px 10px;">Onayla</button>
                                        <button class="btn btn-ghost" data-reject-comment="${comment.id}" style="color: var(--error); font-size: var(--text-sm); padding: 4px 10px;">Reddet</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>`
                    }
                </div>
            `;

            content.querySelector('#create-topic')?.addEventListener('click', () => this.showCreateTopic(content));

            content.querySelectorAll('[data-approve-post]').forEach(btn => {
                btn.addEventListener('click', async () => { await DB.admin.approvePost(parseInt(btn.dataset.approvePost)); Toast.success('Onaylandı'); this.renderForum(content); });
            });
            content.querySelectorAll('[data-reject-post]').forEach(btn => {
                btn.addEventListener('click', async () => { await DB.admin.deletePost(parseInt(btn.dataset.rejectPost)); Toast.success('Reddedildi'); this.renderForum(content); });
            });
            content.querySelectorAll('[data-approve-comment]').forEach(btn => {
                btn.addEventListener('click', async () => { await DB.admin.approveComment(parseInt(btn.dataset.approveComment)); Toast.success('Onaylandı'); this.renderForum(content); });
            });
            content.querySelectorAll('[data-reject-comment]').forEach(btn => {
                btn.addEventListener('click', async () => { await DB.admin.deleteComment(parseInt(btn.dataset.rejectComment)); Toast.success('Reddedildi'); this.renderForum(content); });
            });
        } catch (error) {
            content.innerHTML = '<p style="color: var(--error); text-align: center; padding: var(--space-xl);">Forum yönetimi yüklenemedi</p>';
        }
    },

    showCreateTopic(content) {
        Modal.create({
            title: 'Yeni Meclis Başlığı',
            content: `
                <div style="margin-bottom: var(--space-md);">
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Başlık</label>
                    <input type="text" class="form-input" id="topic-title" placeholder="Başlık giriniz">
                </div>
                <div>
                    <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Açıklama</label>
                    <textarea class="form-input" id="topic-content" placeholder="Açıklama giriniz" rows="4" style="resize: vertical;"></textarea>
                </div>
            `,
            actions: [
                { id: 'cancel', label: 'İptal', class: 'btn-ghost', handler: (m) => Modal.close(m) },
                {
                    id: 'create', label: 'Oluştur', class: 'btn-primary',
                    handler: async (m) => {
                        const title = m.querySelector('#topic-title').value.trim();
                        const topicContent = m.querySelector('#topic-content').value.trim();
                        if (!title) { Toast.warning('Başlık gerekli'); return; }
                        try {
                            await supabaseClient.from('forum_topics').insert({ name: title, description: topicContent });
                            Toast.success('Başlık oluşturuldu');
                            Modal.close(m);
                            this.renderForum(content);
                        } catch (error) {
                            Toast.error('Oluşturulamadı');
                        }
                    }
                }
            ]
        });
    },

    // ==========================================
    // MESSAGES SECTION — Gözlemevi Mesajları
    // ==========================================
    renderMessages(content) {
        content.innerHTML = `
            <div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-lg);">Gözlemevinden Mesaj Gönder</h2>

                <div class="card" style="padding: var(--space-lg);">
                    <div style="margin-bottom: var(--space-md);">
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Alıcı</label>
                        <select class="form-input" id="msg-recipient">
                            <option value="all">Tüm Gözlemciler (Duyuru)</option>
                        </select>
                    </div>
                    <div style="margin-bottom: var(--space-md);">
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Başlık</label>
                        <input type="text" class="form-input" id="msg-title" placeholder="Mesaj başlığı">
                    </div>
                    <div style="margin-bottom: var(--space-lg);">
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">İçerik</label>
                        <textarea class="form-input" id="msg-content" placeholder="Mesaj içeriği" rows="5" style="resize: vertical;"></textarea>
                    </div>
                    <button class="btn btn-primary" id="send-msg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Gönder
                    </button>
                </div>
            </div>
        `;

        this.loadUserDropdown(content);

        content.querySelector('#send-msg').addEventListener('click', async () => {
            const recipient = content.querySelector('#msg-recipient').value;
            const title = content.querySelector('#msg-title').value.trim();
            const msgContent = content.querySelector('#msg-content').value.trim();
            if (!title || !msgContent) { Toast.warning('Başlık ve içerik gerekli'); return; }
            try {
                if (recipient === 'all') await DB.admin.sendBroadcast(title, msgContent);
                else await DB.admin.sendMessage(recipient, title, msgContent);
                Toast.success('Mesaj gönderildi');
                content.querySelector('#msg-title').value = '';
                content.querySelector('#msg-content').value = '';
            } catch (error) {
                Toast.error('Mesaj gönderilemedi');
            }
        });
    },

    async loadUserDropdown(content) {
        try {
            const users = await DB.admin.getAllUsers('', 100);
            const select = content.querySelector('#msg-recipient');
            users.forEach(u => {
                const option = document.createElement('option');
                option.value = u.id;
                option.textContent = `${u.username} (${u.email || 'email yok'})`;
                select.appendChild(option);
            });
        } catch (e) {}
    },

    // ==========================================
    // SETTINGS SECTION — Ayarlar
    // ==========================================
    renderSettings(content) {
        content.innerHTML = `
            <div>
                <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text); margin-bottom: var(--space-lg);">Ayarlar</h2>

                <div class="card" style="padding: var(--space-lg);">
                    <h3 style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text); margin-bottom: var(--space-md);">Şifre Değiştir</h3>
                    <div style="margin-bottom: var(--space-md);">
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Mevcut Şifre</label>
                        <input type="password" class="form-input" id="current-password">
                    </div>
                    <div style="margin-bottom: var(--space-md);">
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Yeni Şifre</label>
                        <input type="password" class="form-input" id="new-password">
                    </div>
                    <div style="margin-bottom: var(--space-lg);">
                        <label style="display: block; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xs);">Yeni Şifre (Tekrar)</label>
                        <input type="password" class="form-input" id="confirm-password">
                    </div>
                    <button class="btn btn-primary" id="change-password">Şifreyi Değiştir</button>
                </div>
            </div>
        `;

        content.querySelector('#change-password').addEventListener('click', async () => {
            const currentPwd = content.querySelector('#current-password').value;
            const newPwd = content.querySelector('#new-password').value;
            const confirmPwd = content.querySelector('#confirm-password').value;

            if (!currentPwd || !newPwd || !confirmPwd) { Toast.warning('Tüm alanları doldurun'); return; }
            if (newPwd.length < 6) { Toast.warning('Şifre en az 6 karakter olmalı'); return; }
            if (newPwd !== confirmPwd) { Toast.warning('Şifreler eşleşmedi'); return; }

            try {
                const { error: signInError } = await supabaseClient.auth.signInWithPassword({
                    email: Auth.user?.email,
                    password: currentPwd
                });
                if (signInError) { Toast.error('Mevcut şifre yanlış'); return; }

                const { error } = await supabaseClient.auth.updateUser({ password: newPwd });
                if (error) throw error;

                Toast.success('Şifre başarıyla değiştirildi');
                content.querySelector('#current-password').value = '';
                content.querySelector('#new-password').value = '';
                content.querySelector('#confirm-password').value = '';
            } catch (error) {
                Toast.error('Şifre değiştirilemedi');
            }
        });
    },

    cleanup() {}
};

window.AdminPage = AdminPage;
