// js/base-widget.js
import { store } from './state.js';
import { WidgetRegistry } from './widget-registry.js';

class BaseWidget {
    constructor(x = 50, y = 50, width = 100, height = 80, type = 'basic') {
        this.id = `widget_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.zIndex = store.nextZIndex++;

        this.selected = this.dragging = this.resizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeData = null;

        this.defineParameters();
        this.createDOMElement();
        this.attachEventListeners();
    }

    /* ----- Parameter schema ---------------------------------- */
    defineParameters() {
        this.parameters = {
            x: { type: 'int', label: 'X Position', min: 0, value: this.x },
            y: { type: 'int', label: 'Y Position', min: 0, value: this.y },
            width: { type: 'int', label: 'Width', min: 20, max: 2000, value: this.width },
            height: { type: 'int', label: 'Height', min: 20, max: 2000, value: this.height },
            backgroundColor: { type: 'color', label: 'Background', value: '#667eea' }
        };
    }

    /* ----- DOM / Style --------------------------------------- */
    createDOMElement() {
        this.element = document.createElement('div');
        this.element.className = 'widget';
        this.element.id = this.id;
        this.updateStyles();
        this.updateContent();
        this.element.style.zIndex = this.zIndex;
    }

    get canvas() {
        return document.getElementById('canvas');
    }

    updateStyles() {
        Object.assign(this.element.style, {
            left: `${this.x}px`,
            top: `${this.y}px`,
            width: `${this.width}px`,
            height: `${this.height}px`
        });
    }

    updateContent() {
        this.element.textContent = this.type.charAt(0).toUpperCase() + this.type.slice(1);
    }

    /* ----- Event listeners (drag / resize / select) ----------- */
    attachEventListeners() {
        this.element.addEventListener('mousemove', this._handleCursor.bind(this));
        this.element.addEventListener('mouseleave', this._resetCursor.bind(this));
        this.element.addEventListener('mousedown', this._handleMouseDown.bind(this));
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.select();
        });
    }

    _handleCursor(e) {
        if (this.dragging || this.resizing) return;
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left,
            y = e.clientY - rect.top,
            t = 8;
        const onEdge = x <= t || y <= t || x >= rect.width - t || y >= rect.height - t;
        if (!onEdge) {
            this.element.style.cursor = 'move';
            return;
        }
        let dir = '';
        if (y <= t) dir += 'n';
        else if (y >= rect.height - t) dir += 's';
        if (x <= t) dir += 'w';
        else if (x >= rect.width - t) dir += 'e';
        this.element.style.cursor = `${dir}-resize`;
    }
    _resetCursor() {
        if (!this.dragging && !this.resizing) this.element.style.cursor = 'move';
    }

    _handleMouseDown(e) {
        e.stopPropagation();
        this.bringToFront();
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left,
            y = e.clientY - rect.top,
            t = 8;
        const onEdge = x <= t || y <= t || x >= rect.width - t || y >= rect.height - t;

        onEdge
            ? this.startEdgeResize(e, this.element.style.cursor.replace('-resize', ''))
            : this.startDrag(e);
    }

    /* ----- Z‑ordering ---------------------------------------- */
    bringToFront() {
        this.zIndex = store.nextZIndex++;
        this.element.style.zIndex = this.zIndex;
    }
    sendToBack() {
        this.zIndex = Math.min(...store.widgets.map((w) => w.zIndex)) - 1;
        this.element.style.zIndex = this.zIndex;
    }
    moveUp() {
        const higher = store.widgets.filter((w) => w.zIndex > this.zIndex).map((w) => w.zIndex);
        if (higher.length) {
            this.zIndex = Math.min(...higher) + 1;
            this.element.style.zIndex = this.zIndex;
        }
    }
    moveDown() {
        const lower = store.widgets.filter((w) => w.zIndex < this.zIndex).map((w) => w.zIndex);
        if (lower.length) {
            this.zIndex = Math.max(...lower) - 1;
            this.element.style.zIndex = this.zIndex;
        }
    }

    /* ----- Drag ------------------------------------------------ */
    startDrag(e) {
        this.dragging = true;
        this.element.classList.add('dragging');
        const rect = this.canvas.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left - this.x,
            y: e.clientY - rect.top - this.y
        };
        this.element.style.cursor = 'grabbing';
        document.addEventListener('mousemove', (this._drag = this._doDrag.bind(this)));
        document.addEventListener('mouseup', (this._drop = this.stopDrag.bind(this)));
    }
    _doDrag(e) {
        if (!this.dragging) return;
        const rect = this.canvas.getBoundingClientRect();
        const newX = e.clientX - rect.left - this.dragOffset.x;
        const newY = e.clientY - rect.top - this.dragOffset.y;
        this.x = Math.max(0, Math.min(newX, this.canvas.offsetWidth - this.width));
        this.y = Math.max(0, Math.min(newY, this.canvas.offsetHeight - this.height));
        this.parameters.x.value = this.x;
        this.parameters.y.value = this.y;
        this.updateStyles();
        if (this.selected && window.updateWidgetParameter) this.updateSidebarValues();
    }
    stopDrag() {
        this.dragging = false;
        this.element.classList.remove('dragging');
        this.element.style.cursor = 'move';
        document.removeEventListener('mousemove', this._drag);
        document.removeEventListener('mouseup', this._drop);
    }

    /* ----- Resize --------------------------------------------- */
    startEdgeResize(e, dir) {
        this.resizing = true;
        this.element.classList.add('resizing');
        this.element.style.cursor = `${dir}-resize`;
        this.resizeData = {
            dir,
            startX: e.clientX,
            startY: e.clientY,
            startW: this.width,
            startH: this.height,
            startL: this.x,
            startT: this.y
        };
        document.addEventListener('mousemove', (this._resize = this._doResize.bind(this)));
        document.addEventListener('mouseup', (this._stopResize = this.stopResize.bind(this)));
    }
    _doResize(e) {
        if (!this.resizing) return;
        const { dir, startX, startY, startW, startH, startL, startT } = this.resizeData;
        let dX = e.clientX - startX,
            dY = e.clientY - startY,
            w = startW,
            h = startH,
            x = startL,
            y = startT;
        if (dir.includes('e')) w = Math.max(20, startW + dX);
        else if (dir.includes('w')) {
            w = Math.max(20, startW - dX);
            x = startL + (startW - w);
        }
        if (dir.includes('s')) h = Math.max(20, startH + dY);
        else if (dir.includes('n')) {
            h = Math.max(20, startH - dY);
            y = startT + (startH - h);
        }
        x = Math.max(0, Math.min(x, this.canvas.offsetWidth - w));
        y = Math.max(0, Math.min(y, this.canvas.offsetHeight - h));
        Object.assign(this, { x, y, width: w, height: h });
        Object.assign(this.parameters, {
            x: { ...this.parameters.x, value: x },
            y: { ...this.parameters.y, value: y },
            width: { ...this.parameters.width, value: w },
            height: { ...this.parameters.height, value: h }
        });
        this.updateStyles();
        this.updateContent();
        if (this.selected) this.updateSidebarValues();
    }
    stopResize() {
        this.resizing = false;
        this.element.classList.remove('resizing');
        this.element.style.cursor = 'move';
        document.removeEventListener('mousemove', this._resize);
        document.removeEventListener('mouseup', this._stopResize);
    }

    /* ----- Properties & parameters ---------------------------- */
    updateSidebarValues() {
        ['x', 'y', 'width', 'height'].forEach((id) => {
            const el = document.getElementById(`param_${id}`);
            if (el) el.value = this[id];
        });
    }
    updateProperty(prop, val) {
        const p = this.parameters[prop];
        if (p) {
            if (['int'].includes(p.type)) val = parseInt(val) || 0;
            if (['float', 'number'].includes(p.type)) val = parseFloat(val) || 0;
            if (p.type === 'checkbox') val = Boolean(val);
            p.value = val;
        }
        this[prop] = val;
        this.applyPropertyChange(prop, val);
    }
    applyPropertyChange(prop, val) {
        if (['x', 'y', 'width', 'height'].includes(prop)) this.updateStyles();
        if (prop === 'backgroundColor') {
            this.element.style.background = val;
            this.element.style.backgroundImage = 'none';
        }
    }

    showSidePanel() {
        const side = document.getElementById('sidepanel');
        side.innerHTML = `<div class="section"><h3>${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Widget</h3></div>`;

        Object.entries(this.parameters).forEach(([key, p]) => {
            const group = document.createElement('div');
            group.className = 'control-group';

            const label = document.createElement('label');
            label.textContent = p.label;
            group.appendChild(label);

            let input;

            if (p.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = p.rows || 3;
                input.maxLength = p.maxlength || 500;
            } else if (p.type === 'range') {
                input = document.createElement('input');
                input.type = 'range';
                input.min = p.min;
                input.max = p.max;
                input.step = p.step || 1;
            } else if (p.type === 'number' || p.type === 'int' || p.type === 'float') {
                input = document.createElement('input');
                input.type = 'number';
                input.min = p.min;
                input.max = p.max;
                input.step = p.step || 1;
            } else if (p.type === 'color' || p.type === 'text') {
                input = document.createElement('input');
                input.type = p.type;
            } else if (p.type === 'checkbox') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = p.value;
            } else if (p.type === 'select') {
                input = document.createElement('select');
                p.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    input.appendChild(option);
                });
            }

            if (!input) {
                console.warn(`Unknown parameter type: ${p.type} (key: ${key})`);
                return;
            }

            input.id = `param_${key}`;

            if (input.type === 'checkbox') {
                input.checked = p.value;
            } else {
                input.value = p.value;
            }

            input.addEventListener('input', (e) => {
                const newVal = input.type === 'checkbox' ? input.checked : e.target.value;
                this.updateProperty(key, newVal);
            });

            group.appendChild(input);
            side.appendChild(group);
        });

        // Add remove button
        const removeSection = document.createElement('div');
        removeSection.className = 'section';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '🗑️ Remove Widget';
        removeBtn.className = 'btn btn-danger';
        removeBtn.style.marginTop = '1em';
        removeBtn.addEventListener('click', () => {
            const i = store.widgets.indexOf(this);
            if (i !== -1) {
                store.widgets.splice(i, 1);
            }
            if (store.selectedWidget === this) {
                store.selectedWidget = null;
            }
            this.destroy();
            const side = document.getElementById('sidepanel');
            side.innerHTML = '';
            if (window.updateWidgetList) window.updateWidgetList();
        });

        removeSection.appendChild(removeBtn);
        side.appendChild(removeSection);

    }


    /* ----- Selection ------------------------------------------ */
    select() {
        store.widgets.forEach((w) => {
            w.selected = false;
            w.element.classList.remove('selected');
        });
        this.selected = true;
        this.element.classList.add('selected');
        store.selectedWidget = this;
        this.showSidePanel();
        if (window.updateWidgetList) window.updateWidgetList();
    }

    /* ----- Destroy -------------------------------------------- */
    destroy() {
        this.element.remove();
    }

    /* ----- Serialization -------------------------------------- */
    serialize() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            zIndex: this.zIndex
        };
    }
}

// Register as "basic" rectangle
WidgetRegistry.register('basic', BaseWidget, {
    label: 'Basic Rectangle',
    description: 'Simple colored rectangle'
});

export default BaseWidget;
