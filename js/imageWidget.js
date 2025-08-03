class ImageWidget extends Widget {
    constructor(id, name = 'Image Widget', color = '#FF9800') {
        super(id, name, color);
        this.imageUrl = '';
    }

    render() {
        const element = this.createElement();
        element.style.backgroundColor = this.color;
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.overflow = 'hidden';

        if (this.imageUrl) {
            element.innerHTML = `<img src="${this.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` + element.innerHTML;
        } else {
            element.innerHTML = `<span style="color: white; font-size: 24px;">📷</span>` + element.innerHTML;
        }

        return element;
    }

    getPropertiesHTML() {
        return `
            <div class="form-group">
                <label>Name:</label>
                <input type="text" id="widgetName" value="${this.name}">
            </div>
            <div class="form-group">
                <label>Image URL:</label>
                <input type="url" id="widgetImageUrl" value="${this.imageUrl}">
            </div>
            <div class="form-group">
                <label>Background Color:</label>
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
        this.imageUrl = document.getElementById('widgetImageUrl').value;
        this.color = document.getElementById('widgetColor').value;
        this.width = parseInt(document.getElementById('widgetWidth').value);
        this.height = parseInt(document.getElementById('widgetHeight').value);

        // Update visual representation
        this.element.style.backgroundColor = this.color;
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';

        // Update image
        if (this.imageUrl) {
            this.element.innerHTML = `<img src="${this.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">` + this.element.querySelector('.delete-btn').outerHTML;
        } else {
            this.element.innerHTML = `<span style="color: white; font-size: 24px;">📷</span>` + this.element.querySelector('.delete-btn').outerHTML;
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            imageUrl: this.imageUrl
        };
    }

    fromJSON(data) {
        super.fromJSON(data);
        this.imageUrl = data.imageUrl || '';
    }
}
