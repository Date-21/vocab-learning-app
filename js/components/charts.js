// Oişbiting — Charts Component
// Celestial DNA — Takımyıldız çizgi, nebula bar, gezegen pie, yörünge progress

const Charts = {
    // Takımyıldız çizgi grafiği — yıldız noktaları + bağlantı çizgileri
    line(container, data, options = {}) {
        const {
            labels = [],
            values = [],
            color = 'var(--accent-1)',
            showDots = true,
            showArea = true,
            height = 200
        } = { ...options, ...data };

        const width = container.offsetWidth || 300;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const maxValue = Math.max(...values, 1);
        const minValue = Math.min(...values, 0);
        const range = maxValue - minValue || 1;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Grid çizgileri — ince nebula hatları
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width - padding);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'rgba(96, 165, 250, 0.08)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }

        // Nokta hesaplama
        const points = values.map((val, i) => {
            const x = padding + (i / (values.length - 1 || 1)) * chartWidth;
            const y = padding + chartHeight - ((val - minValue) / range) * chartHeight;
            return { x, y, value: val, label: labels[i] };
        });

        // Nebula alan dolgusu
        if (showArea && points.length > 1) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            const gradId = 'area-grad-' + Date.now();
            grad.setAttribute('id', gradId);
            grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
            grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#f5c542');
            stop1.setAttribute('stop-opacity', '0.15');

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#f5c542');
            stop2.setAttribute('stop-opacity', '0');

            grad.appendChild(stop1);
            grad.appendChild(stop2);
            defs.appendChild(grad);
            svg.appendChild(defs);

            const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathD = `M ${points[0].x} ${padding + chartHeight} ` +
                points.map(p => `L ${p.x} ${p.y}`).join(' ') +
                ` L ${points[points.length - 1].x} ${padding + chartHeight} Z`;

            areaPath.setAttribute('d', pathD);
            areaPath.setAttribute('fill', `url(#${gradId})`);
            svg.appendChild(areaPath);
        }

        // Takımyıldız bağlantı çizgisi
        if (points.length > 1) {
            const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            linePath.setAttribute('d', pathD);
            linePath.setAttribute('fill', 'none');
            linePath.setAttribute('stroke', color);
            linePath.setAttribute('stroke-width', '2');
            linePath.setAttribute('stroke-linecap', 'round');
            linePath.setAttribute('stroke-linejoin', 'round');

            // Çizgi glow efekti
            linePath.setAttribute('filter', 'drop-shadow(0 0 3px rgba(245, 197, 66, 0.3))');

            svg.appendChild(linePath);
        }

        // Yıldız noktaları
        if (showDots) {
            points.forEach(p => {
                // Dış glow halkası
                const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                glow.setAttribute('cx', p.x);
                glow.setAttribute('cy', p.y);
                glow.setAttribute('r', '6');
                glow.setAttribute('fill', 'none');
                glow.setAttribute('stroke', color);
                glow.setAttribute('stroke-width', '1');
                glow.setAttribute('stroke-opacity', '0.3');
                svg.appendChild(glow);

                // Merkez yıldız
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                circle.setAttribute('r', '3.5');
                circle.setAttribute('fill', color);
                circle.setAttribute('stroke', 'var(--surface)');
                circle.setAttribute('stroke-width', '1.5');

                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = `${p.label || ''}: ${p.value}`;
                circle.appendChild(title);

                svg.appendChild(circle);
            });
        }

        // Y ekseni etiketleri
        const yLabels = [minValue, Math.round((maxValue + minValue) / 2), maxValue];
        yLabels.forEach((val, i) => {
            const y = padding + chartHeight - (i / 2) * chartHeight;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', padding - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('fill', 'var(--text-muted)');
            text.setAttribute('font-size', '10');
            text.setAttribute('font-family', 'Inter, sans-serif');
            text.textContent = val;
            svg.appendChild(text);
        });

        // X ekseni etiketleri
        const step = Math.ceil(labels.length / 7);
        labels.forEach((label, i) => {
            if (i % step === 0 || i === labels.length - 1) {
                const x = padding + (i / (labels.length - 1 || 1)) * chartWidth;
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', height - 10);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', 'var(--text-muted)');
                text.setAttribute('font-size', '10');
                text.setAttribute('font-family', 'Inter, sans-serif');
                text.textContent = label;
                svg.appendChild(text);
            }
        });

        container.innerHTML = '';
        container.appendChild(svg);
    },

    // Nebula bar chart — nebula gradyanlı barlar
    bar(container, data, options = {}) {
        const {
            labels = [],
            values = [],
            colors = [],
            height = 200
        } = { ...options, ...data };

        const width = container.offsetWidth || 300;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const maxValue = Math.max(...values, 1);
        const barWidth = (chartWidth / values.length) * 0.7;
        const barGap = (chartWidth / values.length) * 0.3;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Grid çizgileri
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width - padding);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'rgba(96, 165, 250, 0.08)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }

        // DNA renk paleti
        const defaultColors = [
            '#f5c542', '#60a5fa', '#34d399',
            '#a78bfa', '#f87171', '#fb923c'
        ];

        // Nebula gradyan tanımları
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        values.forEach((_, i) => {
            const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            const gradId = `bar-grad-${i}`;
            grad.setAttribute('id', gradId);
            grad.setAttribute('x1', '0'); grad.setAttribute('y1', '1');
            grad.setAttribute('x2', '0'); grad.setAttribute('y2', '0');

            const baseColor = colors[i] || defaultColors[i % defaultColors.length];
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', baseColor);
            stop1.setAttribute('stop-opacity', '0.6');

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', baseColor);
            stop2.setAttribute('stop-opacity', '1');

            grad.appendChild(stop1);
            grad.appendChild(stop2);
            defs.appendChild(grad);
        });
        svg.appendChild(defs);

        // Bar'ları çiz
        values.forEach((val, i) => {
            const barHeight = (val / maxValue) * chartHeight;
            const x = padding + i * (barWidth + barGap) + barGap / 2;
            const y = padding + chartHeight - barHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', `url(#bar-grad-${i})`);
            rect.setAttribute('rx', '4');

            // Glow efekti
            const baseColor = colors[i] || defaultColors[i % defaultColors.length];
            rect.setAttribute('filter', `drop-shadow(0 0 4px ${baseColor}40)`);

            // Animasyon
            rect.style.transform = 'scaleY(0)';
            rect.style.transformOrigin = 'bottom';
            rect.style.transition = `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s`;

            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${labels[i] || ''}: ${val}`;
            rect.appendChild(title);

            svg.appendChild(rect);

            // Üst değer etiketi
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', y - 6);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text)');
            text.setAttribute('font-size', '11');
            text.setAttribute('font-weight', '600');
            text.setAttribute('font-family', 'Inter, sans-serif');
            text.textContent = val;
            svg.appendChild(text);

            // Alt etiket
            const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            labelText.setAttribute('x', x + barWidth / 2);
            labelText.setAttribute('y', height - 10);
            labelText.setAttribute('text-anchor', 'middle');
            labelText.setAttribute('fill', 'var(--text-muted)');
            labelText.setAttribute('font-size', '10');
            labelText.setAttribute('font-family', 'Inter, sans-serif');
            labelText.textContent = labels[i] || '';
            svg.appendChild(labelText);
        });

        container.innerHTML = '';
        container.appendChild(svg);

        // Animasyonu tetikle
        requestAnimationFrame(() => {
            svg.querySelectorAll('rect').forEach(rect => {
                rect.style.transform = 'scaleY(1)';
            });
        });
    },

    // Gezegen yörünge pie/donut chart
    pie(container, data, options = {}) {
        const {
            labels = [],
            values = [],
            colors = [],
            donut = true,
            size = 200
        } = { ...options, ...data };

        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-family: Inter, sans-serif;">Gökyüzü temiz — veri yok</p>';
            return;
        }

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 10;
        const innerRadius = donut ? radius * 0.6 : 0;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        // Celestial renk paleti
        const defaultColors = [
            '#f5c542', '#60a5fa', '#34d399', '#a78bfa',
            '#f87171', '#fb923c', '#2dd4bf', '#94a3b8'
        ];

        let currentAngle = -Math.PI / 2;

        values.forEach((val, i) => {
            if (val === 0) return;

            const sliceAngle = (val / total) * Math.PI * 2;
            const endAngle = currentAngle + sliceAngle;
            const color = colors[i] || defaultColors[i % defaultColors.length];

            const x1 = centerX + radius * Math.cos(currentAngle);
            const y1 = centerY + radius * Math.sin(currentAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const x3 = centerX + innerRadius * Math.cos(endAngle);
            const y3 = centerY + innerRadius * Math.sin(endAngle);
            const x4 = centerX + innerRadius * Math.cos(currentAngle);
            const y4 = centerY + innerRadius * Math.sin(currentAngle);

            const largeArc = sliceAngle > Math.PI ? 1 : 0;

            let pathD;
            if (donut) {
                pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                         L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
            } else {
                pathD = `M ${centerX} ${centerY} L ${x1} ${y1}
                         A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathD);
            path.setAttribute('fill', color);
            path.setAttribute('filter', `drop-shadow(0 0 3px ${color}40)`);
            path.style.transition = 'transform 0.2s ease';
            path.style.transformOrigin = `${centerX}px ${centerY}px`;

            // Hover: gezegen büyümesi
            path.addEventListener('mouseenter', () => {
                path.style.transform = 'scale(1.05)';
                path.setAttribute('filter', `drop-shadow(0 0 8px ${color}60)`);
            });
            path.addEventListener('mouseleave', () => {
                path.style.transform = 'scale(1)';
                path.setAttribute('filter', `drop-shadow(0 0 3px ${color}40)`);
            });

            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${labels[i] || ''}: ${val} (%${Math.round((val / total) * 100)})`;
            path.appendChild(title);

            svg.appendChild(path);
            currentAngle = endAngle;
        });

        // Donut merkez — toplam ışık
        if (donut) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centerX);
            text.setAttribute('y', centerY - 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', 'var(--text)');
            text.setAttribute('font-size', '22');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-family', 'Cinzel, serif');
            text.textContent = total;
            svg.appendChild(text);

            const subtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            subtext.setAttribute('x', centerX);
            subtext.setAttribute('y', centerY + 18);
            subtext.setAttribute('text-anchor', 'middle');
            subtext.setAttribute('fill', 'var(--text-muted)');
            subtext.setAttribute('font-size', '10');
            subtext.setAttribute('font-family', 'Inter, sans-serif');
            subtext.textContent = 'Toplam';
            svg.appendChild(subtext);
        }

        // Legend — yıldız haritası anahtarı
        const legendDiv = document.createElement('div');
        legendDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 16px;';

        labels.forEach((label, i) => {
            if (values[i] === 0) return;

            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 12px;';

            const dot = document.createElement('span');
            const dotColor = colors[i] || defaultColors[i % defaultColors.length];
            dot.style.cssText = `width: 10px; height: 10px; border-radius: 50%; background: ${dotColor}; box-shadow: 0 0 6px ${dotColor}40;`;

            const text = document.createElement('span');
            text.style.cssText = 'color: var(--text-muted); font-family: Inter, sans-serif;';
            text.textContent = `${label} (%${Math.round((values[i] / total) * 100)})`;

            item.appendChild(dot);
            item.appendChild(text);
            legendDiv.appendChild(item);
        });

        container.innerHTML = '';
        container.style.textAlign = 'center';
        container.appendChild(svg);
        container.appendChild(legendDiv);
    },

    // Yörünge ilerleme halkası
    progressRing(container, value, max = 100, options = {}) {
        const {
            size = 120,
            strokeWidth = 8,
            color = 'var(--accent-1)',
            showLabel = true,
            label = ''
        } = options;

        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const percent = Math.min(100, Math.max(0, (value / max) * 100));
        const offset = circumference - (percent / 100) * circumference;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.transform = 'rotate(-90deg)';

        // Arka plan yörüngesi
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', size / 2);
        bgCircle.setAttribute('cy', size / 2);
        bgCircle.setAttribute('r', radius);
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', 'var(--surface-2)');
        bgCircle.setAttribute('stroke-width', strokeWidth);
        svg.appendChild(bgCircle);

        // İlerleme yörüngesi
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', size / 2);
        progressCircle.setAttribute('cy', size / 2);
        progressCircle.setAttribute('r', radius);
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke', color);
        progressCircle.setAttribute('stroke-width', strokeWidth);
        progressCircle.setAttribute('stroke-linecap', 'round');
        progressCircle.setAttribute('stroke-dasharray', circumference);
        progressCircle.setAttribute('stroke-dashoffset', circumference);
        progressCircle.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
        progressCircle.style.filter = `drop-shadow(0 0 4px currentColor)`;
        svg.appendChild(progressCircle);

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: relative; display: inline-block;';
        wrapper.appendChild(svg);

        if (showLabel) {
            const labelDiv = document.createElement('div');
            labelDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            `;
            labelDiv.innerHTML = `
                <div style="font-size: 22px; font-weight: bold; color: var(--text); font-family: Cinzel, serif;">${value}</div>
                ${label ? `<div style="font-size: 11px; color: var(--text-muted); font-family: Inter, sans-serif;">${label}</div>` : ''}
            `;
            wrapper.appendChild(labelDiv);
        }

        container.innerHTML = '';
        container.appendChild(wrapper);

        // Gravitasyonel animasyon
        requestAnimationFrame(() => {
            progressCircle.setAttribute('stroke-dashoffset', offset);
        });
    }
};

window.Charts = Charts;
