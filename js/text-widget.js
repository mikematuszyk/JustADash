// js/text-widget.js
import BaseWidget from './base-widget.js';
import { WidgetRegistry } from './widget-registry.js';

class TextWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'text');
        this.text = 'Sample Text';
        this.fontSize = 16;
        this.textColor = '#333';
        this.backgroundColor = '#f0f0f0';
        this.fontWeight = 'normal';
        this.textAlign = 'center';
        this.element.style.padding = '8px';
        this.element.style.boxSizing = 'border-box';
        this.element.style.whiteSpace = 'normal';
        this.element.style.lineHeight = '1.2';
        this.updateContent();
    }
    defineParameters() {
        super.defineParameters();
        this.parameters.backgroundColor.value = '#f0f0f0';
        Object.assign(this.parameters, {
            text: { type: 'textarea', label: 'Text Content', value: this.text, rows: 3, maxlength: 500 },
            fontSize: { type: 'range', label: 'Font Size', value: this.fontSize, min: 8, max: 72, step: 1 },
            textColor: { type: 'color', label: 'Text Color', value: this.textColor },
            fontWeight: {
                type: 'select',
                label: 'Font Weight',
                value: this.fontWeight,
                options: [
                    { value: 'normal', label: 'Normal' },
                    { value: 'bold', label: 'Bold' },
                    { value: '300', label: 'Light' },
                    { value: '600', label: 'Semi-Bold' }
                ]
            },
            textAlign: {
                type: 'select',
                label: 'Text Align',
                value: this.textAlign,
                options: [
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' }
                ]
            }
        });
    }
    updateContent() {
        this.element.textContent = this.text;
        Object.assign(this.element.style, {
            fontSize: `${this.fontSize}px`,
            fontWeight: this.fontWeight,
            textAlign: this.textAlign,
            color: this.textColor,
            background: this.backgroundColor
        });
    }
    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);
        if (['text', 'fontSize', 'fontWeight', 'textAlign', 'textColor', 'backgroundColor'].includes(prop)) {
            this.updateContent();
        }
    }
}

WidgetRegistry.register('text', TextWidget, { label: 'Text Widget', description: 'Text container' });

export default TextWidget;
