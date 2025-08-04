import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class CalendarWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'calendar');

        this.startTime = 8;
        this.endTime = 17;
        this.granularity = 30;
        this.showTime = true;
        this.timePosition = 'left-top';

        this.textColor = '#000';
        this.labelColor = '#666';
        this.borderColor = '#ccc';

        // override default background
        this.parameters.backgroundColor.value = '#f8f9fa';
        this.applyPropertyChange('backgroundColor', '#f8f9fa');

        this.updateContent();
    }

    defineParameters() {
        super.defineParameters();
        Object.assign(this.parameters, {
            startTime: { type: 'int', label: 'Start Hour', value: this.startTime, min: 0, max: 23 },
            endTime: { type: 'int', label: 'End Hour', value: this.endTime, min: 1, max: 24 },
            granularity: {
                type: 'select',
                label: 'Granularity',
                value: this.granularity,
                options: [10, 15, 30, 60, 120].map(val => ({ value: val, label: `${val} min` }))
            },
            showTime: { type: 'checkbox', label: 'Show Hour Labels', value: this.showTime },
            timePosition: {
                type: 'select',
                label: 'Time Label Position',
                value: this.timePosition,
                options: [
                    { value: 'left-top', label: 'Left Top' },
                    { value: 'left-middle', label: 'Left Middle' },
                    { value: 'left-bottom', label: 'Left Bottom' },
                    { value: 'center-top', label: 'Center Top' },
                    { value: 'center-middle', label: 'Center Middle' },
                    { value: 'center-bottom', label: 'Center Bottom' },
                    { value: 'right-top', label: 'Right Top' },
                    { value: 'right-middle', label: 'Right Middle' },
                    { value: 'right-bottom', label: 'Right Bottom' }
                ]
            },
            textColor: { type: 'color', label: 'Text Color', value: this.textColor },
            labelColor: { type: 'color', label: 'Hour Label Color', value: this.labelColor },
            borderColor: { type: 'color', label: 'Border Color', value: this.borderColor },
            labelFontSize: {
                type: 'int',
                label: 'Hour Label Font Size',
                value: 12,
                min: 6,
                max: 32
            }

        });
    }

    updateContent() {
        const { startTime, endTime, granularity, showTime, timePosition, textColor, labelColor, borderColor } = this.parameters;
        const rows = [];

        const totalMinutes = (endTime.value - startTime.value) * 60;
        const slots = totalMinutes / granularity.value;

        const fs = this.parameters.labelFontSize.value;

        for (let i = 0; i < slots; i++) {
            const total = startTime.value * 60 + i * granularity.value;
            const hour = Math.floor(total / 60);
            const min = total % 60;
            const timeLabel = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

            const justify =
                timePosition.value.includes('left') ? 'flex-start' :
                    timePosition.value.includes('center') ? 'center' :
                        'flex-end';

            const align =
                timePosition.value.includes('top') ? 'flex-start' :
                    timePosition.value.includes('middle') ? 'center' :
                        'flex-end';

            rows.push(`
                <div style="
                    flex: 1;
                    display: flex;
                    justify-content: ${justify};
                    align-items: ${align};
                    border-bottom: 1px solid ${borderColor.value};
                    padding: 4px 8px;
                    color: ${textColor.value};
                    box-sizing: border-box;
                ">
                    ${showTime.value ? `<span style="color:${labelColor.value}; font-size: ${fs}px;">${timeLabel}</span>` : ''}
                </div>
            `);
        }

        this.element.innerHTML = `
            <div class="calendar-widget" style="
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                font-family: sans-serif;
                font-size: 14px;
            ">
                ${rows.join('')}
            </div>
        `;
    }

    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);

        const intProps = ['startTime', 'endTime', 'granularity', 'labelFontSize'];
        const colorProps = ['textColor', 'labelColor', 'borderColor'];

        if (intProps.includes(prop)) this[prop] = parseInt(val);
        if (colorProps.includes(prop)) this[prop] = val;
        if (prop === 'showTime') this.showTime = Boolean(val);
        if (prop === 'timePosition') this.timePosition = val;

        this.updateContent();
    }

}

WidgetRegistry.register('calendar', CalendarWidget, {
    label: 'Day Calendar',
    description: 'Displays a vertical day calendar with customizable times',
    defaultSize: { width: 200, height: 400 }
});

export default CalendarWidget;
