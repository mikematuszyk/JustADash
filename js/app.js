// js/app.js
import { store } from './state.js';
import { WidgetRegistry } from './widget-registry.js';
import { pluckParamValues, downloadFile, showExportStatus } from './utils.js';
// Bring widgets into scope so they self-register
import './widgets/base-widget.js';
import './widgets/text-widget.js';
import './widgets/image-widget.js';
import './widgets/example-widget.js';
import './widgets/todo-widget.js';
import './widgets/date-widget.js';
import './widgets/quote-widget.js';
import './widgets/calendar-widget.js'



// ------------------------------------------------------------
//  Canvas presets
// ------------------------------------------------------------
const CANVAS_PRESETS = {
    'a4-portrait': { width: 630, height: 891 },
    'a4-landscape': { width: 891, height: 630 },
    'letter-portrait': { width: 647, height: 838 },
    'letter-landscape': { width: 838, height: 647 },
    poster: { width: 600, height: 800 },
    'business-card': { width: 252, height: 144 },
    presentation: { width: 800, height: 450 },
    'social-post': { width: 400, height: 400 },
    banner: { width: 728, height: 90 }
};

const canvas = document.getElementById('canvas');

// ------------------------------------------------------------
//  Init
// ------------------------------------------------------------
function initCanvas() {
    updateCanvasSize();
    populateWidgetSelector();
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas) deselectAllWidgets();
    });
    showCanvasProperties();
}

// ------------------------------------------------------------
//  General canvas helpers
// ------------------------------------------------------------
function applyPreset() {
    const p = CANVAS_PRESETS[document.getElementById('canvasPresets').value];
    if (p) {
        document.getElementById('canvasWidth').value = p.width;
        document.getElementById('canvasHeight').value = p.height;
        updateCanvasSize();
    }
}

function updateCanvasSize() {
    const w = +document.getElementById('canvasWidth').value;
    const h = +document.getElementById('canvasHeight').value;
    const canvas = document.getElementById('canvas');

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // If you're using class instead of duplicate IDs (which is preferred)
    document.querySelectorAll('.currentSize').forEach((el) => {
        el.textContent = `${w} × ${h}`;
    });
}


function updateCanvasColor() {
    const c = document.getElementById('canvasColor').value;
    canvas.style.backgroundColor = c;
}

// ------------------------------------------------------------
//  Widget operations
// ------------------------------------------------------------
function populateWidgetSelector() {
    const sel = document.getElementById('widgetType');
    sel.innerHTML = '';
    WidgetRegistry.getAll().forEach((w) => {
        const o = document.createElement('option');
        o.value = w.type;
        o.textContent = w.label;
        o.title = w.description;
        sel.appendChild(o);
    });
}

function addWidget() {
    const type = document.getElementById('widgetType').value;
    if (!type) return;
    const x = Math.random() * (canvas.offsetWidth - 150),
        y = Math.random() * (canvas.offsetHeight - 80);
    const w = WidgetRegistry.create(type, x, y);
    if (type === 'basic') w.element.style.background = w.parameters.backgroundColor.value;
    store.widgets.push(w);
    canvas.appendChild(w.element);
    updateWidgetCount();
    updateWidgetList();
}

function updateWidgetParameter(prop, val) {
    if (store.selectedWidget) store.selectedWidget.updateProperty(prop, val);
}
function deleteSelectedWidget() {
    if (store.selectedWidget) {
        store.widgets.splice(store.widgets.indexOf(store.selectedWidget), 1);
        store.selectedWidget.destroy();
        store.selectedWidget = null;
        showCanvasProperties();
        updateWidgetCount();
        updateWidgetList();
    }
}
function deselectAllWidgets() {
    store.widgets.forEach((w) => {
        w.selected = false;
        w.element.classList.remove('selected');
    });
    store.selectedWidget = null;
    showCanvasProperties();
    updateWidgetList();
}
function selectWidgetFromList(id) {
    const w = store.widgets.find((w) => w.id === id);
    if (w) w.select();
}

function updateWidgetCount() {
    document.querySelectorAll('#widgetCount').forEach((el) => (el.textContent = store.widgets.length));
}
function updateWidgetList() {
    const list = document.getElementById('widgetList');
    if (!store.widgets.length) {
        list.innerHTML = '<div class="widget-item">No widgets yet</div>';
        return;
    }
    const sorted = [...store.widgets].sort((a, b) => b.zIndex - a.zIndex);
    list.innerHTML = sorted
        .map(
            (w) => `<div class="widget-item ${w.selected ? 'selected' : ''}" onclick="selectWidgetFromList('${w.id}')"><span>${w.type.charAt(0).toUpperCase() + w.type.slice(1)} #${store.widgets.indexOf(w) + 1}</span><small style="opacity:.7;">Layer ${sorted.indexOf(w) + 1}</small></div>`
        )
        .join('');
}

