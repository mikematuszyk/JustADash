// js/widget-registry.js
export const WidgetRegistry = {
    widgets: new Map(),
    register(name, widgetClass, config = {}) {
        this.widgets.set(name, {
            class: widgetClass,
            label: config.label || name.charAt(0).toUpperCase() + name.slice(1),
            description: config.description || '',
            defaultSize: config.defaultSize || { width: 100, height: 80 }
        });
    },
    create(type, x, y, width, height) {
        const widgetInfo = this.widgets.get(type);
        if (!widgetInfo) throw new Error(`Widget type '${type}' not found`);
        const size = widgetInfo.defaultSize;
        return new widgetInfo.class(
            x,
            y,
            width || size.width,
            height || size.height
        );
    },
    getAll() {
        return Array.from(this.widgets.entries()).map(([key, value]) => ({
            type: key,
            ...value
        }));
    }
};
