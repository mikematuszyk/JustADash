import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class CalendarWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'calendar');

        // Match sidebar defaults
        this.startTime = 6;
        this.endTime = 23;
        this.granularity = 60;
        this.showTime = true;
        this.timePosition = 'left-top';
        this.textColor = '#000000';
        this.labelColor = '#000000';
        this.borderColor = '#000000';

        // Important: also set label font size default here
        this.labelFontSize = 10;

        // Set base background
        this.deferInit = () => {
            this.parameters.backgroundColor.value = '#dfe4ff';
            this.applyPropertyChange('backgroundColor', '#dfe4ff');
            this.updateContent();
        };
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
                value: this.labelFontSize,
                min: 6,
                max: 32
            }

        });
    }

    updateContent() {
        const {
            startTime,
            endTime,
            granularity,
            showTime,
            timePosition,
            textColor,
            labelColor,
            borderColor,
            labelFontSize
        } = this.parameters;

        const rows = [];
        const totalMinutes = (endTime.value - startTime.value) * 60;
        const slots = totalMinutes / granularity.value;
        const fontSize = labelFontSize.value;

        const position = this.parameters.timePosition?.value || 'left-top';

        const justify =
            position.includes('left') ? 'flex-start' :
                position.includes('center') ? 'center' :
                    'flex-end';

        const align =
            position.includes('top') ? 'flex-start' :
                position.includes('middle') ? 'center' :
                    'flex-end';

        for (let i = 0; i < slots; i++) {
            const total = startTime.value * 60 + i * granularity.value;
            const hour = Math.floor(total / 60);
            const min = total % 60;
            const timeLabel = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

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
                ${showTime.value
                    ? `<span style="color: ${labelColor.value}; font-size: ${fontSize}px;">${timeLabel}</span>`
                    : ''}
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

        const visualProps = [
            'startTime', 'endTime', 'granularity',
            'showTime', 'timePosition',
            'textColor', 'labelColor', 'borderColor',
            'labelFontSize', 'backgroundColor'
        ];

        if (visualProps.includes(prop)) {
            this.updateContent();
        }
    }


}

WidgetRegistry.register('calendar', CalendarWidget, {
    label: 'Day Calendar',
    description: 'Displays a vertical day calendar with customizable times',
    defaultSize: { width: 200, height: 400 }
});

export default CalendarWidget;
