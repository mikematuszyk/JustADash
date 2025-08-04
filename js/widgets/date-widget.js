import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class DateWidget extends BaseWidget {
    constructor(x, y, w, h) {
        // Initialize defaults first
        // BEFORE calling super() (because defineParameters will access them)
        // This ensures format/offset are defined when needed
        const defaultOffset = 0;
        const defaultFormat = 'YYYY-MM-DD';

        // Temporarily assign them to `this` before super()
        // This works because JS doesn't throw on premature assignments
        // and these values are needed early on
        super(x, y, w, h, 'date');
        this.dateOffset = defaultOffset;
        this.dateFormat = defaultFormat;

        // Set initial color
        this.parameters.backgroundColor.value = '#ffeaa7';
        this.applyPropertyChange('backgroundColor', '#ffeaa7');

        this.updateContent();
    }

    defineParameters() {
        super.defineParameters();

        Object.assign(this.parameters, {
            dateOffset: {
                type: 'int',
                label: 'Date Offset (days)',
                value: this.dateOffset,
                min: -365,
                max: 365
            },
            dateFormat: {
                type: 'select',
                label: 'Date Format',
                value: this.dateFormat,
                options: [
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    { value: 'YY-MM-DD', label: 'YY-MM-DD' },
                    { value: 'dddd, MMMM D', label: 'Full Weekday + Month Day' },
                    { value: 'ddd, MMM D, YYYY', label: 'Short Weekday, Month Day, Year' }
                ]
            },
            fontSize: {
                type: 'text', // text to support "auto" or numeric value
                label: 'Font Size',
                value: 'auto' // can be 'auto' or a number like '16'
            },
            fontStyle: {
                type: 'select',
                label: 'Font Style',
                value: 'normal',
                options: [
                    { value: 'normal', label: 'Normal' },
                    { value: 'bold', label: 'Bold' },
                    { value: 'italic', label: 'Italic' },
                    { value: 'bold italic', label: 'Bold Italic' }
                ]
            },
            textDecoration: {
                type: 'select',
                label: 'Text Decoration',
                value: 'none',
                options: [
                    { value: 'none', label: 'None' },
                    { value: 'underline', label: 'Underline' },
                    { value: 'line-through', label: 'Strikethrough' }
                ]
            }

        });
    }

    updateContent() {
        const offset = parseInt(this.parameters.dateOffset.value) || 0;
        const format = this.parameters.dateFormat.value;

        const date = new Date();
        date.setDate(date.getDate() + offset);
        const formatted = this.formatDate(date, format);

        const fontSize = this.parameters.fontSize.value;
        const fontStyle = this.parameters.fontStyle.value;
        const textDecoration = this.parameters.textDecoration.value;

        const isAuto = fontSize === 'auto';
        const computedFontSize = isAuto ? '1000%' : `${parseInt(fontSize)}px`;

        this.element.innerHTML = `
        <div class="date-widget" style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-size: ${computedFontSize};
            font-style: ${fontStyle.includes('italic') ? 'italic' : 'normal'};
            font-weight: ${fontStyle.includes('bold') ? 'bold' : 'normal'};
            text-decoration: ${textDecoration};
            font-family: sans-serif;
            text-align: center;
        ">
            <div style="
                max-width: 100%;
                max-height: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            ">${formatted}</div>
        </div>
    `;
    }


    formatDate(date, format) {
        if (!format) format = 'YYYY-MM-DD';

        const pad = (n) => n.toString().padStart(2, '0');
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'];

        return format
            .replace('YYYY', date.getFullYear())
            .replace('YY', String(date.getFullYear()).slice(2))
            .replace('MMMM', monthsFull[date.getMonth()])
            .replace('MMM', months[date.getMonth()])
            .replace('MM', pad(date.getMonth() + 1))
            .replace('M', date.getMonth() + 1)
            .replace('DD', pad(date.getDate()))
            .replace('D', date.getDate())
            .replace('dddd', weekdays[date.getDay()])
            .replace('ddd', weekdaysShort[date.getDay()]);
    }


    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);
        if (['dateOffset', 'dateFormat', 'fontSize', 'fontStyle', 'textDecoration'].includes(prop)) {
            if (prop === 'dateOffset') this.dateOffset = parseInt(val);
            if (prop === 'dateFormat') this.dateFormat = val;
            this.updateContent();
        }

    }
}

WidgetRegistry.register('date', DateWidget, {
    label: 'Date Widget',
    description: 'Displays the current date with optional offset and formatting',
    defaultSize: { width: 160, height: 50 }
});

export default DateWidget;
