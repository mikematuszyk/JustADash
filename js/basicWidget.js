class BasicWidget extends Widget {
    constructor(id, name = 'Basic Widget', color = '#4CAF50') {
        super(id, name, color);
    }

    render() {
        const element = this.createElement();
        element.style.backgroundColor = this.color;
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.color = 'white';
        element.style.fontWeight = 'bold';
        element.innerHTML = `<span>${this.name}</span>` + element.innerHTML;
        return element;
    }

    getPropertiesHTML() {
        return `
            <div class="form-group">
                <label>Name:</label>
                <input type="text" id="widgetName" value="${this.name}">
            </div>
            <div class="form-group">
                <label>Color:</label>
                <input type="color" id="widgetColor" value="${this.color}">
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
        this.color = document.getElementById('widgetColor').value;
        this.width = parseInt(document.getElementById('widgetWidth').value);
        this.height = parseInt(document.getElementById('widgetHeight').value);

        // Update visual representation
        this.element.style.backgroundColor = this.color;
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.querySelector('span').textContent = this.name;
    }
}
