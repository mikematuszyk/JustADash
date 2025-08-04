// js/image-widget.js
import BaseWidget from './base-widget.js';
import { WidgetRegistry } from '../widget-registry.js';

class ImageWidget extends BaseWidget {
    constructor(x, y, w, h) {
        super(x, y, w, h, 'image');

        this.imageSrc = '';
        this.borderRadius = 8;
        this.opacity = 1;
        this.objectFit = 'cover';

        // Create image element
        this.img = document.createElement('img');
        this.img.src = '';
        this.img.alt = 'Image';
        this.img.style.width = '100%';
        this.img.style.height = '100%';
        this.img.style.objectFit = this.objectFit;
        this.img.style.borderRadius = `${this.borderRadius}px`;
        this.img.style.opacity = this.opacity;
        this.img.style.display = 'none'; // Hide until imageSrc is set

        this.element.style.background = '#84fab0';
        this.element.appendChild(this.img);
        this.element.innerHTML += '<div class="image-placeholder" style="text-align:center; padding:10px;">📷<br>Image</div>';
    }

    defineParameters() {
        super.defineParameters();
        this.parameters.backgroundColor.value = '#84fab0';

        Object.assign(this.parameters, {
            imageSrc: {
                type: 'text',
                label: 'Image URL',
                value: this.imageSrc
            },
            borderRadius: {
                type: 'range',
                label: 'Border Radius',
                value: this.borderRadius,
                min: 0,
                max: 50,
                step: 1
            },
            opacity: {
                type: 'range',
                label: 'Opacity',
                value: this.opacity,
                min: 0.1,
                max: 1,
                step: 0.1
            },
            objectFit: {
                type: 'select',
                label: 'Image Fit',
                value: this.objectFit,
                options: [
                    { value: 'cover', label: 'Cover' },
                    { value: 'contain', label: 'Contain' },
                    { value: 'fill', label: 'Fill' },
                    { value: 'scale-down', label: 'Scale Down' }
                ]
            }
        });
    }

    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);

        if (prop === 'imageSrc') {
            this.imageSrc = val;
            this.img.src = val;
            this.img.style.display = val ? 'block' : 'none';
            const placeholder = this.element.querySelector('.image-placeholder');
            if (placeholder) placeholder.style.display = val ? 'none' : 'block';
        }

        if (prop === 'borderRadius') {
            this.borderRadius = val;
            this.img.style.borderRadius = `${val}px`;
        }

        if (prop === 'opacity') {
            this.opacity = val;
            this.img.style.opacity = val;
        }

        if (prop === 'objectFit') {
            this.objectFit = val;
            this.img.style.objectFit = val;
        }
    }

    updateContent() {
        // Clear any existing content
        this.element.innerHTML = '';

        // Create image element if src is provided
        if (this.imageSrc) {
            const img = document.createElement('img');
            img.src = this.imageSrc;
            img.alt = 'Widget Image';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = this.objectFit;
            img.style.borderRadius = `${this.borderRadius}px`;
            img.style.opacity = this.opacity;
            img.style.pointerEvents = 'none'; // <- Prevent the image from capturing mouse events

            // Optional: fallback if image fails
            img.onerror = () => {
                img.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'image-placeholder';
                fallback.innerHTML = '<div style="text-align:center;">❌<br>Image failed to load</div>';
                this.element.appendChild(fallback);
            };

            this.element.appendChild(img);
        } else {
            // If no imageSrc, show placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = '<div style="text-align:center;">📷<br>Image</div>';
            this.element.appendChild(placeholder);
        }

        // Apply background color always
        this.element.style.background = this.backgroundColor;
    }

    applyPropertyChange(prop, val) {
        super.applyPropertyChange(prop, val);
        if (['imageSrc', 'borderRadius', 'opacity', 'objectFit', 'backgroundColor'].includes(prop)) {
            this[prop] = val;
            this.updateContent();
        }
    }


}

WidgetRegistry.register('image', ImageWidget, {
    label: 'Image Widget',
    description: 'Displays an image with customizable fit and appearance'
});

export default ImageWidget;
