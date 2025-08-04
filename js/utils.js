export function pluckParamValues(widget) {
    const obj = {};
    Object.entries(widget.parameters).forEach(([k, p]) => (obj[k] = p.value));
    return obj;
}

export function downloadFile(content, name, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export function showExportStatus(msg) {
    const el = document.getElementById('exportStatus');
    if (!el) return;
    el.textContent = msg;
    el.style.color = msg.toLowerCase().includes('error') ? '#dc3545' : '#28a745';
    setTimeout(() => {
        el.textContent = '';
    }, 5000);
}
