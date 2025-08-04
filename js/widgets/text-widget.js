// js/text-widget.js
import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class TextWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'text');

        // Initial values
        this.text = 'Sample Text';
        this.fontSize = 16;
        this.textColor = '#333';
        this.backgroundColor = '#f0f0f0';
        this.fontWeight = 'normal';
        this.textAlign = 'center';

        // Default styles
        this.element.style.padding = '8px';
        this.element.style.boxSizing = 'border-box';
        this.element.style.background = this.backgroundColor;

        this.updateContent();
    }

    defineParameters() {
        super.defineParameters();
        Object.assign(this.parameters, {
            text: {
                type: 'textarea',
                label: 'Text Content',
                value: this.text,
                rows: 3,
                maxlength: 500
            },
            fontSize: {
                type: 'range',
                label: 'Font Size',
                value: this.fontSize,
                min: 8,
                max: 72,
                step: 1
            },
            textColor: {
                type: 'color',
                label: 'Text Color',
                value: this.textColor
            },
            backgroundColor: {
                type: 'color',
                label: 'Background Color',
                value: this.backgroundColor
            },
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
        this.element.style.background = this.backgroundColor;

        this.element.innerHTML = `
        <div class="text-content" style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: ${this.textAlign};
            font-size: ${this.fontSize}px;
            font-weight: ${this.fontWeight};
            color: ${this.textColor};
            white-space: pre-wrap;
            word-break: break-word;
            font-family: sans-serif;
        ">
            <div style="width: 100%;">${this.text}</div>
        </div>
    `;
    }

    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);

        if (['text', 'fontSize', 'fontWeight', 'textAlign', 'textColor', 'backgroundColor'].includes(prop)) {
            this[prop] = val;
            if (prop === 'fontSize') this.fontSize = parseInt(val);
            this.updateContent();
        }
    }
}

WidgetRegistry.register('text', TextWidget, {
    label: 'Text Widget',
    description: 'Text container'
});

export default TextWidget;
