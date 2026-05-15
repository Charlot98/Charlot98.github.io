// 右侧栏：边框拖动移位，四角缩放尺寸（手机宽度时不启用）
function setupRightSidebarResize() {
    const el = document.getElementById('rightSidebar');
    if (!el) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const EDGE = 40;          // 边框/角感应区宽度
    const TOP_BAR = 0;
    const MIN_W = 280;
    const MIN_H = 200;
    const CENTER = () => window.innerWidth / 2;
    const MAX_RIGHT = () => window.innerWidth;
    const MAX_BOTTOM = () => window.innerHeight;

    function getRect() {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
    }

    function setRect(r) {
        el.style.left = r.left + 'px';
        el.style.top = r.top + 'px';
        el.style.width = r.width + 'px';
        el.style.height = r.height + 'px';
    }

    function zone(x, y, w, h, evt) {
        if (evt && el.contains(evt.target) && !evt.target.closest?.('button') && evt.target.closest?.('.section-header')) {
            return 'move';
        }
        if (evt && evt.target.closest?.('.right-sidebar-resize-triangle')) return 'br';
        const atR = x > w - EDGE, atB = y > h - EDGE;
        if (atR && atB) return 'br';
        return null;
    }

    el.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const z = zone(x, y, rect.width, rect.height, e);
        if (!z) return;
        e.preventDefault();
        e.stopPropagation();
        const startMouseX = e.clientX, startMouseY = e.clientY;
        let r = getRect();
        const startLeft = r.left, startTop = r.top, startW = r.width, startH = r.height;

        function clampMove(nr) {
            nr.left = Math.max(CENTER(), Math.min(MAX_RIGHT() - nr.width, nr.left));
            nr.top = Math.max(TOP_BAR, Math.min(MAX_BOTTOM() - nr.height, nr.top));
            nr.width = Math.min(nr.width, MAX_RIGHT() - nr.left);
            nr.height = Math.min(nr.height, MAX_BOTTOM() - nr.top);
        }

        function clampResize(nr) {
            if (nr.left < CENTER()) { nr.width += nr.left - CENTER(); nr.left = CENTER(); }
            if (nr.left + nr.width > MAX_RIGHT()) nr.width = MAX_RIGHT() - nr.left;
            if (nr.top < TOP_BAR) { nr.height += nr.top - TOP_BAR; nr.top = TOP_BAR; }
            if (nr.top + nr.height > MAX_BOTTOM()) nr.height = MAX_BOTTOM() - nr.top;
            nr.width = Math.max(MIN_W, nr.width);
            nr.height = Math.max(MIN_H, nr.height);
        }

        function onMove(ev) {
            const dx = ev.clientX - startMouseX, dy = ev.clientY - startMouseY;
            if (z === 'l' || z === 'r' || z === 't' || z === 'b' || z === 'move') {
                r = { left: startLeft + dx, top: startTop + dy, width: startW, height: startH };
                clampMove(r);
            } else {
                if (z === 'tl') {
                    r = { left: startLeft + dx, top: startTop + dy, width: startW - dx, height: startH - dy };
                } else if (z === 'tr') {
                    r = { left: startLeft, top: startTop + dy, width: startW + dx, height: startH - dy };
                } else if (z === 'bl') {
                    r = { left: startLeft + dx, top: startTop, width: startW - dx, height: startH + dy };
                } else {
                    r = { left: startLeft, top: startTop, width: startW + dx, height: startH + dy };
                }
                clampResize(r);
            }
            setRect(r);
        }

        function onUp() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        const cursors = { br: 'nwse-resize', move: 'default' };
        document.body.style.cursor = cursors[z] || '';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, true);

    el.addEventListener('mousemove', function(e) {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const z = zone(x, y, r.width, r.height, e);
        const cursors = { br: 'nwse-resize', move: 'default' };
        el.style.cursor = z ? (cursors[z] || '') : '';
    }, true);

    el.addEventListener('mouseleave', function() { el.style.cursor = ''; }, true);
}
