// 排队系统 - 屏幕1 JavaScript

class QueueSystem {
    constructor() {
        this.currentNumber = 1;
        this.startNumber = 1;
        this.selectedOptions = new Set();
        this.queueItems = [];
        this.lastDate = this.getTodayDate();
        this.heartCount = 2; // 默认显示2例心超
        this.abdomenCount = 2; // 默认显示2例腹超
        this.initCells();
        this.loadFromLocalStorage();
        this.bindEvents();
        this.updateNotification();
        this.updateCurrentNumberDisplay();
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
            const today = this.getTodayDate();
            
            // 如果日期不同，重置编号
            if (data.date !== today) {
                this.currentNumber = data.startNumber || 1;
                this.startNumber = data.startNumber || 1;
                this.queueItems = [];
                this.lastDate = today;
            } else {
                this.currentNumber = data.currentNumber || (data.startNumber || 1);
                this.startNumber = data.startNumber || 1;
                this.queueItems = data.queueItems || [];
                this.lastDate = data.date;
                this.renderQueue();
            }
            // 加载保存的数量设置
            this.heartCount = data.heartCount || 2;
            this.abdomenCount = data.abdomenCount || 2;
        }
        // 更新下一个编号输入框
        document.getElementById('start-number-input').value = this.currentNumber;
        // 更新数量输入框
        document.getElementById('heart-count-input').value = this.heartCount;
        document.getElementById('abdomen-count-input').value = this.abdomenCount;
    }

    saveToLocalStorage() {
        const data = {
            date: this.getTodayDate(),
            currentNumber: this.currentNumber,
            startNumber: this.startNumber,
            queueItems: this.queueItems,
            heartCount: this.heartCount,
            abdomenCount: this.abdomenCount
        };
        localStorage.setItem('queueSystem', JSON.stringify(data));
    }

    bindEvents() {
        // 检查选项按钮点击事件
        document.querySelectorAll('.check-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const option = e.target.dataset.option;
                if (this.selectedOptions.has(option)) {
                    this.selectedOptions.delete(option);
                    e.target.classList.remove('selected');
                } else {
                    this.selectedOptions.add(option);
                    e.target.classList.add('selected');
                }
            });
        });

        // 生成排队号按钮
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateQueueNumber();
        });

        // 设置下一个编号按钮
        document.getElementById('set-start-btn').addEventListener('click', () => {
            this.setNextNumber();
        });

        // 下一个编号输入框回车事件
        document.getElementById('start-number-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setNextNumber();
            }
        });

        // 心超/腹超数量输入框事件
        document.getElementById('heart-count-input').addEventListener('change', (e) => {
            this.heartCount = parseInt(e.target.value) || 2;
            this.updateNotification();
            this.saveToLocalStorage();
        });

        document.getElementById('abdomen-count-input').addEventListener('change', (e) => {
            this.abdomenCount = parseInt(e.target.value) || 2;
            this.updateNotification();
            this.saveToLocalStorage();
        });

        // 使用事件委托处理单元格双击
        document.querySelectorAll('.cells-container').forEach(container => {
            container.addEventListener('dblclick', (e) => {
                const cell = e.target.closest('.queue-cell');
                if (cell && cell.dataset.queueId && !cell.classList.contains('empty')) {
                    const queueId = parseInt(cell.dataset.queueId);
                    const item = this.queueItems.find(i => i.id === queueId);
                    if (item) {
                        this.handleCellDoubleClick(item, cell);
                    }
                }
            });

            // 拖拽事件
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
            });
        });

        // 全局拖拽结束事件监听
        let draggedCell = null;
        let dragStartX = 0;
        let dragStartY = 0;
        const DRAG_DELETE_THRESHOLD = 50; // 拖动超过50像素即删除

        document.addEventListener('dragstart', (e) => {
            const cell = e.target;
            if (cell.classList.contains('queue-cell') && cell.dataset.queueId && !cell.classList.contains('empty')) {
                draggedCell = cell;
                // 记录拖动起始位置
                dragStartX = e.clientX;
                dragStartY = e.clientY;
            }
        }, true);

        document.addEventListener('dragend', (e) => {
            if (draggedCell && draggedCell.dataset.queueId) {
                // 计算拖动距离
                const deltaX = Math.abs(e.clientX - dragStartX);
                const deltaY = Math.abs(e.clientY - dragStartY);
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // 如果拖动距离超过阈值，删除该编号
                if (distance >= DRAG_DELETE_THRESHOLD) {
                    const queueId = parseInt(draggedCell.dataset.queueId);
                    const item = this.queueItems.find(i => i.id === queueId);
                    if (item) {
                        this.deleteItemFromColumn(item.id, draggedCell);
                    }
                } else {
                    // 恢复原位
                    this.renderQueue();
                }
                
                draggedCell = null;
                dragStartX = 0;
                dragStartY = 0;
            }
        });
    }

    generateQueueNumber() {
        if (this.selectedOptions.size === 0) {
            alert('请至少选择一个检查项目！');
            return;
        }

        // 检查日期是否变化
        const today = this.getTodayDate();
        if (today !== this.lastDate) {
            this.currentNumber = this.startNumber;
            this.lastDate = today;
            this.queueItems = [];
        }

        // 生成编号
        const number = `C${String(this.currentNumber).padStart(4, '0')}`;
        this.currentNumber++;

        // 确定显示位置
        const showInHeart = this.selectedOptions.has('heart');
        const showInAbdomen = this.selectedOptions.has('abdomen') || this.selectedOptions.has('other');

        // 创建队列项
        const queueItem = {
            id: Date.now(),
            number: number,
            showInHeart: showInHeart,
            showInAbdomen: showInAbdomen,
            hasHeart: this.selectedOptions.has('heart'),
            hasAbdomen: this.selectedOptions.has('abdomen'),
            hasOther: this.selectedOptions.has('other'),
            checked: false,
            completed: false
        };

        this.queueItems.push(queueItem);
        this.renderQueue();
        this.clearSelections();
        this.saveToLocalStorage();
        this.updateCurrentNumberDisplay();
    }

    clearSelections() {
        this.selectedOptions.clear();
        document.querySelectorAll('.check-option').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    renderQueue() {
        // 清空所有单元格
        document.querySelectorAll('.queue-cell').forEach(cell => {
            cell.className = 'queue-cell empty';
            cell.textContent = '';
            cell.dataset.queueId = '';
        });

        // 获取未完成的队列项
        const activeItems = this.queueItems.filter(item => !item.completed);

        // 分离心超和腹超项
        const heartItems = activeItems.filter(item => item.showInHeart);
        const abdomenItems = activeItems.filter(item => item.showInAbdomen);

        // 渲染心超区域
        this.renderColumn(heartItems, '.heart-echo');
        
        // 渲染腹超/其它区域
        this.renderColumn(abdomenItems, '.abdomen-echo');

        // 更新通知栏
        this.updateNotification();
    }

    renderColumn(items, selector) {
        const columns = document.querySelectorAll(`${selector} .cells-container`);
        let itemIndex = 0;
        // 判断当前是在腹超栏还是心超栏
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
                cell.draggable = true;
                
                // 添加拖拽事件
                cell.addEventListener('dragstart', (e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    cell.style.opacity = '0.5';
                });

                cell.addEventListener('dragend', (e) => {
                    cell.style.opacity = '1';
                });

                itemIndex++;
            }
        });
    }

    handleCellDoubleClick(item, cell) {
        // 切换checked状态
        item.checked = !item.checked;
        
        if (item.checked) {
            cell.classList.add('checked');
        } else {
            cell.classList.remove('checked');
        }
        
        this.saveToLocalStorage();
        this.updateNotification();
    }

    deleteItemFromColumn(itemId, cell) {
        const item = this.queueItems.find(i => i.id === itemId);
        if (!item) return;

        const isHeartColumn = cell.closest('.heart-echo') !== null;
        const isAbdomenColumn = cell.closest('.abdomen-echo') !== null;

        if (isHeartColumn) {
            // 从心超栏删除
            item.showInHeart = false;
            // 如果不再需要在任何地方显示，标记为完成
            if (!item.showInAbdomen) {
                item.completed = true;
            }
        } else if (isAbdomenColumn) {
            // 从腹超/其它栏删除
            item.showInAbdomen = false;
            // 如果不再需要在任何地方显示，标记为完成
            if (!item.showInHeart) {
                item.completed = true;
            }
        }

        this.renderQueue();
        this.saveToLocalStorage();
        this.updateNotification();
    }

    updateNotification() {
        // 第一部分：显示3位未检查的编号（剃毛等待）
        const waitingItems = this.queueItems
            .filter(item => !item.checked && !item.completed)
            .slice(0, 3);

        let shavedText = '请';
        if (waitingItems.length === 0) {
            shavedText += '至超声室附近等待剃毛。';
        } else {
            const numbers = waitingItems.map(item => item.number);
            // 只显示有编号的位置，自动隐藏空的，编号突出显示
            const highlightedNumbers = numbers.map(num => `<span class="highlight-number">${num}</span>`).join('、');
            shavedText += `${highlightedNumbers}至超声室附近等待剃毛。`;
        }

        document.getElementById('notification-shaved').innerHTML = shavedText;

        // 第二部分：显示已检查的编号（检查准备），根据设置的数量显示
        const checkedItems = this.queueItems.filter(item => item.checked && !item.completed);
        
        // 分离心超和腹超的已检查项
        const checkedHeartItems = checkedItems.filter(item => item.showInHeart);
        const checkedAbdomenItems = checkedItems.filter(item => item.showInAbdomen);

        // 根据设置的数量取对应数量的项
        const displayHeartItems = checkedHeartItems.slice(0, this.heartCount);
        const displayAbdomenItems = checkedAbdomenItems.slice(0, this.abdomenCount);

        // 组合显示列表：先腹超，后心超
        const allDisplayItems = [];
        
        // 先添加腹超项（只添加有值的）
        for (let i = 0; i < this.abdomenCount; i++) {
            if (displayAbdomenItems[i]) {
                allDisplayItems.push(displayAbdomenItems[i].number);
            }
        }
        // 再添加心超项（只添加有值的）
        for (let i = 0; i < this.heartCount; i++) {
            if (displayHeartItems[i]) {
                allDisplayItems.push(displayHeartItems[i].number);
            }
        }

        // 构建检查准备文本
        // 格式：请___、___、___、____在超声室附近等待检查
        // 自动隐藏空的编号位置，所有编号都用"、"分隔，编号突出显示
        let checkText = '请';
        if (allDisplayItems.length === 0) {
            checkText += '在超声室附近等待检查';
        } else {
            // 所有编号都用顿号"、"连接，编号突出显示
            const highlightedNumbers = allDisplayItems.map(num => `<span class="highlight-number">${num}</span>`).join('、');
            checkText += `${highlightedNumbers}在超声室附近等待检查`;
        }

        document.getElementById('notification-check').innerHTML = checkText;
    }

    setNextNumber() {
        const input = document.getElementById('start-number-input');
        const value = parseInt(input.value);
        
        if (isNaN(value) || value < 1) {
            alert('请输入有效的编号（必须大于等于1）！');
            input.value = this.currentNumber;
            return;
        }

        // 直接设置下一个编号
        this.currentNumber = value;
        
        this.saveToLocalStorage();
        this.updateCurrentNumberDisplay();
        
        // 显示成功提示
        const btn = document.getElementById('set-start-btn');
        const originalText = btn.textContent;
        btn.textContent = '已设置';
        btn.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 1500);
    }

    updateCurrentNumberDisplay() {
        const nextNumber = `C${String(this.currentNumber).padStart(4, '0')}`;
        document.getElementById('current-number').textContent = nextNumber;
    }
}

// 初始化系统
document.addEventListener('DOMContentLoaded', () => {
    new QueueSystem();
});
