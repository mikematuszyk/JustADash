class Widget {
    constructor(id, name = 'Widget', color = '#4CAF50') {
        this.id = id;
        this.name = name;
        this.color = color;
        this.x = 50;
        this.y = 50;
        this.width = 100;
        this.height = 100;
        this.element = null;
    }

    // Abstract method to be implemented by subclasses
    render() {
        throw new Error('render() method must be implemented by subclass');
    }

    // Create the DOM element for the widget
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'widget';
        this.element.id = this.id;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.remove();
        };
        this.element.appendChild(deleteBtn);

        // Add drag functionality
        this.makeDraggable();

        // Add click selection
        this.element.onclick = (e) => {
            e.stopPropagation();
            this.select();
        };

        return this.element;
    }

    makeDraggable() {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        this.element.onmousedown = (e) => {
            if (e.target.classList.contains('delete-btn')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = this.x;
            initialY = this.y;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            this.x = initialX + (e.clientX - startX);
            this.y = initialY + (e.clientY - startY);
            this.updatePosition();
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    updatePosition() {
        if (this.element) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
    }

    select() {
        document.querySelectorAll('.widget').forEach(w => w.classList.remove('selected'));
        this.element.classList.add('selected');
        window.widgetManager.selectWidget(this);
    }

    remove() {
        window.widgetManager.removeWidget(this.id);
    }

    // Serialize widget data for saving
    toJSON() {
        return {
            id: this.id,
            type: this.constructor.name,
            name: this.name,
            color: this.color,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // Restore widget data from JSON
    fromJSON(data) {
        this.name = data.name;
        this.color = data.color;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
    }
}