// ------------------------------------------------------------
//  Save / Load (v2 schema)
// ------------------------------------------------------------
function saveProject() {
    const widgetStates = store.widgets.map((w) => w.serialize());
    const widgetProps = {};
    store.widgets.forEach((w) => {
        widgetProps[w.id] = pluckParamValues(w);
    });

    const data = {
        version: '2.0',
        canvas: {
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            backgroundColor: canvas.style.backgroundColor || '#fff'
        },
        widgetStates,
        widgetProps
    };

    downloadFile(JSON.stringify(data, null, 2), `canvas-${Date.now()}.json`, 'application/json');
    showExportStatus('Project saved.');
}

async function loadProject() {
    const f = document.getElementById('loadFile').files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Clear current
            store.widgets.forEach((w) => w.destroy());
            store.widgets.length = 0;
            store.selectedWidget = null;

            // Canvas
            document.getElementById('canvasWidth').value = data.canvas.width;
            document.getElementById('canvasHeight').value = data.canvas.height;
            updateCanvasSize();
            canvas.style.backgroundColor = data.canvas.backgroundColor;

            if (data.version === '2.0') {
                // v2
                for (const state of data.widgetStates) {
                    const props = data.widgetProps[state.id] || {};
                    const Cls = WidgetRegistry.widgets.get(state.type)?.class;
                    if (!Cls) continue;
                    const w = new Cls(state.x, state.y, state.width, state.height);
                    w.id = state.id;
                    w.zIndex = state.zIndex;
                    w.element.style.zIndex = w.zIndex;
                    Object.entries(props).forEach(([k, v]) => w.updateProperty(k, v));
                    store.widgets.push(w);
                    canvas.appendChild(w.element);
                    if (w.zIndex >= store.nextZIndex) store.nextZIndex = w.zIndex + 1;
                }
            }

            updateWidgetCount();
            updateWidgetList();
            showCanvasProperties();
            showExportStatus(`Loaded ${store.widgets.length} widget(s).`);
        } catch (err) {
            console.error(err);
            showExportStatus('Error loading file.');
        }
        document.getElementById('loadFile').value = '';
    };
    r.readAsText(f);
}

// ------------------------------------------------------------
//  Export
// ------------------------------------------------------------
function exportCanvas(formatOverride = null, dpiOverride = null) {
    const format = formatOverride || document.getElementById('exportFormat').value;
    const dpi = dpiOverride !== null ? parseInt(dpiOverride, 10) : parseInt(document.getElementById('exportDPI').value, 10);
    const canvasEl = document.getElementById('canvas');

    if (format === 'html') {
        exportAsHTML(canvasEl);
    } else if (format === 'pdf') {
        exportAsPDF(canvasEl, dpi);
    } else if (format === 'png') {
        exportAsPNG(canvasEl, dpi);
    } else {
        showExportStatus('❌ Unknown export format');
    }
}



function exportAsHTML(canvasEl) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Exported Canvas</title>
    <style>
        body { margin: 0; padding: 0; }
        #canvas {
            position: relative;
            width: ${canvasEl.style.width};
            height: ${canvasEl.style.height};
            background: ${canvasEl.style.backgroundColor || '#fff'};
        }
        .widget {
            position: absolute;
        }
    </style>
</head>
<body>
    ${canvasEl.outerHTML}
</body>
</html>`;
    downloadFile(htmlContent, 'canvas.html', 'text/html');
    showExportStatus('✅ Exported as HTML.');
}

function exportAsPNG(canvasEl, dpi) {
    const scaleFactor = dpi / 96; // html2canvas assumes 96 DPI

    html2canvas(canvasEl, {
        backgroundColor: null,
        scale: scaleFactor
    }).then((canvas) => {
        canvas.toBlob((blob) => {
            if (blob) {
                downloadFile(blob, `canvas-${dpi}dpi.png`, 'image/png');
                showExportStatus(`✅ Exported as PNG (${dpi} DPI).`);
            } else {
                showExportStatus('❌ PNG export failed.');
            }
        });
    });
}


async function exportAsPDF(canvasEl, dpi) {
    const scaleFactor = dpi / 96;

    const canvas = await html2canvas(canvasEl, {
        backgroundColor: null,
        scale: scaleFactor
    });
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: canvasEl.offsetWidth > canvasEl.offsetHeight ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`canvas-${dpi}dpi.pdf`);
    showExportStatus(`✅ Exported as PDF (${dpi} DPI).`);
}





// ------------------------------------------------------------
//  Sidepanel canvas info
// ------------------------------------------------------------
function showCanvasProperties() {
    const side = document.getElementById('sidepanel');
    side.innerHTML = `<div class="section"><h3>Canvas</h3><p id="currentSize">${canvas.offsetWidth} × ${canvas.offsetHeight}</p><p id="widgetCount">${store.widgets.length}</p></div>`;
}

// ------------------------------------------------------------
//  Expose helpers globally (for inline onclick handlers)
// ------------------------------------------------------------
window.applyPreset = applyPreset;
window.updateCanvasSize = updateCanvasSize;
window.saveProject = saveProject;
window.loadProject = loadProject;
window.exportCanvas = exportCanvas;
window.addWidget = addWidget;
window.updateWidgetParameter = updateWidgetParameter;
window.deleteSelectedWidget = deleteSelectedWidget;
window.selectWidgetFromList = selectWidgetFromList;
window.updateWidgetList = updateWidgetList;

// Boot
initCanvas();
