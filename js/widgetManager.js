class WidgetManager {
    constructor() {
        this.widgets = new Map();
        this.canvas = document.getElementById('canvas');
        this.selectedWidget = null;
        this.widgetCounter = 0;
    }

    createWidget(type, x = 50, y = 50) {
        const id = `widget_${++this.widgetCounter}`;
        let widget;

        switch (type) {
            case 'basic':
                widget = new BasicWidget(id);
                break;
            case 'text':
                widget = new TextWidget(id);
                break;
            case 'image':
                widget = new ImageWidget(id);
                break;
            default:
                throw new Error(`Unknown widget type: ${type}`);
        }

        widget.x = x;
        widget.y = y;

        this.widgets.set(id, widget);
        this.canvas.appendChild(widget.render());

        return widget;
    }

    removeWidget(id) {
        const widget = this.widgets.get(id);
        if (widget) {
            if (widget.element) {
                widget.element.remove();
            }
            this.widgets.delete(id);
            if (this.selectedWidget === widget) {
                this.selectedWidget = null;
                this.updatePropertiesPanel();
            }
        }
    }

    selectWidget(widget) {
        this.selectedWidget = widget;
        this.updatePropertiesPanel();
    }

    updatePropertiesPanel() {
        const propertiesContent = document.getElementById('properties-content');

        if (!this.selectedWidget) {
            propertiesContent.innerHTML = '<p>Select a widget to edit properties</p>';
            return;
        }

        propertiesContent.innerHTML = this.selectedWidget.getPropertiesHTML();

        // Add event listeners for property updates
        const inputs = propertiesContent.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.selectedWidget.updateFromProperties();
            });
        });
    }

    saveCanvas() {
        const canvasData = {
            widgets: Array.from(this.widgets.values()).map(widget => widget.toJSON()),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(canvasData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canvas.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    loadCanvas(jsonData) {
        // Clear existing widgets
        this.clearCanvas();

        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            data.widgets.forEach(widgetData => {
                const widget = this.createWidget(
                    widgetData.type.replace('Widget', '').toLowerCase(),
                    widgetData.x,
                    widgetData.y
                );
                widget.fromJSON(widgetData);

                // Re-render with updated data
                widget.element.remove();
                this.canvas.appendChild(widget.render());
            });

        } catch (error) {
            alert('Error loading canvas: ' + error.message);
        }
    }

    clearCanvas() {
        this.widgets.forEach(widget => {
            if (widget.element) {
                widget.element.remove();
            }
        });
        this.widgets.clear();
        this.selectedWidget = null;
        this.updatePropertiesPanel();
    }

    getAllWidgets() {
        return Array.from(this.widgets.values());
    }
}
