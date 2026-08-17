        const API = 'api/charts';
        const TYPE_LABELS = DentalReport.CHART_TYPE_LABELS;
        const PAGE_SIZE = 15;
        let charts = [];
        let selectedId = '';
        let selectedDetail = null;
        let selectedType = '';
        let dateFilterMode = '';
        let dateFrom = '';
        let dateTo = '';
        let sortKey = 'id';
        let sortDirection = 'desc';
        let trashMode = false;
        let currentPage = 1;
        let selectedKeyword = '';
        let keywordHeatmapChart = null;
        const toothHeatmapCharts = { dog: null, cat: null };
        const heatmapDefaultHeights = { keyword: 0, dog: 0, cat: 0 };
        const CHARTS_CACHE_KEY = 'dentalchart:history-list:v1';
        const CHARTS_CACHE_TTL_MS = 60 * 1000;
        let heatmapFieldsLoaded = false;
        let heatmapRenderToken = 0;
        let highchartsPromise = null;
        const TOOTH_ROWS = {
            dog: {
                upper: ['110', '109', '108', '107', '106', '105', '104', '103', '102', '101', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210'],
                lower: ['411', '410', '409', '408', '407', '406', '405', '404', '403', '402', '401', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311']
            },
            cat: {
                upper: ['109', '108', '107', '106', '104', '103', '102', '101', '201', '202', '203', '204', '206', '207', '208', '209'],
                lower: ['409', '408', '407', '404', '403', '402', '401', '301', '302', '303', '304', '307', '308', '309']
            }
        };

        const dateFormatter = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
            hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false
        });

        function formatDate(value) { return dateFormatter.format(new Date(Number(value))); }
        function formatTime(value) { return timeFormatter.format(new Date(Number(value))); }
        function dateKey(value) {
            const date = new Date(Number(value));
            return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
        }
        function todayKey() { return dateKey(Date.now()); }
        function calendarDateKey(offsetDays = 0) {
            const date = new Date();
            date.setHours(12, 0, 0, 0);
            date.setDate(date.getDate() + offsetDays);
            return dateKey(date.getTime());
        }
        function resolveDateRange(mode = dateFilterMode, from = dateFrom, to = dateTo) {
            if (mode === 'today') {
                const key = calendarDateKey(0);
                return { from: key, to: key };
            }
            if (mode === 'yesterday') {
                const key = calendarDateKey(-1);
                return { from: key, to: key };
            }
            if (mode === 'last3') return { from: calendarDateKey(-2), to: calendarDateKey(0) };
            if (mode === 'last7') return { from: calendarDateKey(-6), to: calendarDateKey(0) };
            if (mode === 'custom') {
                let start = from || '';
                let end = to || '';
                if (start && end && start > end) [start, end] = [end, start];
                return { from: start, to: end };
            }
            return { from: '', to: '' };
        }
        function dateFilterLabel() {
            if (dateFilterMode === 'today') return '今天';
            if (dateFilterMode === 'yesterday') return '昨天';
            if (dateFilterMode === 'last3') return '近3天';
            if (dateFilterMode === 'last7') return '近一周';
            if (dateFilterMode === 'custom') {
                const { from, to } = resolveDateRange();
                if (from && to) return from === to ? from : `${from} ~ ${to}`;
                if (from) return `${from} 起`;
                if (to) return `至 ${to}`;
            }
            return '';
        }
        function chartMatchesDate(item) {
            const { from, to } = resolveDateRange();
            if (!from && !to) return true;
            const key = dateKey(item.createdAt);
            if (from && key < from) return false;
            if (to && key > to) return false;
            return true;
        }
        function syncDateFilterControls() {
            const { from, to } = resolveDateRange();
            const startInput = document.getElementById('dateFilterStart');
            const endInput = document.getElementById('dateFilterEnd');
            const defaultDate = calendarDateKey(0);
            if (startInput) startInput.value = from || defaultDate;
            if (endInput) endInput.value = to || defaultDate;
            document.querySelectorAll('#dateFilters button').forEach(button => {
                const mode = button.dataset.date || '';
                button.classList.toggle('active', dateFilterMode === mode);
            });
            document.querySelector('.date-range')?.classList.toggle('is-active', dateFilterMode === 'custom');
        }
        function applyDateFilter(mode, from = '', to = '') {
            dateFilterMode = mode || '';
            if (dateFilterMode === 'custom') {
                dateFrom = from || '';
                dateTo = to || '';
                if (!dateFrom && !dateTo) dateFilterMode = '';
            } else {
                dateFrom = '';
                dateTo = '';
            }
            syncDateFilterControls();
            currentPage = 1;
            renderRows();
            refreshVisibleHeatmaps();
        }
        function openChart(id, version) {
            window.enterChartFromHistory?.({ chartId: id, version });
        }
        function openFollowup(id) {
            window.enterChartFromHistory?.({ chartId: id, followup: true });
        }
        function openView(id, version) {
            window.enterChartFromHistory?.({ chartId: id, viewOnly: true, version });
        }
        function fullscreenElement() {
            return document.fullscreenElement || document.webkitFullscreenElement || null;
        }
        function rememberHeatmapDefaultHeights(cardId) {
            if (cardId === 'keywordHeatmapCard' && keywordHeatmapChart) {
                heatmapDefaultHeights.keyword = keywordHeatmapChart.chartHeight;
            }
            if (cardId === 'toothHeatmapCard') {
                ['dog', 'cat'].forEach(type => {
                    if (toothHeatmapCharts[type]) {
                        heatmapDefaultHeights[type] = toothHeatmapCharts[type].chartHeight;
                    }
                });
            }
        }
        function restoreHeatmapDefaultHeights() {
            if (keywordHeatmapChart && heatmapDefaultHeights.keyword) {
                keywordHeatmapChart.setSize(null, heatmapDefaultHeights.keyword, false);
            }
            ['dog', 'cat'].forEach(type => {
                if (toothHeatmapCharts[type] && heatmapDefaultHeights[type]) {
                    toothHeatmapCharts[type].setSize(null, heatmapDefaultHeights[type], false);
                }
            });
        }
        function setHeatmapCollapsed(collapsed) {
            [
                { id: 'keywordHeatmapCard', title: '疾病关键词热力图' },
                { id: 'toothHeatmapCard', title: '单牙异常频率' }
            ].forEach(({ id, title }) => {
                const card = document.getElementById(id);
                const toggle = card?.querySelector('.heatmap-collapse-toggle');
                if (!card || !toggle) return;
                card.classList.toggle('heatmap-card--collapsed', collapsed);
                toggle.setAttribute('aria-expanded', String(!collapsed));
                toggle.title = collapsed ? `展开${title}` : `折叠${title}`;
            });
            if (!collapsed) {
                ensureHeatmapsRendered();
            }
        }

        function toggleHeatmapCollapse(cardId) {
            const card = document.getElementById(cardId);
            if (!card) return;
            setHeatmapCollapsed(!card.classList.contains('heatmap-card--collapsed'));
        }

        async function toggleHeatmapFullscreen(cardId) {
            const card = document.getElementById(cardId);
            if (!card) return;
            try {
                if (fullscreenElement() === card) {
                    const exit = document.exitFullscreen || document.webkitExitFullscreen;
                    if (exit) await exit.call(document);
                } else {
                    if (card.classList.contains('heatmap-card--collapsed')) {
                        setHeatmapCollapsed(false);
                    }
                    await ensureHeatmapsRendered();
                    const request = card.requestFullscreen || card.webkitRequestFullscreen;
                    if (!request) throw new Error('当前浏览器不支持全屏显示');
                    rememberHeatmapDefaultHeights(cardId);
                    await request.call(card);
                }
            } catch (error) {
                document.getElementById('historyStatus').textContent = error.message || '无法进入全屏显示';
            }
        }
        function updateHeatmapFullscreenState() {
            const active = fullscreenElement();
            document.querySelectorAll('.heatmap-expand-button').forEach(button => {
                const expanded = active?.id === button.dataset.fullscreenCard;
                const chartName = button.dataset.fullscreenCard === 'keywordHeatmapCard' ? '疾病关键词热力图' : '单牙异常频率';
                button.classList.toggle('active', expanded);
                button.setAttribute('aria-label', expanded ? '退出全屏' : `全屏显示${chartName}`);
                button.title = expanded ? '退出全屏' : '全屏显示';
            });
            setTimeout(() => {
                if (active) {
                    keywordHeatmapChart?.reflow();
                    toothHeatmapCharts.dog?.reflow();
                    toothHeatmapCharts.cat?.reflow();
                } else {
                    restoreHeatmapDefaultHeights();
                }
            }, 80);
        }
        document.addEventListener('fullscreenchange', updateHeatmapFullscreenState);
        document.addEventListener('webkitfullscreenchange', updateHeatmapFullscreenState);
        function makeElement(tag, className, text) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (text !== undefined) element.textContent = text;
            return element;
        }

        function renderDetailBasicInfo(detail) {
            document.getElementById('detailExamId').textContent = detail.id || '';
            document.getElementById('detailMedicalRecordId').textContent = detail.medicalRecordId || detail.id || '';
            document.getElementById('detailOwnerName').textContent = detail.ownerName || '';
            document.getElementById('detailPetName').textContent = detail.petName || '';
            document.getElementById('detailChartType').textContent = TYPE_LABELS[detail.chartType] || '';
            document.getElementById('detailCreatedAt').textContent = detail.createdAt
                ? `${formatDate(detail.createdAt)} ${formatTime(detail.createdAt)}`
                : '';
            const status = document.getElementById('detailBasicInfoStatus');
            if (status) status.textContent = '';
            document.querySelectorAll('.detail-editable-value').forEach(element => {
                element.classList.toggle('editable', !trashMode);
                element.tabIndex = trashMode ? -1 : 0;
            });
        }

        function createVersionReportSection(title, text) {
            const section = makeElement('section', 'report-section');
            const heading = makeElement('div', 'report-section-header');
            heading.appendChild(makeElement('h4', '', title));
            const textarea = makeElement('textarea', 'report-textarea' + (text ? '' : ' report-textarea--empty'));
            textarea.readOnly = true;
            textarea.rows = 5;
            textarea.value = text || '';
            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'report-copy-btn';
            copyBtn.setAttribute('aria-label', `复制${title}`);
            copyBtn.title = `复制${title}`;
            copyBtn.addEventListener('click', () => DentalReport.copyText(textarea.value, copyBtn));
            heading.appendChild(copyBtn);
            section.append(heading, textarea);
            return section;
        }

        async function saveBasicInfo(field, value, element, originalValue) {
            if (!selectedDetail || !selectedId) return;
            const editingId = selectedId;
            const next = {
                ownerName: field === 'ownerName' ? value : selectedDetail.ownerName,
                petName: field === 'petName' ? value : selectedDetail.petName
            };
            const status = document.getElementById('detailBasicInfoStatus');
            if (status) status.textContent = '正在保存...';
            try {
                const response = await DentalApi.fetch(`${API}/${editingId}/basic-info`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(next)
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.message || '基本信息保存失败');
                if (selectedId !== editingId) return;
                selectedDetail = result;
                const item = charts.find(chart => chart.id === editingId);
                if (item) Object.assign(item, {
                    ownerName: result.ownerName,
                    petName: result.petName
                });
                renderDetailBasicInfo(result);
                currentPage = 1;
                renderRows();
                if (status) status.textContent = '已保存';
            } catch (error) {
                element.textContent = originalValue;
                if (status) status.textContent = error.message || '基本信息保存失败';
            }
        }

        function beginBasicInfoEdit(element) {
            if (trashMode || !selectedDetail || element.classList.contains('editing')) return;
            const field = element.dataset.basicField;
            const originalValue = field === 'ownerName' ? selectedDetail.ownerName || '' : selectedDetail.petName || '';
            const input = makeElement('input', 'detail-inline-input');
            input.type = 'text';
            input.maxLength = 100;
            input.value = originalValue;
            input.setAttribute('aria-label', field === 'ownerName' ? '修改家长' : '修改动物');
            const syncInputWidth = () => {
                input.size = Math.max(2, (input.value || '').length || 1);
            };
            syncInputWidth();
            element.classList.add('editing');
            element.replaceChildren(input);
            input.focus();
            input.select();
            input.addEventListener('input', syncInputWidth);
            let finished = false;
            const finish = save => {
                if (finished) return;
                finished = true;
                element.classList.remove('editing');
                const value = input.value.trim();
                element.textContent = save ? value : originalValue;
                if (save && value !== originalValue) saveBasicInfo(field, value, element, originalValue);
            };
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    finish(true);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    finish(false);
                }
            });
            input.addEventListener('blur', () => finish(true));
        }

        document.querySelectorAll('.detail-editable-value').forEach(element => {
            element.addEventListener('dblclick', () => beginBasicInfoEdit(element));
            element.addEventListener('click', () => {
                if (window.matchMedia('(hover: none), (pointer: coarse)').matches) beginBasicInfoEdit(element);
            });
            element.addEventListener('keydown', event => {
                if (event.key === 'Enter') beginBasicInfoEdit(element);
            });
        });

        const pendingDeleteTimers = new WeakMap();

        function trashIconSvg() {
            return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"></path><path d="M9 7V5h6v2"></path><path d="M7 7l1 13h8l1-13"></path><path d="M10 11v6M14 11v6"></path></svg>';
        }

        function confirmIconSvg() {
            return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>';
        }

        function fillDeleteButton(button, label) {
            button.innerHTML = [
                `<span class="row-delete-icon row-delete-icon--trash" aria-hidden="true">${trashIconSvg()}</span>`,
                `<span class="row-delete-icon row-delete-icon--confirm" aria-hidden="true">${confirmIconSvg()}</span>`
            ].join('');
            button.classList.remove('confirm-mode');
            button.setAttribute('aria-label', label);
            button.title = label;
        }

        function resetDeleteButton(button, label) {
            if (!button?.classList.contains('confirm-mode')) return;
            const timer = pendingDeleteTimers.get(button);
            if (timer) {
                clearTimeout(timer);
                pendingDeleteTimers.delete(button);
            }
            fillDeleteButton(button, label);
        }

        async function deleteChart(chart, event) {
            event?.stopPropagation();
            const button = event?.currentTarget;
            if (!button || button.disabled) return;

            const name = chart.petName || chart.id;
            const permanent = trashMode;
            const baseLabel = permanent ? `彻底删除${name}` : `删除${name}`;
            const confirmLabel = permanent ? `再次点击彻底删除${name}` : `再次点击确认删除${name}`;

            if (!button.classList.contains('confirm-mode')) {
                button.classList.add('confirm-mode');
                button.setAttribute('aria-label', confirmLabel);
                button.title = confirmLabel;
                const timer = setTimeout(() => resetDeleteButton(button, baseLabel), 2500);
                pendingDeleteTimers.set(button, timer);
                return;
            }

            const timer = pendingDeleteTimers.get(button);
            if (timer) {
                clearTimeout(timer);
                pendingDeleteTimers.delete(button);
            }
            button.disabled = true;
            try {
                const response = await DentalApi.fetch(`${API}/${chart.id}${permanent ? '?permanent=true' : ''}`, { method: 'DELETE' });
                if (!response.ok) throw new Error((await response.json()).message || '删除失败');
                charts = charts.filter(item => item.id !== chart.id);
                if (selectedId === chart.id) {
                    selectedId = '';
                    document.getElementById('detailContent').hidden = true;
                    document.getElementById('detailEmpty').hidden = false;
                }
                updateSummary();
                renderRows();
                const next = filteredCharts()[(currentPage - 1) * PAGE_SIZE];
                if (next) selectChart(next.id);
                document.getElementById('historyStatus').textContent = permanent ? '牙表已彻底删除' : '牙表已移入回收站';
            } catch (error) {
                button.disabled = false;
                resetDeleteButton(button, baseLabel);
                alert(`删除失败：${error.message}`);
            }
        }

        async function restoreChart(chart, event) {
            event?.stopPropagation();
            const button = event?.currentTarget;
            if (button) button.disabled = true;
            try {
                const response = await DentalApi.fetch(`${API}/${chart.id}/restore`, { method: 'POST' });
                if (!response.ok) throw new Error('恢复失败');
                charts = charts.filter(item => item.id !== chart.id);
                renderRows();
                document.getElementById('historyStatus').textContent = '牙表已恢复';
            } catch (error) {
                if (button) button.disabled = false;
                alert(`恢复失败：${error.message}`);
            }
        }

        function toggleTrash() {
            trashMode = !trashMode;
            currentPage = 1;
            selectedId = '';
            document.getElementById('trashToggle').classList.toggle('active', trashMode);
            document.getElementById('trashToggle').textContent = trashMode ? '返回历史记录' : '回收站';
            document.getElementById('detailContent').hidden = true;
            document.getElementById('detailEmpty').hidden = false;
            document.getElementById('emptyState').textContent = trashMode ? '回收站为空' : '暂无历史牙表';
            document.getElementById('statisticsGrid').hidden = trashMode;
            document.getElementById('keywordHeatmapCard').hidden = trashMode;
            document.getElementById('toothHeatmapCard').hidden = trashMode;
            loadCharts();
        }

        function isHeatmapExpanded() {
            const card = document.getElementById('keywordHeatmapCard');
            return !!card && !card.hidden && !card.classList.contains('heatmap-card--collapsed');
        }

        function loadScript(src) {
            return new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    if (existing.dataset.loaded === 'true') return resolve();
                    existing.addEventListener('load', () => resolve(), { once: true });
                    existing.addEventListener('error', () => reject(new Error('热力图组件未能加载')), { once: true });
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    script.dataset.loaded = 'true';
                    resolve();
                };
                script.onerror = () => reject(new Error('热力图组件未能加载'));
                document.head.appendChild(script);
            });
        }

        function loadHighcharts() {
            if (window.Highcharts?.seriesTypes?.treemap && window.Highcharts?.seriesTypes?.heatmap) {
                return Promise.resolve();
            }
            if (!highchartsPromise) {
                highchartsPromise = loadScript('js/vendor/highcharts-12.4.0.js')
                    .then(() => loadScript('js/vendor/highcharts-treemap-12.4.0.js'))
                    .then(() => loadScript('js/vendor/highcharts-heatmap-12.4.0.js'));
            }
            return highchartsPromise;
        }

        function chartsHaveHeatmapFields() {
            return charts.length > 0 && charts.every((item) => Array.isArray(item.abnormalTeeth));
        }

        function readChartsCache(trash) {
            try {
                const cache = JSON.parse(sessionStorage.getItem(CHARTS_CACHE_KEY) || 'null');
                if (!cache || cache.trash !== trash) return null;
                if (Date.now() - Number(cache.savedAt) > CHARTS_CACHE_TTL_MS) return null;
                return Array.isArray(cache.charts) ? cache.charts : null;
            } catch (_) {
                return null;
            }
        }

        function writeChartsCache(trash, rows) {
            try {
                sessionStorage.setItem(CHARTS_CACHE_KEY, JSON.stringify({
                    trash,
                    savedAt: Date.now(),
                    charts: rows
                }));
            } catch (_) {
                // 会话存储不可用时忽略列表缓存。
            }
        }

        async function ensureHeatmapFields() {
            if (heatmapFieldsLoaded || !charts.length || chartsHaveHeatmapFields()) {
                heatmapFieldsLoaded = heatmapFieldsLoaded || !charts.length || chartsHaveHeatmapFields();
                return;
            }
            const query = `heatmap=true${trashMode ? '&trash=true' : ''}`;
            const response = await DentalApi.fetch(`${API}?${query}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('无法读取热力图统计');
            const detailed = await response.json();
            const extra = new Map((Array.isArray(detailed) ? detailed : []).map((item) => [item.id, item]));
            charts = charts.map((item) => {
                const next = extra.get(item.id);
                if (!next) return item;
                return {
                    ...item,
                    abnormalTeeth: next.abnormalTeeth,
                    toothKeywords: next.toothKeywords
                };
            });
            heatmapFieldsLoaded = true;
        }

        function refreshVisibleHeatmaps() {
            if (isHeatmapExpanded()) ensureHeatmapsRendered();
        }

        async function ensureHeatmapsRendered() {
            if (!isHeatmapExpanded() || trashMode) return;
            const token = ++heatmapRenderToken;
            try {
                await Promise.all([ensureHeatmapFields(), loadHighcharts()]);
                if (token !== heatmapRenderToken || !isHeatmapExpanded() || trashMode) return;
                renderKeywordHeatmap();
                renderToothHeatmaps();
            } catch (error) {
                const container = document.getElementById('keywordHeatmap');
                if (container) {
                    container.classList.add('empty');
                    container.textContent = error.message || '热力图加载失败';
                }
            }
        }

        function applyCharts(rows, fromCache = false) {
            charts = Array.isArray(rows) ? rows : [];
            heatmapFieldsLoaded = chartsHaveHeatmapFields();
            applyExamCountsByMedicalRecord();
            updateSummary(false);
            renderRows();
            if (!fromCache) refreshVisibleHeatmaps();
        }

        function heatmapColor(percentage, palette = 'keyword') {
            const stops = {
                keyword: ['#e5e9e7', 'rgba(190,226,213,.55)', 'rgba(157,207,190,.68)', 'rgba(119,184,162,.78)', 'rgba(76,153,128,.86)', 'rgba(39,121,98,.94)', '#075e4b'],
                dog: ['#e5e9e7', 'rgba(186,214,236,.58)', 'rgba(147,191,227,.70)', 'rgba(106,163,214,.80)', 'rgba(66,133,196,.88)', 'rgba(37,99,171,.94)', '#1a4f96'],
                cat: ['#e5e9e7', 'rgba(244,196,214,.58)', 'rgba(236,166,196,.70)', 'rgba(224,130,174,.80)', 'rgba(209,94,150,.88)', 'rgba(189,64,122,.94)', '#9a2d68']
            }[palette] || ['#e5e9e7', 'rgba(190,226,213,.55)', 'rgba(157,207,190,.68)', 'rgba(119,184,162,.78)', 'rgba(76,153,128,.86)', 'rgba(39,121,98,.94)', '#075e4b'];
            const value = Math.max(0, Math.min(100, Number(percentage) || 0));
            if (value === 0) return stops[0];
            if (value <= 5) return stops[1];
            if (value <= 15) return stops[2];
            if (value <= 30) return stops[3];
            if (value <= 50) return stops[4];
            if (value <= 75) return stops[5];
            return stops[6];
        }

        function heatmapInk(percentage, palette = 'keyword') {
            if (percentage > 50) return '#ffffff';
            if (palette === 'dog') return '#1e3a5f';
            if (palette === 'cat') return '#5c243c';
            return '#143f34';
        }

        function heatmapAccent(palette = 'keyword') {
            if (palette === 'dog') return '#1a4f96';
            if (palette === 'cat') return '#9a2d68';
            return '#0c7b62';
        }

        function chartHasKeyword(item, keyword) {
            return !keyword || (item.reportKeywords || []).some(value => String(value || '') === keyword);
        }

        function clearKeywordFilter() {
            applyKeywordFilter('');
        }

        function applyKeywordFilter(keyword) {
            selectedKeyword = selectedKeyword === keyword ? '' : keyword;
            currentPage = 1;
            selectedId = '';
            const content = document.getElementById('detailContent');
            const empty = document.getElementById('detailEmpty');
            content.hidden = true;
            empty.hidden = false;
            empty.textContent = selectedKeyword ? `正在显示包含“${selectedKeyword}”的病例。` : '点击左侧记录查看详情。';
            ensureHeatmapsRendered();
            renderRows();
            const first = filteredCharts()[0];
            if (first) selectChart(first.id);
        }

        function keywordHeatmapItems() {
            const scope = charts.filter(item =>
                (!selectedType || item.chartType === selectedType) &&
                chartMatchesDate(item)
            );
            const counts = new Map();
            scope.forEach(item => {
                const keywords = new Set((item.reportKeywords || []).map(value => String(value || '').trim()).filter(Boolean));
                keywords.forEach(keyword => counts.set(keyword, (counts.get(keyword) || 0) + 1));
            });
            return {
                total: scope.length,
                points: [...counts.entries()]
                    .map(([name, count]) => {
                        const percentage = scope.length ? count / scope.length * 100 : 0;
                        return {
                            name,
                            value: count,
                            colorValue: percentage,
                            color: heatmapColor(percentage),
                            selected: name === selectedKeyword,
                            opacity: selectedKeyword && name !== selectedKeyword ? .38 : 1,
                            dataLabels: { style: { color: heatmapInk(percentage) } },
                            custom: { count, total: scope.length, percentage }
                        };
                    })
                    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'zh-CN'))
            };
        }

        function renderKeywordHeatmap() {
            const card = document.getElementById('keywordHeatmapCard');
            const container = document.getElementById('keywordHeatmap');
            const scale = document.getElementById('keywordHeatmapScale');
            const scopeLabel = document.getElementById('keywordHeatmapScope');
            const filterChip = document.getElementById('keywordFilterChip');
            card.hidden = trashMode;
            if (trashMode) return;

            const { total, points } = keywordHeatmapItems();
            const typeText = selectedType ? `${TYPE_LABELS[selectedType]}牙表` : '全部病例';
            const dateText = dateFilterLabel();
            scopeLabel.textContent = dateText ? `${typeText} · ${dateText} · ${total} 份` : `${typeText} · ${total} 份`;
            filterChip.hidden = !selectedKeyword;
            filterChip.textContent = selectedKeyword ? `${selectedKeyword} ×` : '';
            filterChip.setAttribute('aria-label', selectedKeyword ? `清除${selectedKeyword}筛选` : '清除关键词筛选');
            container.setAttribute('aria-label', `${typeText}中各类牙表标记关键词出现百分比，共${total}份病例`);

            if (keywordHeatmapChart) {
                keywordHeatmapChart.destroy();
                keywordHeatmapChart = null;
            }
            container.classList.toggle('empty', !points.length);
            scale.hidden = !points.length;
            if (!points.length) {
                container.textContent = total ? '当前病例暂无标记关键词' : '当前范围暂无病例';
                return;
            }
            container.textContent = '';
            if (!window.Highcharts || !Highcharts.seriesTypes.treemap) {
                container.classList.add('empty');
                container.textContent = '热力图组件未能加载';
                return;
            }

            keywordHeatmapChart = Highcharts.chart(container, {
                chart: {
                    type: 'treemap',
                    backgroundColor: 'transparent',
                    spacing: [2, 2, 2, 2],
                    animation: false,
                    style: { fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif' }
                },
                title: { text: null },
                credits: { enabled: false },
                accessibility: { enabled: false },
                legend: { enabled: false },
                tooltip: {
                    useHTML: true,
                    borderWidth: 0,
                    borderRadius: 9,
                    backgroundColor: 'rgba(255,255,255,.97)',
                    shadow: { color: 'rgba(25,58,47,.16)', offsetX: 0, offsetY: 5, opacity: .16, width: 12 },
                    formatter: function () {
                        const data = this.point.custom;
                        return `<b>${this.point.name}</b><br><span>${data.count} / ${data.total} 份病例</span><br><b style="color:#0c7b62">${data.percentage.toFixed(2)}%</b>`;
                    }
                },
                plotOptions: {
                    series: {
                        animation: false,
                        cursor: 'pointer',
                        allowPointSelect: true,
                        point: {
                            events: {
                                click: function () {
                                    const keyword = this.name;
                                    setTimeout(() => applyKeywordFilter(keyword), 0);
                                    return false;
                                }
                            }
                        },
                        states: {
                            inactive: { opacity: 1 },
                            hover: { brightness: .04, borderWidth: 1 },
                            select: { borderColor: '#064c3d', borderWidth: 2, brightness: .08 }
                        }
                    }
                },
                series: [{
                    type: 'treemap',
                    name: '关键词出现率',
                    layoutAlgorithm: 'squarified',
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    data: points,
                    dataLabels: {
                        enabled: true,
                        allowOverlap: false,
                        padding: 5,
                        formatter: function () {
                            return `${this.point.name}<br/>${this.point.custom.percentage.toFixed(2)}%`;
                        },
                        style: {
                            color: '#143f34',
                            fontSize: '11px',
                            fontWeight: '650',
                            textOutline: 'none'
                        }
                    }
                }]
            });
        }

        function toothHeatmapData(type) {
            const cases = charts.filter(item =>
                item.chartType === type &&
                chartMatchesDate(item) &&
                chartHasKeyword(item, selectedKeyword)
            );
            const supported = cases.every(item => (
                Array.isArray(item.abnormalTeeth) &&
                (!selectedKeyword || (item.toothKeywords && typeof item.toothKeywords === 'object'))
            ));
            const rows = TOOTH_ROWS[type];
            const validTeeth = new Set([...rows.upper, ...rows.lower]);
            const counts = new Map([...validTeeth].map(tooth => [tooth, 0]));
            cases.forEach(item => {
                const abnormal = selectedKeyword
                    ? new Set(Object.entries(item.toothKeywords || {})
                        .filter(([, keywords]) => Array.isArray(keywords) && keywords.includes(selectedKeyword))
                        .map(([tooth]) => String(tooth))
                        .filter(tooth => validTeeth.has(tooth)))
                    : new Set((item.abnormalTeeth || []).map(String).filter(tooth => validTeeth.has(tooth)));
                abnormal.forEach(tooth => counts.set(tooth, counts.get(tooth) + 1));
            });
            const width = Math.max(rows.upper.length, rows.lower.length);
            const points = [];
            [rows.upper, rows.lower].forEach((teeth, rowIndex) => {
                const offset = (width - teeth.length) / 2;
                teeth.forEach((tooth, index) => {
                    const count = counts.get(tooth) || 0;
                    const percentage = cases.length ? count / cases.length * 100 : 0;
                    points.push({
                        x: index + offset,
                        y: rowIndex,
                        value: percentage,
                        name: tooth,
                        color: heatmapColor(percentage, type),
                        dataLabels: { style: { color: heatmapInk(percentage, type) } },
                        custom: { count, total: cases.length, percentage }
                    });
                });
            });
            return { total: cases.length, width, points, supported };
        }

        function renderToothHeatmap(type) {
            const container = document.getElementById(`${type}ToothHeatmap`);
            const scope = document.getElementById(`${type}ToothHeatmapScope`);
            const label = TYPE_LABELS[type];
            const { total, width, points, supported } = toothHeatmapData(type);
            scope.textContent = selectedKeyword
                ? `${label} · 病例数：${total} · ${selectedKeyword}`
                : `${label} · 病例数：${total}`;
            container.setAttribute('aria-label', `${label}单牙异常频率热力图，共${total}份病例`);
            if (toothHeatmapCharts[type]) {
                toothHeatmapCharts[type].destroy();
                toothHeatmapCharts[type] = null;
            }
            if (total && !supported) {
                container.classList.add('empty');
                container.textContent = '重启牙表服务后显示统计';
                return;
            }
            container.classList.toggle('empty', !total);
            if (!total) {
                container.textContent = `暂无${label}病例`;
                return;
            }
            container.textContent = '';
            if (!window.Highcharts || !Highcharts.seriesTypes.heatmap) {
                container.classList.add('empty');
                container.textContent = '热力图组件未能加载';
                return;
            }
            toothHeatmapCharts[type] = Highcharts.chart(container, {
                chart: {
                    type: 'heatmap',
                    backgroundColor: 'transparent',
                    plotBackgroundColor: 'transparent',
                    margin: [4, 2, 4, 2],
                    animation: false,
                    style: { fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif' }
                },
                title: { text: null },
                credits: { enabled: false },
                accessibility: { enabled: false },
                legend: { enabled: false },
                xAxis: {
                    min: -0.5,
                    max: width - 0.5,
                    visible: false
                },
                yAxis: {
                    categories: ['上颌', '下颌'],
                    min: -0.5,
                    max: 1.5,
                    reversed: true,
                    title: { text: null },
                    gridLineWidth: 0,
                    lineWidth: 0,
                    tickLength: 0,
                    labels: { enabled: false }
                },
                tooltip: {
                    useHTML: true,
                    borderWidth: 0,
                    borderRadius: 9,
                    backgroundColor: 'rgba(255,255,255,.97)',
                    formatter: function () {
                        const data = this.point.custom;
                        return `<b>${label} · ${this.point.name}牙</b><br><span>${data.count} / ${data.total} 份病例</span><br><b style="color:${heatmapAccent(type)}">${data.percentage.toFixed(2)}%</b>`;
                    }
                },
                plotOptions: {
                    series: {
                        animation: false,
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        states: { inactive: { opacity: 1 }, hover: { brightness: .04, borderWidth: 1 } }
                    }
                },
                series: [{
                    type: 'heatmap',
                    name: `${label}单牙异常频率`,
                    colsize: 1,
                    rowsize: 1,
                    data: points,
                    dataLabels: {
                        enabled: true,
                        allowOverlap: true,
                        formatter: function () {
                            return this.point.name;
                        },
                        style: {
                            color: '#143f34',
                            fontSize: '8px',
                            fontWeight: '650',
                            lineHeight: '10px',
                            textOutline: 'none'
                        }
                    }
                }]
            });
        }

        function renderToothHeatmaps() {
            const card = document.getElementById('toothHeatmapCard');
            card.hidden = trashMode;
            if (trashMode) return;
            renderToothHeatmap('dog');
            renderToothHeatmap('cat');
        }

        function updateSummary(renderCharts = true) {
            document.getElementById('totalCount').textContent = charts.length;
            const labels = document.querySelectorAll('.summary-strip span');
            labels[0].textContent = trashMode ? '回收站记录' : '全部牙表';
            labels[1].textContent = trashMode ? '自动清除' : '今日新增';
            document.getElementById('todayCount').textContent = trashMode
                ? '15天'
                : charts.filter(item => dateKey(item.createdAt) === todayKey()).length;
            if (renderCharts) refreshVisibleHeatmaps();
        }

        function filteredCharts() {
            const query = document.getElementById('searchInput').value.trim().toLowerCase();
            const result = charts.filter(item => (
                (!selectedType || item.chartType === selectedType) &&
                chartMatchesDate(item) &&
                (trashMode || chartHasKeyword(item, selectedKeyword)) &&
                (!query || [item.id, item.ownerName, item.petName, ...(item.reportKeywords || [])].some(value => String(value || '').toLowerCase().includes(query)))
            ));
            return result.sort((a, b) => {
                const left = a[sortKey] ?? '';
                const right = b[sortKey] ?? '';
                let comparison;
                if (sortKey === 'id') {
                    const leftId = Number(String(left).replace(/\D/g, '')) || 0;
                    const rightId = Number(String(right).replace(/\D/g, '')) || 0;
                    comparison = leftId - rightId;
                } else if (['createdAt', 'updatedAt', 'abnormalToothCount', 'examCount'].includes(sortKey)) {
                    comparison = Number(left) - Number(right);
                } else {
                    comparison = String(left).localeCompare(String(right), 'zh-CN', { numeric: true, sensitivity: 'base' });
                }
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        function updateSortHeaders() {
            document.querySelectorAll('.table-head [data-sort]').forEach(button => {
                const active = button.dataset.sort === sortKey;
                button.dataset.direction = active ? sortDirection : '';
                button.setAttribute('aria-pressed', String(active));
                button.title = active
                    ? `当前${sortDirection === 'asc' ? '升序' : '降序'}，点击切换`
                    : `按${button.textContent}排序`;
            });
        }

        function renderRows() {
            const items = filteredCharts();
            const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
            currentPage = Math.min(Math.max(1, currentPage), totalPages);
            const start = (currentPage - 1) * PAGE_SIZE;
            const pageItems = items.slice(start, start + PAGE_SIZE);
            const body = document.getElementById('recordsBody');
            body.innerHTML = '';
            document.getElementById('emptyState').hidden = items.length > 0;
            document.getElementById('recordsFooterText').textContent = `共 ${items.length} 条记录`;
            const pagination = document.getElementById('pagination');
            pagination.hidden = totalPages <= 1;
            document.getElementById('pageIndicator').textContent = `${currentPage} / ${totalPages}`;
            document.getElementById('prevPage').disabled = currentPage === 1;
            document.getElementById('nextPage').disabled = currentPage === totalPages;
            updateSortHeaders();

            pageItems.forEach(item => {
                    const row = makeElement('article', 'record-row' + (item.id === selectedId ? ' selected' : ''));
                    row.tabIndex = 0;
                    const examIdCell = makeElement('div', 'exam-id-cell');
                    examIdCell.append(
                        makeElement('strong', '', item.id || ''),
                        makeElement('span', '', item.medicalRecordId || '')
                    );
                    row.appendChild(examIdCell);
                    const patient = makeElement('div', 'record-patient');
                    const owner = item.ownerName || '未填写家长';
                    const pet = item.petName || '未填写动物';
                    patient.append(
                        makeElement('strong', item.ownerName ? '' : 'is-empty', owner),
                        makeElement('span', item.petName ? '' : 'is-empty', pet)
                    );
                    row.appendChild(patient);
                    row.appendChild(makeElement('span', 'species-cell', TYPE_LABELS[item.chartType] || ''));
                    const examCount = makeElement('span', 'exam-count-cell');
                    examCount.append(makeElement('b', '', String(item.examCount ?? '—')));
                    examCount.title = '历史检查次数';
                    row.appendChild(examCount);
                    const updated = makeElement('div', 'updated-cell');
                    updated.append(
                        makeElement('strong', '', formatDate(item.updatedAt)),
                        makeElement('span', '', formatTime(item.updatedAt))
                    );
                    row.appendChild(updated);
                    const percentage = Number(item.abnormalPercentage || 0);
                    const abnormal = makeElement('span', 'abnormal-count');
                    abnormal.append(
                        makeElement('b', '', String(item.abnormalToothCount || 0)),
                        document.createTextNode(` · ${percentage.toFixed(1)}%`)
                    );
                    row.appendChild(abnormal);
                    const actions = makeElement('div', 'row-actions');
                    if (trashMode) {
                        const restore = makeElement('button', 'row-restore', '恢复');
                        restore.type = 'button';
                        restore.addEventListener('click', event => restoreChart(item, event));
                        restore.addEventListener('dblclick', event => event.stopPropagation());
                        actions.appendChild(restore);
                    } else {
                        const view = makeElement('button', 'row-view', '查看');
                        view.type = 'button';
                        view.setAttribute('aria-label', `查看${item.petName || item.id}的牙表`);
                        view.addEventListener('click', event => {
                            event.stopPropagation();
                            openView(item.id);
                        });
                        view.addEventListener('dblclick', event => event.stopPropagation());
                        const followup = makeElement('button', 'row-followup', '引用');
                        followup.type = 'button';
                        followup.setAttribute('aria-label', `引用${item.petName || item.id}的牙表`);
                        followup.addEventListener('click', event => {
                            event.stopPropagation();
                            openFollowup(item.id);
                        });
                        followup.addEventListener('dblclick', event => event.stopPropagation());
                        const edit = makeElement('button', 'row-edit', '编辑');
                        edit.type = 'button';
                        edit.setAttribute('aria-label', `编辑${item.petName || item.id}的牙表`);
                        edit.addEventListener('click', event => {
                            event.stopPropagation();
                            openChart(item.id);
                        });
                        edit.addEventListener('dblclick', event => event.stopPropagation());
                        actions.append(view, followup, edit);
                    }
                    const remove = makeElement('button', 'row-delete');
                    remove.type = 'button';
                    fillDeleteButton(remove, trashMode ? `彻底删除${item.petName || item.id}` : `删除${item.petName || item.id}`);
                    remove.addEventListener('click', event => deleteChart(item, event));
                    remove.addEventListener('dblclick', event => event.stopPropagation());
                    actions.appendChild(remove);
                    row.appendChild(actions);
                    row.addEventListener('click', () => selectChart(item.id));
                    if (!trashMode) {
                        const modifiedToday = dateKey(item.updatedAt) === todayKey();
                        row.title = modifiedToday
                            ? '双击进入编写'
                            : '双击进入复查';
                        row.addEventListener('dblclick', () => {
                            if (modifiedToday) openChart(item.id);
                            else openFollowup(item.id);
                        });
                    }
                    row.addEventListener('keydown', event => {
                        if (event.key === 'Enter') selectChart(item.id);
                    });
                    body.appendChild(row);
            });
        }

        function applyExamCountsByMedicalRecord() {
            const idsByMedicalRecord = new Map();
            charts.forEach(item => {
                const medicalRecordId = item.medicalRecordId || item.id;
                if (!idsByMedicalRecord.has(medicalRecordId)) {
                    idsByMedicalRecord.set(medicalRecordId, new Set());
                }
                idsByMedicalRecord.get(medicalRecordId).add(item.id);
            });
            charts.forEach(item => {
                const medicalRecordId = item.medicalRecordId || item.id;
                item.examCount = idsByMedicalRecord.get(medicalRecordId)?.size || 1;
            });
        }

        function buildHistoryCheckEntries(records) {
            const byChartId = new Map();
            (Array.isArray(records) ? records : []).forEach(record => {
                const versions = (Array.isArray(record.versions) ? record.versions : [])
                    .slice()
                    .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
                const finalVersion = versions[0];
                if (!finalVersion) return;
                const previous = byChartId.get(record.id);
                if (!previous || Number(finalVersion.updatedAt) > Number(previous.finalVersion.updatedAt)) {
                    byChartId.set(record.id, {
                        chartId: record.id,
                        medicalRecordId: record.medicalRecordId,
                        finalVersion
                    });
                }
            });
            const entries = [...byChartId.values()];
            return entries.sort((a, b) => (
                Number(b.finalVersion.updatedAt) - Number(a.finalVersion.updatedAt)
            ));
        }

        async function selectChart(id) {
            selectedId = id;
            selectedDetail = null;
            renderRows();
            const empty = document.getElementById('detailEmpty');
            const content = document.getElementById('detailContent');
            empty.hidden = true;
            content.hidden = false;
            document.getElementById('versionTimeline').innerHTML = '<div class="version-loading">正在读取...</div>';
            try {
                const response = await DentalApi.fetch(`${API}/${id}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('读取版本失败');
                const detail = await response.json();
                if (selectedId !== id) return;
                selectedDetail = detail;
                renderDetailBasicInfo(detail);
                let relatedRecords = [detail];
                if (detail.medicalRecordId && !trashMode) {
                    try {
                        const relatedResponse = await DentalApi.fetch(
                            `api/medical-records/${encodeURIComponent(detail.medicalRecordId)}/charts`,
                            { cache: 'no-store' }
                        );
                        if (relatedResponse.ok) {
                            const related = await relatedResponse.json();
                            if (Array.isArray(related) && related.length) relatedRecords = related;
                        }
                    } catch (_) {
                        // 关联检查读取失败时，仍显示当前检查。
                    }
                }
                if (selectedId !== id) return;
                const timeline = document.getElementById('versionTimeline');
                timeline.innerHTML = '';
                const entries = buildHistoryCheckEntries(relatedRecords);
                const hasCurrentEntry = entries.some(entry => entry.chartId === id);
                entries.forEach((entry, index) => {
                    const { chartId, finalVersion } = entry;
                    const isCurrent = hasCurrentEntry
                        ? chartId === id
                        : index === 0;
                    const report = DentalReport.buildReport(finalVersion.inputData || {});
                    const group = makeElement('section', 'version-group');
                    group.classList.toggle('version-group--current', isCurrent);
                    const header = makeElement('button', 'version-group-header');
                    header.type = 'button';
                    header.setAttribute('aria-expanded', String(isCurrent));
                    header.title = '双击进入查看该次检查';
                    const stamp = makeElement(
                        'strong',
                        '',
                        `${formatDate(finalVersion.updatedAt)} ${formatTime(finalVersion.updatedAt)} · ${chartId}`
                    );
                    header.append(stamp, makeElement('i', '', '›'));
                    const panel = makeElement('div', 'version-group-panel');
                    panel.hidden = !isCurrent;
                    panel.title = '双击进入查看该次检查';
                    panel.append(
                        createVersionReportSection('所见', report.empty ? '' : report.findings),
                        createVersionReportSection('结论', report.empty ? '' : report.conclusion)
                    );
                    let clickTimer = null;
                    const openVersionView = event => {
                        event.preventDefault();
                        clearTimeout(clickTimer);
                        if (trashMode) return;
                        if (event.target.closest('.report-copy-btn')) return;
                        openView(chartId, finalVersion.version);
                    };
                    header.addEventListener('click', () => {
                        clearTimeout(clickTimer);
                        clickTimer = setTimeout(() => {
                            const expanded = header.getAttribute('aria-expanded') === 'true';
                            timeline.querySelectorAll('.version-group-header').forEach(item => item.setAttribute('aria-expanded', 'false'));
                            timeline.querySelectorAll('.version-group-panel').forEach(item => { item.hidden = true; });
                            if (!expanded) {
                                header.setAttribute('aria-expanded', 'true');
                                panel.hidden = false;
                            }
                        }, 180);
                    });
                    header.addEventListener('dblclick', openVersionView);
                    panel.addEventListener('dblclick', openVersionView);
                    group.append(header, panel);
                    timeline.appendChild(group);
                });
                if (!entries.length) {
                    timeline.appendChild(makeElement('div', 'version-empty', '暂无历史检查'));
                }
            } catch (error) {
                document.getElementById('versionTimeline').innerHTML = '';
                document.getElementById('versionTimeline').appendChild(makeElement('div', 'version-error', error.message));
            }
        }

        async function loadCharts() {
            const status = document.getElementById('historyStatus');
            heatmapFieldsLoaded = false;
            const cached = readChartsCache(trashMode);
            if (cached) applyCharts(cached, true);
            try {
                const response = await DentalApi.fetch(`${API}${trashMode ? '?trash=true' : ''}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('无法连接牙表服务');
                const rows = await response.json();
                writeChartsCache(trashMode, rows);
                applyCharts(rows);
            } catch (error) {
                if (cached) return;
                status.textContent = `读取失败：${error.message}`;
                status.style.color = '#c62828';
            }
        }

        function toggleExportMenu(forceOpen) {
            const menu = document.getElementById('exportBackupMenu');
            const button = document.getElementById('exportBackupButton');
            if (!menu || !button || button.disabled) return;
            const open = forceOpen === undefined ? !menu.classList.contains('open') : forceOpen;
            menu.classList.toggle('open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        function downloadBlob(blob, filename) {
            const href = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = href;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(href);
        }

        function examLabel(examNo) {
            return `A${String(examNo ?? '').padStart(7, '0')}`;
        }

        function formatExportDateTime(iso) {
            const time = Date.parse(iso);
            if (!Number.isFinite(time)) return iso ? String(iso) : '';
            return `${formatDate(time)} ${formatTime(time)}`;
        }

        function escapeXml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function excelOneLine(value) {
            return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/\s+/g, ' ').trim();
        }

        function excelCellText(value) {
            return escapeXml(excelOneLine(value));
        }

        function excelCells(values, styleId) {
            return values.map((value) =>
                `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${excelCellText(value)}</Data></Cell>`
            ).join('');
        }

        function buildExcelBackup(payload) {
            const charts = (Array.isArray(payload?.charts) ? payload.charts : [])
                .filter((chart) => !chart?.deleted_at);
            const header = ['检查编号', '家长', '动物', '品种', '修改时间', '所见', '结论'];
            const widths = [86, 78, 78, 42, 128, 260, 260];
            const solidBorder = [
                '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>',
                '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>',
                '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>',
                '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>'
            ].join('');
            const rows = [
                `<Row ss:AutoFitHeight="0" ss:Height="20">${excelCells(header, 'Header')}</Row>`
            ];
            charts.forEach((chart) => {
                const report = window.DentalReport?.buildReport?.(chart.input_data || {}) || {};
                rows.push(
                    `<Row ss:AutoFitHeight="0" ss:Height="18">${excelCells([
                        examLabel(chart.exam_no),
                        chart.owner_name || '',
                        chart.pet_name || '',
                        TYPE_LABELS[chart.chart_type] || chart.chart_type || '',
                        formatExportDateTime(chart.updated_at),
                        report.findings || '',
                        report.conclusion || ''
                    ], 'Data')}</Row>`
                );
            });
            return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Microsoft YaHei" ss:Size="10" ss:Color="#26342E"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>${solidBorder}</Borders>
   <Font ss:FontName="Microsoft YaHei" ss:Size="10" ss:Bold="1" ss:Color="#075E4B"/>
   <Interior ss:Color="#E5F4EF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Data">
   <Alignment ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>${solidBorder}</Borders>
   <Font ss:FontName="Microsoft YaHei" ss:Size="10" ss:Color="#26342E"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="牙表备份">
  <Table ss:ExpandedColumnCount="7" ss:ExpandedRowCount="${charts.length + 1}">
   ${widths.map((width) => `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`).join('')}
   ${rows.join('')}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
        }

        async function exportBackup(format) {
            toggleExportMenu(false);
            const button = document.getElementById('exportBackupButton');
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = '正在导出...';
            try {
                const response = await DentalApi.fetch('api/export', { cache: 'no-store' });
                if (!response.ok) {
                    const result = await response.json().catch(() => ({}));
                    throw new Error(result.message || '导出失败');
                }
                const dateStamp = new Date().toISOString().slice(0, 10);
                if (format === 'excel') {
                    const payload = await response.json();
                    const xml = '\uFEFF' + buildExcelBackup(payload);
                    downloadBlob(new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' }), `dentalchart-backup-${dateStamp}.xls`);
                } else {
                    const blob = await response.blob();
                    const disposition = response.headers.get('Content-Disposition') || '';
                    const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
                    downloadBlob(blob, match?.[1] || `dentalchart-backup-${dateStamp}.json`);
                }
                button.textContent = '导出完成';
            } catch (error) {
                alert(`导出失败：${error.message}`);
                button.textContent = '导出失败';
            } finally {
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                }, 1200);
            }
        }

        const FEEDBACK_MAX = 2000;
        const FEEDBACK_MAX_IMAGES = 3;
        const FEEDBACK_MAX_BYTES = 2 * 1024 * 1024;
        const FEEDBACK_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
        let feedbackLoaded = false;
        let feedbackSending = false;
        let feedbackDrafts = [];

        function feedbackPanelOpen() {
            return !document.getElementById('feedbackPanel')?.hidden;
        }

        function formatFeedbackTime(iso) {
            const time = Date.parse(iso);
            if (!Number.isFinite(time)) return '';
            return `${formatDate(time)} ${formatTime(time)}`;
        }

        function feedbackDraftBytes() {
            return feedbackDrafts.reduce((sum, item) => sum + (item.size || 0), 0);
        }

        function blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || '').replace(/^data:[^;]+;base64,/, ''));
                reader.onerror = () => reject(new Error('无法读取图片'));
                reader.readAsDataURL(blob);
            });
        }

        function canvasToBlob(canvas, type, quality) {
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('图片压缩失败'));
                }, type, quality);
            });
        }

        function loadImageElement(file) {
            return new Promise((resolve, reject) => {
                const url = URL.createObjectURL(file);
                const image = new Image();
                image.onload = () => {
                    URL.revokeObjectURL(url);
                    resolve(image);
                };
                image.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('无法读取图片'));
                };
                image.src = url;
            });
        }

        async function compressFeedbackImage(file, maxBytes) {
            if (file.size <= maxBytes && FEEDBACK_TYPES.has(file.type)) return file;
            if (file.type === 'image/gif') {
                throw new Error(file.size > maxBytes ? '图片合计不能超过 2MB' : '仅支持 JPG、PNG、GIF 或 WebP');
            }
            const image = await loadImageElement(file);
            let width = image.naturalWidth || image.width;
            let height = image.naturalHeight || image.height;
            const maxDim = 1600;
            if (Math.max(width, height) > maxDim) {
                const scale = maxDim / Math.max(width, height);
                width = Math.max(1, Math.round(width * scale));
                height = Math.max(1, Math.round(height * scale));
            }
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('图片压缩失败');
            let quality = 0.86;
            let blob = null;
            for (let attempt = 0; attempt < 6; attempt += 1) {
                canvas.width = width;
                canvas.height = height;
                context.fillStyle = '#fff';
                context.fillRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                blob = await canvasToBlob(canvas, 'image/jpeg', quality);
                if (blob.size <= maxBytes) break;
                if (quality > 0.55) quality -= 0.12;
                else {
                    width = Math.max(1, Math.round(width * 0.82));
                    height = Math.max(1, Math.round(height * 0.82));
                }
            }
            if (!blob || blob.size > maxBytes) throw new Error('图片合计不能超过 2MB');
            return new File([blob], (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
        }

        async function fileToFeedbackDraft(file, maxBytes) {
            if (!FEEDBACK_TYPES.has(file.type)) throw new Error('仅支持 JPG、PNG、GIF 或 WebP');
            const prepared = await compressFeedbackImage(file, maxBytes);
            const data = await blobToBase64(prepared);
            return {
                name: prepared.name || 'image.jpg',
                type: prepared.type,
                size: prepared.size,
                data,
                preview: URL.createObjectURL(prepared)
            };
        }

        function renderFeedbackDrafts() {
            const box = document.getElementById('feedbackDrafts');
            const attach = document.getElementById('feedbackAttach');
            box.innerHTML = '';
            box.hidden = !feedbackDrafts.length;
            feedbackDrafts.forEach((item, index) => {
                const draft = document.createElement('div');
                draft.className = 'feedback-draft';
                const image = document.createElement('img');
                image.src = item.preview;
                image.alt = item.name;
                image.title = '点击放大查看';
                image.addEventListener('click', () => {
                    if (item.preview && typeof window.openImageLightbox === 'function') {
                        window.openImageLightbox(item.preview, item.name || '反馈图片');
                    }
                });
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'feedback-draft-remove';
                remove.setAttribute('aria-label', `移除${item.name}`);
                remove.textContent = '×';
                remove.addEventListener('click', () => {
                    const [removed] = feedbackDrafts.splice(index, 1);
                    if (removed?.preview) URL.revokeObjectURL(removed.preview);
                    renderFeedbackDrafts();
                });
                draft.append(image, remove);
                box.appendChild(draft);
            });
            attach.disabled = feedbackDrafts.length >= FEEDBACK_MAX_IMAGES;
            const used = feedbackDraftBytes();
            const remain = Math.max(0, FEEDBACK_MAX_BYTES - used);
            attach.title = feedbackDrafts.length
                ? `已选 ${feedbackDrafts.length}/3 张，剩余 ${(remain / (1024 * 1024)).toFixed(2)}MB`
                : '添加图片，最多 3 张、合计 2MB';
        }

        function clearFeedbackDrafts() {
            feedbackDrafts.forEach((item) => {
                if (item.preview) URL.revokeObjectURL(item.preview);
            });
            feedbackDrafts = [];
            renderFeedbackDrafts();
        }

        async function addFeedbackFiles(fileList) {
            const files = [...fileList];
            if (!files.length) return;
            try {
                for (const file of files) {
                    if (feedbackDrafts.length >= FEEDBACK_MAX_IMAGES) {
                        setFeedbackStatus('一次最多发送 3 张图片', true);
                        break;
                    }
                    const remain = FEEDBACK_MAX_BYTES - feedbackDraftBytes();
                    if (remain <= 0) {
                        setFeedbackStatus('图片合计不能超过 2MB', true);
                        break;
                    }
                    feedbackDrafts.push(await fileToFeedbackDraft(file, remain));
                    renderFeedbackDrafts();
                }
            } catch (error) {
                setFeedbackStatus(error.message || '无法添加图片', true);
            }
        }

        function appendFeedbackMessage({ id = '', text, createdAt, mine = false, pending = false, welcome = false, images = [] }) {
            const list = document.getElementById('feedbackMessages');
            const bubble = document.createElement('div');
            bubble.className = 'feedback-msg';
            if (welcome) bubble.classList.add('feedback-msg--welcome');
            if (mine) bubble.classList.add('feedback-msg--mine');
            if (pending) bubble.classList.add('feedback-msg--pending');
            if (text) {
                const body = document.createElement('div');
                body.className = 'feedback-msg-text';
                body.textContent = text;
                bubble.appendChild(body);
            }
            if (images.length) {
                const gallery = document.createElement('div');
                gallery.className = 'feedback-msg-images';
                images.forEach((image) => {
                    const src = image.url || image.preview || '';
                    const wrap = document.createElement('button');
                    wrap.type = 'button';
                    wrap.title = '点击放大查看';
                    wrap.addEventListener('click', () => {
                        if (src && typeof window.openImageLightbox === 'function') {
                            window.openImageLightbox(src, image.name || '反馈图片');
                        }
                    });
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = image.name || '反馈图片';
                    wrap.appendChild(img);
                    gallery.appendChild(wrap);
                });
                bubble.appendChild(gallery);
            }
            const meta = document.createElement('div');
            meta.className = 'feedback-msg-meta';
            if (createdAt) {
                const time = document.createElement('time');
                time.textContent = formatFeedbackTime(createdAt);
                meta.appendChild(time);
            }
            if (mine && !welcome && id) attachFeedbackDelete(bubble, id, meta);
            if (meta.childNodes.length) bubble.appendChild(meta);
            list.appendChild(bubble);
            list.scrollTop = list.scrollHeight;
            return bubble;
        }

        function attachFeedbackDelete(bubble, id, meta) {
            if (!id || bubble.querySelector('.feedback-msg-delete')) return;
            bubble.dataset.id = id;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'feedback-msg-delete';
            button.title = '删除';
            button.setAttribute('aria-label', '删除这条反馈');
            button.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 7h10M9.5 7V5.8c0-.4.3-.8.8-.8h3.4c.4 0 .8.4.8.8V7M9 10v7M12 10v7M15 10v7M8 7l.7 12.2c0 .4.4.8.8.8h5c.4 0 .8-.4.8-.8L16 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            button.addEventListener('click', () => deleteFeedbackMessage(id, bubble));
            (meta || bubble).appendChild(button);
            if (meta && !meta.parentNode) bubble.appendChild(meta);
        }

        async function deleteFeedbackMessage(id, bubble) {
            if (!id || bubble.classList.contains('is-deleting')) return;
            bubble.classList.add('is-deleting');
            try {
                const response = await DentalApi.fetch(`api/feedback/${id}`, { method: 'DELETE' });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.message || '删除失败');
                bubble.remove();
                setFeedbackStatus('');
            } catch (error) {
                bubble.classList.remove('is-deleting');
                setFeedbackStatus(error.message || '删除失败', true);
            }
        }

        function setFeedbackStatus(text, isError = false) {
            const list = document.getElementById('feedbackMessages');
            let status = list.querySelector('.feedback-status');
            if (!text) {
                status?.remove();
                return;
            }
            if (!status) {
                status = document.createElement('div');
                status.className = 'feedback-status';
                list.appendChild(status);
            }
            status.classList.toggle('is-error', isError);
            status.textContent = text;
            list.scrollTop = list.scrollHeight;
        }

        function renderFeedbackMessages(items) {
            const list = document.getElementById('feedbackMessages');
            list.innerHTML = '';
            appendFeedbackMessage({
                text: '欢迎反馈使用问题或建议，我们会在后台查看。',
                welcome: true
            });
            (items || []).forEach((item) => {
                appendFeedbackMessage({
                    id: item.id,
                    text: item.message,
                    createdAt: item.created_at,
                    mine: true,
                    images: item.images || []
                });
            });
        }

        async function loadFeedbackMessages() {
            setFeedbackStatus('正在读取…');
            try {
                const response = await DentalApi.fetch('api/feedback', { cache: 'no-store' });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.message || '无法读取反馈');
                renderFeedbackMessages(result.messages || []);
                feedbackLoaded = true;
                setFeedbackStatus('');
            } catch (error) {
                if (!feedbackLoaded) renderFeedbackMessages([]);
                setFeedbackStatus(error.message || '暂时无法连接反馈服务', true);
            }
        }

        function toggleFeedbackPanel(forceOpen) {
            const panel = document.getElementById('feedbackPanel');
            const fab = document.getElementById('feedbackFab');
            const open = forceOpen === undefined ? panel.hidden : forceOpen;
            panel.hidden = !open;
            fab.classList.toggle('is-open', open);
            fab.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                loadFeedbackMessages();
                document.getElementById('feedbackInput').focus();
            }
        }

        async function sendFeedback(event) {
            event.preventDefault();
            if (feedbackSending) return;
            const input = document.getElementById('feedbackInput');
            const send = document.getElementById('feedbackSend');
            const message = input.value.trim();
            if (!message && !feedbackDrafts.length) return;
            if (message.length > FEEDBACK_MAX) {
                setFeedbackStatus(`最多 ${FEEDBACK_MAX} 字`, true);
                return;
            }
            feedbackSending = true;
            send.disabled = true;
            const pendingImages = feedbackDrafts.map((item) => ({
                name: item.name,
                preview: item.preview
            }));
            const pending = appendFeedbackMessage({
                text: message,
                createdAt: new Date().toISOString(),
                mine: true,
                pending: true,
                images: pendingImages
            });
            setFeedbackStatus('');
            input.value = '';
            document.getElementById('feedbackCount').textContent = `0 / ${FEEDBACK_MAX}`;
            const payload = {
                message,
                images: feedbackDrafts.map((item) => ({
                    name: item.name,
                    type: item.type,
                    data: item.data
                }))
            };
            feedbackDrafts = [];
            renderFeedbackDrafts();
            try {
                const response = await DentalApi.fetch('api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.message || '发送失败');
                pending.classList.remove('feedback-msg--pending');
                if (result.id) {
                    let meta = pending.querySelector('.feedback-msg-meta');
                    if (!meta) {
                        meta = document.createElement('div');
                        meta.className = 'feedback-msg-meta';
                        pending.appendChild(meta);
                    }
                    attachFeedbackDelete(pending, result.id, meta);
                }
                if (result.created_at) {
                    const time = pending.querySelector('time');
                    if (time) time.textContent = formatFeedbackTime(result.created_at);
                }
                pendingImages.forEach((item) => {
                    if (item.preview) URL.revokeObjectURL(item.preview);
                });
                feedbackLoaded = true;
            } catch (error) {
                pending.remove();
                input.value = message;
                document.getElementById('feedbackCount').textContent = `${message.length} / ${FEEDBACK_MAX}`;
                payload.images.forEach((item, index) => {
                    feedbackDrafts.push({
                        ...item,
                        size: Math.ceil((item.data.length * 3) / 4),
                        preview: pendingImages[index]?.preview || ''
                    });
                });
                renderFeedbackDrafts();
                setFeedbackStatus(error.message || '发送失败', true);
            } finally {
                feedbackSending = false;
                send.disabled = false;
                input.focus();
            }
        }

        document.getElementById('searchInput').addEventListener('input', () => {
            currentPage = 1;
            renderRows();
        });
        document.querySelectorAll('.table-head [data-sort]').forEach(button => {
            button.addEventListener('click', () => {
                if (sortKey === button.dataset.sort) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortKey = button.dataset.sort;
                    sortDirection = ['createdAt', 'updatedAt', 'id'].includes(sortKey) ? 'desc' : 'asc';
                }
                currentPage = 1;
                renderRows();
            });
        });
        document.querySelectorAll('#speciesFilters button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('#speciesFilters button').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                selectedType = button.dataset.type;
                currentPage = 1;
                renderRows();
                refreshVisibleHeatmaps();
            });
        });
        document.querySelectorAll('#dateFilters button').forEach(button => {
            button.addEventListener('click', () => {
                applyDateFilter(button.dataset.date || '');
            });
        });
        function onCustomDateChange() {
            const from = document.getElementById('dateFilterStart').value || '';
            const to = document.getElementById('dateFilterEnd').value || '';
            applyDateFilter(from || to ? 'custom' : '', from, to);
        }
        document.getElementById('dateFilterStart').addEventListener('change', onCustomDateChange);
        document.getElementById('dateFilterEnd').addEventListener('change', onCustomDateChange);
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderRows();
            }
        });
        document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage * PAGE_SIZE < filteredCharts().length) {
                currentPage += 1;
                renderRows();
            }
        });
        document.addEventListener('click', (event) => {
            const menu = document.getElementById('exportBackupMenu');
            if (menu && !menu.contains(event.target)) toggleExportMenu(false);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            if (feedbackPanelOpen()) toggleFeedbackPanel(false);
            else toggleExportMenu(false);
        });
        document.getElementById('feedbackForm').addEventListener('submit', sendFeedback);
        document.getElementById('feedbackAttach').addEventListener('click', () => {
            document.getElementById('feedbackFile').click();
        });
        document.getElementById('feedbackFile').addEventListener('change', (event) => {
            addFeedbackFiles(event.target.files || []);
            event.target.value = '';
        });
        document.getElementById('feedbackInput').addEventListener('paste', (event) => {
            const files = [...(event.clipboardData?.files || [])].filter((file) => FEEDBACK_TYPES.has(file.type));
            if (!files.length) return;
            event.preventDefault();
            addFeedbackFiles(files);
        });
        document.getElementById('feedbackInput').addEventListener('input', (event) => {
            document.getElementById('feedbackCount').textContent = `${event.target.value.length} / ${FEEDBACK_MAX}`;
        });
        document.getElementById('feedbackInput').addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                document.getElementById('feedbackForm').requestSubmit();
            }
        });
        syncDateFilterControls();
        window.DentalHistory = {
            show() {
                loadCharts();
            },
            invalidate() {
                try { sessionStorage.removeItem(CHARTS_CACHE_KEY); } catch (_) {}
            }
        };

