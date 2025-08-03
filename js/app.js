// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Create global widget manager instance
    window.widgetManager = new WidgetManager();

    // Add widget button functionality
    document.getElementById('addWidget').addEventListener('click', function () {
        const randomX = Math.random() * 400 + 50;
        const randomY = Math.random() * 300 + 50;
        widgetManager.createWidget('basic', randomX, randomY);
    });

    // Widget type selection
    document.querySelectorAll('.widget-type').forEach(type => {
        type.addEventListener('click', function () {
            const widgetType = this.dataset.type;
            const randomX = Math.random() * 400 + 50;
            const randomY = Math.random() * 300 + 50;
            widgetManager.createWidget(widgetType, randomX, randomY);
        });
    });

    // Save canvas functionality
    document.getElementById('saveCanvas').addEventListener('click', function () {
        widgetManager.saveCanvas();
    });

    // Load canvas functionality
    document.getElementById('loadCanvas').addEventListener('click', function () {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                widgetManager.loadCanvas(e.target.result);
            };
            reader.readAsText(file);
        }
    });

    // Export functionality
    document.getElementById('exportHTML').addEventListener('click', function () {
        const widgets = widgetManager.getAllWidgets();
        CanvasExporter.exportToHTML(widgets);
    });

    document.getElementById('exportPDF').addEventListener('click', function () {
        const widgets = widgetManager.getAllWidgets();
        CanvasExporter.exportToPDF(widgets);
    });

    // Canvas click to deselect widgets
    document.getElementById('canvas').addEventListener('click', function (e) {
        if (e.target === this) {
            document.querySelectorAll('.widget').forEach(w => w.classList.remove('selected'));
            widgetManager.selectedWidget = null;
            widgetManager.updatePropertiesPanel();
        }
    });
});
