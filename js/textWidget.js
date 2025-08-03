class TextWidget extends Widget {
    constructor(id, name = 'Text Widget', color = '#2196F3') {
        super(id, name, color);
        this.text = 'Sample Text';
        this.fontSize = 16;
    }

    render() {
        const element = this.createElement();
        element.style.backgroundColor = this.color;
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.color = 'white';
        element.style.fontSize = this.fontSize + 'px';
        element.innerHTML = `<span>${this.text}</span>` + element.innerHTML;
        return element;
    }

    getPropertiesHTML() {
        return `
            <div class="form-group">
                <label>Name:</label>
                <input type="text" id="widgetName" value="${this.name}">
            </div>
            <div class="form-group">
                <label>Text:</label>
                <input type="text" id="widgetText" value="${this.text}">
            </div>
            <div class="form-group">
                <label>Background Color:</label>
                <input type="color" id="widgetColor" value="${this.color}">
            </div>
            <div class="form-group">
                <label>Font Size:</label>
                <input type="number" id="widgetFontSize" value="${this.fontSize}">
            </div>
            <div class="form-group">
                <label>Width:</label>
                <input type="number" id="widgetWidth" value="${this.width}">
            </div>
            <div class="form-group">
                <label>Height:</label>
                <input type="number" id="widgetHeight" value="${this.height}">
            </div>
        `;
    }

    updateFromProperties() {
        this.name = document.getElementById('widgetName').value;
        this.text = document.getElementById('widgetText').value;
        this.color = document.getElementById('widgetColor').value;
        this.fontSize = parseInt(document.getElementById('widgetFontSize').value);
        this.width = parseInt(document.getElementById('widgetWidth').value);
        this.height = parseInt(document.getElementById('widgetHeight').value);

        // Update visual representation
        this.element.style.backgroundColor = this.color;
        this.element.style.fontSize = this.fontSize + 'px';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.querySelector('span').textContent = this.text;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            text: this.text,
            fontSize: this.fontSize
        };
    }

    fromJSON(data) {
        super.fromJSON(data);
        this.text = data.text || 'Sample Text';
        this.fontSize = data.fontSize || 16;
    }
}
