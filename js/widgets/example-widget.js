// js/badge-widget.js
import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class BadgeWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'badge');
        this.label = 'Badge';
        this.labelColor = '#ffffff';
        this.badgeColor = '#ff6b6b';
        this.fontSize = 14;
        this.bold = true;
        this.rounded = true;
        this.updateContent();
    }

    defineParameters() {
        super.defineParameters();
        this.parameters.backgroundColor.value = this.badgeColor;

        Object.assign(this.parameters, {
            label: { type: 'text', label: 'Label', value: this.label },
            labelColor: { type: 'color', label: 'Label Color', value: this.labelColor },
            fontSize: { type: 'range', label: 'Font Size', value: this.fontSize, min: 10, max: 48, step: 1 },
            bold: { type: 'checkbox', label: 'Bold Text', value: this.bold },
            rounded: { type: 'checkbox', label: 'Rounded Corners', value: this.rounded }
        });
    }

    updateContent() {
        this.element.innerHTML = `<div class="badge-label">${this.label}</div>`;

        const labelDiv = this.element.querySelector('.badge-label');
        Object.assign(labelDiv.style, {
            color: this.labelColor,
            fontSize: `${this.fontSize}px`,
            fontWeight: this.bold ? 'bold' : 'normal',
            textAlign: 'center',
            lineHeight: '1.2',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        Object.assign(this.element.style, {
            background: this.badgeColor,
            borderRadius: this.rounded ? '12px' : '0px'
        });
    }

    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);
        if (['label', 'labelColor', 'fontSize', 'bold', 'rounded', 'backgroundColor'].includes(prop)) {
            if (prop === 'backgroundColor') this.badgeColor = val;
            this[prop] = val;
            this.updateContent();
        }
    }
}

WidgetRegistry.register('badge', BadgeWidget, {
    label: 'Badge Widget',
    description: 'Custom label badge',
    defaultSize: { width: 100, height: 40 }
});

export default BadgeWidget;
