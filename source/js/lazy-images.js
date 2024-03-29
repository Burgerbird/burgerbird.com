class ResponsiveImageLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '100px',
            transitionDuration: options.transitionDuration || '0.5s',
            transitionEffect: options.transitionEffect || 'opacity',
            defaultFormat: options.defaultFormat || 'webp',
            lazyLoad: options.lazyLoad !== undefined ? options.lazyLoad : true,
            lowQualityOnSlowNetwork: options.lowQualityOnSlowNetwork !== undefined ? options.lowQualityOnSlowNetwork : true,
            fallbackImage: options.fallbackImage,
            observeNetworkChanges: options.observeNetworkChanges !== undefined ? options.observeNetworkChanges : true,
        };
        this.networkSpeed = this.detectNetworkSpeed();
        this.observedImages = new Set();
        this.init();
        if (this.options.observeNetworkChanges && this.options.lowQualityOnSlowNetwork) {
            this.observeNetworkChanges();
        }
    }

    init() {
        this.applyToImages(document.querySelectorAll('img[data-from][data-to][data-steps]'));
    }

    detectNetworkSpeed() {
        if (navigator.connection && typeof navigator.connection.effectiveType === 'string') {
            return navigator.connection.effectiveType;
        }
        return null; // Unknown network speed
    }

    applyToImages(images) {
        images.forEach(img => {
            if (this.observedImages.has(img)) {
                return; // Skip images already observed
            }
            this.setupImage(img);
        });
    }

    setupImage(img) {
        if (this.options.lazyLoad) {
            img.setAttribute('loading', 'lazy');
        }
        img.style.transition = `${this.options.transitionEffect} ${this.options.transitionDuration} ease-out`;
        img.style.opacity = 0.5;
        this.setupIntersectionObserver(img);
        this.observedImages.add(img); // Mark image as observed
    }

    setupIntersectionObserver(img) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadOptimalImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: this.options.rootMargin });

            observer.observe(img);
        } else {
            this.loadOptimalImage(img);
        }
    }

    loadOptimalImage(img) {
        const currentWidth = img.clientWidth;
        const optimalSize = this.calculateOptimalSize(img, this.networkSpeed);
        const newPath = this.constructImagePath(img, optimalSize);
        const imgLoader = new Image();

        imgLoader.onload = () => {
            img.src = newPath;
            img.style.opacity = 1;
            this.observedImages.add(img); // Mark as successfully loaded
        };

        imgLoader.onerror = () => {
            if (this.options.fallbackImage) {
                img.src = this.options.fallbackImage;
            }
            console.error(`Failed to load image: ${newPath}, using fallback or original src.`);
            this.observedImages.add(img); // Prevent further attempts to reload this image
        };

        imgLoader.src = newPath;
    }

    calculateOptimalSize(img, networkSpeed) {
        const elementWidth = img.clientWidth;
        let adjustedWidth = elementWidth;

        // Adjust width based on network speed, if lowQualityOnSlowNetwork is true
        if (this.options.lowQualityOnSlowNetwork && ['slow-2g', '2g', '3g'].includes(networkSpeed)) {
            adjustedWidth *= 0.75; // Load a smaller image on slower networks
        }

        const from = parseInt(img.getAttribute('data-from'), 10);
        const to = parseInt(img.getAttribute('data-to'), 10);
        const steps = parseInt(img.getAttribute('data-steps'), 10);
        const specialSizes = img.getAttribute('data-special') ? img.getAttribute('data-special').split(',').map(size => parseInt(size, 10)) : [];
        let possibleSizes = this.generateSizeArray(from, to, steps).concat(specialSizes);
        possibleSizes = [...new Set(possibleSizes)].sort((a, b) => a - b); // Ensure unique sizes, sorted

        // Find the closest size not smaller than the adjusted width, or the largest size if none are large enough
        const optimalSize = possibleSizes.find(size => size >= adjustedWidth) || possibleSizes[possibleSizes.length - 1];
        return optimalSize;
    }

    generateSizeArray(from, to, step) {
        let sizes = [];
        for (let size = from; size <= to; size += step) {
            sizes.push(size);
        }
        return sizes;
    }

    constructImagePath(img, size) {
        const basePath = img.src.split('/').slice(0, -1).join('/');
        const format = img.getAttribute('data-format') || this.options.defaultFormat;
        return `${basePath}/${size}.${format}`;
    }

    observeNetworkChanges() {
        if (navigator.connection && typeof navigator.connection.addEventListener === 'function') {
            navigator.connection.addEventListener('change', () => {
                this.networkSpeed = this.detectNetworkSpeed();
                // Reapply logic only to images that might benefit from a network condition change
                this.observedImages.forEach(img => {
                    if (!img.complete || img.naturalWidth === 0) {
                        this.loadOptimalImage(img);
                    }
                });
            });
        }
    }

    refreshImages() {
        const newImages = document.querySelectorAll('img[data-from][data-to][data-steps]:not([data-observed])');
        this.applyToImages(newImages);
    }
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
    const imageLoader = new ResponsiveImageLoader({
        rootMargin: '50px',
        transitionDuration: '0.8s',
        defaultFormat: 'jpeg',
        lazyLoad: true,
        lowQualityOnSlowNetwork: true,
        observeNetworkChanges: true,
        // Specify the fallbackImage path if you have one
    });

    // Call imageLoader.refreshImages() when dynamically adding new content
});
