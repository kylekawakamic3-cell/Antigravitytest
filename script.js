class AsciiBackground {
    constructor() {
        this.canvas = document.getElementById('ascii-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Configuration
        this.fontSize = 16;
        this.columns = Math.floor(this.width / this.fontSize);
        this.rows = Math.floor(this.height / this.fontSize);

        // Characters sorted by density (though we'll use a subset for style)
        this.chars = '01'; // Binary rain style for now, can be expanded
        this.chars = ' .:-=+*#%@'; // Density map

        // State
        this.grid = [];
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        this.glitchActive = false;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', () => {
            this.glitchActive = true;
            setTimeout(() => this.glitchActive = false, 200);
        });

        // Initialize grid
        for (let y = 0; y < this.rows; y++) {
            let row = [];
            for (let x = 0; x < this.columns; x++) {
                row.push({
                    char: this.getRandomChar(),
                    offset: Math.random() * 100
                });
            }
            this.grid.push(row);
        }

        this.animate();
    }

    getRandomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.columns = Math.floor(this.width / this.fontSize);
        this.rows = Math.floor(this.height / this.fontSize);
        this.ctx.font = `${this.fontSize}px 'Space Mono'`;
    }

    animate() {
        const computedStyle = getComputedStyle(document.body);
        this.ctx.fillStyle = computedStyle.getPropertyValue('--bg-color').trim();
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#333'; // Base text color
        this.time += 0.05;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const cell = this.grid[y]?.[x];
                if (!cell) continue;

                // Calculate distance to mouse
                const px = x * this.fontSize;
                const py = y * this.fontSize;
                const dx = px - this.mouse.x;
                const dy = py - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Wave effect
                const noise = Math.sin(x * 0.1 + this.time) * Math.cos(y * 0.1 + this.time);

                // Interaction radius
                const maxDist = 300;
                let intensity = 0;

                if (dist < maxDist) {
                    intensity = 1 - (dist / maxDist);
                    // Change character based on proximity
                    const charIndex = Math.floor(intensity * (this.chars.length - 1));
                    // Highlight color near mouse
                    this.ctx.fillStyle = `rgba(204, 255, 0, ${intensity})`; // Acid Green
                } else {
                    this.ctx.fillStyle = '#1a1a1a'; // Dim background
                }

                if (this.glitchActive && Math.random() > 0.8) {
                    this.ctx.fillStyle = '#FF3366'; // Glitch Red
                    this.ctx.fillText(this.getRandomChar(), px + (Math.random() - 0.5) * 10, py + (Math.random() - 0.5) * 10);
                    continue;
                }

                // Draw character
                // If near mouse, show dense chars, else show sparse
                const charToShow = dist < maxDist
                    ? this.chars[Math.floor(intensity * (this.chars.length - 1))]
                    : (Math.random() > 0.98 ? '.' : ''); // Random twinkling background

                if (charToShow) {
                    this.ctx.fillText(charToShow, px, py);
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    setCharset(type) {
        if (type === 'BINARY') this.chars = '01';
        else if (type === 'HEX') this.chars = '0123456789ABCDEF';
        else if (type === 'WAVES') this.chars = ' ▂▃▄▅▆▇█';
        else this.chars = ' .:-=+*#%@'; // Default
    }
}

// Loader Logic
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const progress = document.querySelector('.loader-progress');

    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 10;
        if (width > 100) width = 100;
        progress.style.width = width + '%';

        if (width === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('hidden');
                // Initialize Canvas after loader
                window.asciiBg = new AsciiBackground(); // Make accessible
            }, 500);
        }
    }, 100);

    // Custom Cursor Logic
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Immediate update for small cursor
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Smooth follower
    function animateCursor() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .nav-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            follower.classList.remove('active');
        });
    });

    // Scroll Reveal
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('h1, h2, p, .hero-sub').forEach(el => {
        el.classList.add('reveal-text');
        observer.observe(el);
    });

    // Project Hover Effects with Image Preview
    const projectItems = document.querySelectorAll('.work-row');
    const projectPreview = document.getElementById('project-preview');

    projectItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const type = item.getAttribute('data-ascii');
            const imagePath = item.getAttribute('data-image');

            // Update ASCII background
            if (window.asciiBg) window.asciiBg.setCharset(type);

            // Show project preview image
            if (imagePath && projectPreview) {
                projectPreview.style.backgroundImage = `url("${imagePath}")`;
                projectPreview.classList.add('visible');
            }
        });

        item.addEventListener('mousemove', (e) => {
            // Update preview position to follow cursor
            if (projectPreview && projectPreview.classList.contains('visible')) {
                projectPreview.style.left = e.clientX + 'px';
                projectPreview.style.top = e.clientY + 'px';
            }
        });

        item.addEventListener('mouseleave', () => {
            // Reset ASCII background
            if (window.asciiBg) window.asciiBg.setCharset('DEFAULT');

            // Hide project preview
            if (projectPreview) {
                projectPreview.classList.remove('visible');
                projectPreview.style.backgroundImage = '';
            }
        });
    });
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');

        // Update Canvas Colors
        if (window.asciiBg) {
            // Trigger resize to reset context font/colors if needed, 
            // or just let the next animate loop pick up the new CSS variables if we used them.
            // Since canvas uses explicit colors, we might need to update them.
            // For now, let's just let the CSS variables handle the main UI.
            // The canvas background is hardcoded in animate() to #050505.
            // We should probably make the canvas respect the theme.
        }
    });
});
