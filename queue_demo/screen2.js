// 排队系统 - 屏幕2 JavaScript（客户显示，只读）

class QueueDisplay {
    constructor() {
        this.heartCount = 2;
        this.abdomenCount = 2;
        this.initCells();
        this.loadFromLocalStorage();
        this.updateDisplay();
        this.generateQRCode();
        // 定期更新显示（每2秒）
        setInterval(() => {
            this.updateDisplay();
        }, 2000);
    }

    getTodayDate() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    initCells() {
        // 初始化心超区域（2列）
        const heartColumns = document.querySelectorAll('.heart-echo .cells-container');
        heartColumns.forEach(container => {
            for (let i = 0; i < 10; i++) {
                const cell = document.createElement('div');
                cell.className = 'queue-cell empty';
                cell.textContent = '';
                container.appendChild(cell);
            }
        });

        // 初始化腹超/其它区域（4列）
        const abdomenColumns = document.querySelectorAll('.abdomen-echo .cells-container');
        abdomenColumns.forEach(container => {
            for (let i = 0; i < 10; i++) {
                const cell = document.createElement('div');
                cell.className = 'queue-cell empty';
                cell.textContent = '';
                container.appendChild(cell);
            }
        });
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('queueSystem');
        if (saved) {
            const data = JSON.parse(saved);
            // 加载保存的数量设置
            this.heartCount = data.heartCount || 2;
            this.abdomenCount = data.abdomenCount || 2;
        }
    }

    updateDisplay() {
        const saved = localStorage.getItem('queueSystem');
        if (!saved) return;

        const data = JSON.parse(saved);
        const today = this.getTodayDate();
        
        // 如果日期不同，清空显示
        if (data.date !== today) {
            this.renderQueue([]);
            this.updateNotification([]);
            return;
        }

        const queueItems = data.queueItems || [];
        
        // 加载最新的数量设置
        this.heartCount = data.heartCount || 2;
        this.abdomenCount = data.abdomenCount || 2;
        
        this.renderQueue(queueItems);
        this.updateNotification(queueItems);
    }

    renderQueue(queueItems) {
        // 清空所有单元格
        document.querySelectorAll('.queue-cell').forEach(cell => {
            cell.className = 'queue-cell empty';
            cell.textContent = '';
            cell.dataset.queueId = '';
        });

        // 获取未完成的队列项
        const activeItems = queueItems.filter(item => !item.completed);

        // 分离心超和腹超项
        const heartItems = activeItems.filter(item => item.showInHeart);
        const abdomenItems = activeItems.filter(item => item.showInAbdomen);

        // 渲染心超区域
        this.renderColumn(heartItems, '.heart-echo');
        
        // 渲染腹超/其它区域
        this.renderColumn(abdomenItems, '.abdomen-echo');
    }

    renderColumn(items, selector) {
        const columns = document.querySelectorAll(`${selector} .cells-container`);
        let itemIndex = 0;
        const isAbdomenColumn = selector === '.abdomen-echo';

        columns.forEach(column => {
            const cells = column.querySelectorAll('.queue-cell');
            for (let i = 0; i < cells.length && itemIndex < items.length; i++) {
                const item = items[itemIndex];
                const cell = cells[i];
                
                cell.className = 'queue-cell';
                // 只有在腹超栏且包含"其它"时才添加蓝色边框
                if (isAbdomenColumn && item.hasOther) {
                    cell.classList.add('has-other');
                }
                if (item.checked) {
                    cell.classList.add('checked');
                }
                cell.textContent = item.number;
                cell.dataset.queueId = item.id;
                // 屏幕2只读，不允许拖拽
                cell.draggable = false;
                cell.style.cursor = 'default';

                itemIndex++;
            }
        });
    }

    updateNotification(queueItems) {
        // 第一部分：显示3位未检查的编号（剃毛等待）
        const waitingItems = queueItems
            .filter(item => !item.checked && !item.completed)
            .slice(0, 3);

        let shavedText = '请';
        if (waitingItems.length === 0) {
            shavedText += '至超声室附近等待剃毛。';
        } else {
            const numbers = waitingItems.map(item => item.number);
            const highlightedNumbers = numbers.map(num => `<span class="highlight-number">${num}</span>`).join('、');
            shavedText += `${highlightedNumbers}至超声室附近等待剃毛。`;
        }

        document.getElementById('notification-shaved').innerHTML = shavedText;

        // 第二部分：显示已检查的编号（检查准备）
        const checkedItems = queueItems.filter(item => item.checked && !item.completed);
        
        const checkedHeartItems = checkedItems.filter(item => item.showInHeart);
        const checkedAbdomenItems = checkedItems.filter(item => item.showInAbdomen);

        const displayHeartItems = checkedHeartItems.slice(0, this.heartCount);
        const displayAbdomenItems = checkedAbdomenItems.slice(0, this.abdomenCount);

        const allDisplayItems = [];
        
        for (let i = 0; i < this.abdomenCount; i++) {
            if (displayAbdomenItems[i]) {
                allDisplayItems.push(displayAbdomenItems[i].number);
            }
        }
        for (let i = 0; i < this.heartCount; i++) {
            if (displayHeartItems[i]) {
                allDisplayItems.push(displayHeartItems[i].number);
            }
        }

        let checkText = '请';
        if (allDisplayItems.length === 0) {
            checkText += '在超声室附近等待检查';
        } else {
            const highlightedNumbers = allDisplayItems.map(num => `<span class="highlight-number">${num}</span>`).join('、');
            checkText += `${highlightedNumbers}在超声室附近等待检查`;
        }

        document.getElementById('notification-check').innerHTML = checkText;
    }

    generateQRCode() {
        const currentUrl = window.location.href;
        const qrcodeElement = document.getElementById('qrcode');
        
        if (!qrcodeElement) return;

        // 等待QRCode库加载
        const tryGenerate = () => {
            if (typeof QRCode !== 'undefined') {
                // 清空容器
                qrcodeElement.innerHTML = '';
                // 创建一个canvas元素
                const canvas = document.createElement('canvas');
                QRCode.toCanvas(canvas, currentUrl, {
                    width: 150,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (error) => {
                    if (error) {
                        console.error('QR Code generation error:', error);
                        qrcodeElement.innerHTML = '<p style="font-size:12px;color:#999;">二维码生成失败</p>';
                    } else {
                        qrcodeElement.appendChild(canvas);
                    }
                });
            } else {
                // 如果库还没加载，等待一下再试
                setTimeout(tryGenerate, 100);
            }
        };
        
        tryGenerate();
    }
}

// 初始化显示
document.addEventListener('DOMContentLoaded', () => {
    new QueueDisplay();
});
