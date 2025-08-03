class CanvasExporter {
    static exportToHTML(widgets) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Canvas</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .widget { position: absolute; border-radius: 8px; }
    </style>
</head>
<body>
    <div id="canvas" style="position: relative; width: 100vw; height: 100vh;">
        ${widgets.map(widget => this.widgetToHTML(widget)).join('\n        ')}
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canvas.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    static widgetToHTML(widget) {
        const baseStyle = `left: ${widget.x}px; top: ${widget.y}px; width: ${widget.width}px; height: ${widget.height}px; background-color: ${widget.color}; display: flex; align-items: center; justify-content: center; color: white;`;

        switch (widget.constructor.name) {
            case 'BasicWidget':
                return `<div class="widget" style="${baseStyle}">${widget.name}</div>`;
            case 'TextWidget':
                return `<div class="widget" style="${baseStyle} font-size: ${widget.fontSize}px;">${widget.text}</div>`;
            case 'ImageWidget':
                if (widget.imageUrl) {
                    return `<div class="widget" style="${baseStyle} overflow: hidden;"><img src="${widget.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
                } else {
                    return `<div class="widget" style="${baseStyle}">📷</div>`;
                }
            default:
                return `<div class="widget" style="${baseStyle}">${widget.name}</div>`;
        }
    }

    static exportToPDF(widgets) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Canvas Export', 20, 20);

        widgets.forEach((widget, index) => {
            const y = 40 + (index * 20);
            doc.setFontSize(12);
            doc.text(`${widget.name} (${widget.x}, ${widget.y}) - ${widget.color}`, 20, y);
        });

        doc.save('canvas.pdf');
    }
}
