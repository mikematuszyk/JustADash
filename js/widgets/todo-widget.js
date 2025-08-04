import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class TodoWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'todo');

        // Initialize default properties
        this.rows = 5;
        this.showBullets = true;
        this.bulletStyle = 'disc';
        this.items = []; // Start empty

        this.updateContent();
    }

    defineParameters() {
        super.defineParameters();

        // Safe fallback if items not yet initialized
        if (!this.items) this.items = [];

        Object.assign(this.parameters, {
            rows: {
                type: 'int',
                label: 'Number of Rows',
                value: this.rows ?? 5,
                min: 1,
                max: 50
            },
            showBullets: {
                type: 'checkbox',
                label: 'Show Bullets',
                value: this.showBullets ?? true
            },
            bulletStyle: {
                type: 'select',
                label: 'Bullet Style',
                value: this.bulletStyle ?? 'disc',
                options: [
                    { value: 'disc', label: '● Disc' },
                    { value: 'circle', label: '○ Circle' },
                    { value: 'square', label: '■ Square' },
                    { value: 'dash', label: '– Dash' }
                ]
            },
            items: {
                type: 'textarea',
                label: 'List Items (one per line)',
                value: this.items.join('\n'),
                rows: 6
            }
        });
    }


    updateContent() {
        const numRows = this.parameters.rows.value;
        const items = this.parameters.items.value
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, numRows);

        const bullet = this.parameters.bulletStyle.value;
        const show = this.parameters.showBullets.value;

        const symbols = {
            disc: '•',
            circle: '◦',
            square: '▪',
            dash: '–'
        };

        const rows = [];
        for (let i = 0; i < numRows; i++) {
            const text = items[i] || '';
            const bulletSymbol = show ? `${symbols[bullet] || '•'} ` : '';
            rows.push(`<div class="todo-item" style="
            flex: 1;
            width: 100%;
            display: flex;
            align-items: center;
            padding: 0 8px;
            box-sizing: border-box;
            border-bottom: 1px solid #e0e0e0;
        ">${bulletSymbol}${text}</div>`);
        }

        this.element.innerHTML = `<div class="todo-list" style="
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    ">${rows.join('')}</div>`;

        Object.assign(this.element.style, {
            padding: '0',
            fontSize: '14px',
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
        });
    }


    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);

        if (['rows', 'showBullets', 'bulletStyle', 'items'].includes(prop)) {
            if (prop === 'rows') this.rows = parseInt(val);
            if (prop === 'showBullets') this.showBullets = Boolean(val);
            if (prop === 'bulletStyle') this.bulletStyle = val;
            if (prop === 'items') this.items = val.split('\n').map((s) => s.trim()).filter(Boolean);
            this.updateContent();
        }
    }
}

WidgetRegistry.register('todo', TodoWidget, {
    label: 'To‑Do List',
    description: 'A customizable to‑do checklist',
    defaultSize: { width: 220, height: 180 }
});

export default TodoWidget;
