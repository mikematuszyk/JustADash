import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class QuoteWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'quote');
        this.quote = this.author = '';
        this.textColor = '#333';
        this.authorColor = '#555';
        this.backgroundColor = '#fff';
        this.showAuthor = true;
        this.quoteFontSize = 18;
        this.authorFontSize = 14;

        this.parameters.textColor.value = this.textColor;
        this.parameters.backgroundColor.value = this.backgroundColor;

        this.fetchQuote();
    }

    defineParameters() {
        super.defineParameters();
        Object.assign(this.parameters, {
            textColor: { type: 'color', label: 'Quote Text Color', value: this.textColor },
            authorColor: { type: 'color', label: 'Author Color', value: this.authorColor },
            showAuthor: { type: 'checkbox', label: 'Show Author', value: this.showAuthor },
            quoteFontSize: { type: 'int', label: 'Quote Font Size', value: this.quoteFontSize, min: 10, max: 64 },
            authorFontSize: { type: 'int', label: 'Author Font Size', value: this.authorFontSize, min: 8, max: 48 }
        });
    }

    async fetchQuote() {
        try {
            const resp = await fetch('https://quoteslate.vercel.app/api/quotes/random');
            const data = await resp.json();
            this.quote = data.quote;
            this.author = data.author;
        } catch (e) {
            console.error('Quote fetch failed', e);
            this.quote = 'Could not load quote';
            this.author = '';
        }
        this.updateContent();
    }


    updateContent() {
        const tc = this.parameters.textColor.value;
        const ac = this.parameters.authorColor.value;
        const bg = this.parameters.backgroundColor.value;
        const showAuthor = this.parameters.showAuthor.value;
        const qs = this.parameters.quoteFontSize.value;
        const as = this.parameters.authorFontSize.value;

        this.element.innerHTML = `
      <div style="
        width:100%;height:100%;padding:10px;box-sizing:border-box;
        background:${bg};color:${tc};display:flex;
        flex-direction:column;justify-content:center;
        align-items:center;text-align:center;
        overflow:hidden;font-family:serif;
      ">
        <div style="font-size:${qs}px;margin-bottom:${showAuthor ? '1em' : '0'};">
          “${this.quote}”
        </div>
        ${showAuthor ? `<div style="color:${ac};font-size:${as}px;">— ${this.author}</div>` : ''}
      </div>`;
    }

    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);
        if (['textColor', 'authorColor', 'backgroundColor', 'showAuthor', 'quoteFontSize', 'authorFontSize'].includes(prop)) {
            this[prop] = prop === 'showAuthor' ? Boolean(val) : prop.includes('Size') ? parseInt(val) : val;
            this.updateContent();
        }
    }
}

WidgetRegistry.register('quote', QuoteWidget, {
    label: 'Quote',
    description: 'Displays today’s quote (fast & CORS‑enabled)',
    defaultSize: { width: 280, height: 180 }
});

export default QuoteWidget;