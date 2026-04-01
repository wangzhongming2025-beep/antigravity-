/**
 * Strabismus Training Engine
 * Core Logic for Vision Therapy Modules
 */

class StrabismusTraining {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.currentModule = null;
        this.animationId = null;
        this.frame = 0;
        
        // State
        this.speed = 1;
        this.targetSize = 40;
        this.separation = 50; // for fusion
        
        // Colors for Anaglyph (Red-Cyan)
        this.RED = "rgba(255, 0, 0, 1)";
        this.CYAN = "rgba(0, 255, 255, 1)";
        this.YELLOW = "rgba(255, 255, 0, 1)";
    }

    start(moduleName) {
        this.stop();
        this.currentModule = moduleName;
        this.frame = 0;
        this.loop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    loop() {
        this.frame++;
        this.clear();
        
        switch(this.currentModule) {
            case 'fusion': this.drawFusion(); break;
            case 'saccades': this.drawSaccades(); break;
            case 'brock-string': this.drawBrockString(); break;
            case 'rds': this.drawRDS(); break;
        }
        
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    clear() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * MODULE 1: Red-Green Fusion Challenge
     * Logic: Draw red and cyan targets with a separation.
     * The goal is to fuse them into one.
     */
    drawFusion() {
        this.ctx.globalCompositeOperation = "lighter";
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Calculate dynamic separation for convergence/divergence exercise
        const dynamicSep = Math.sin(this.frame * 0.02 * this.speed) * this.separation;
        
        // Red Target (visible through red filter)
        this.ctx.fillStyle = this.RED;
        this.ctx.beginPath();
        this.ctx.arc(centerX - dynamicSep, centerY, this.targetSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cyan Target (visible through cyan filter)
        this.ctx.fillStyle = this.CYAN;
        this.ctx.beginPath();
        this.ctx.arc(centerX + dynamicSep, centerY, this.targetSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reference line
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.height);
        this.ctx.stroke();
    }

    /**
     * MODULE 2: Dynamic Saccades
     * Speed: user controlled.
     * Logic: Move target to random positions with a rhythm.
     */
    drawSaccades() {
        const interval = 60 / this.speed;
        if (this.frame % interval === 0) {
            this.saccadePos = {
                x: 100 + Math.random() * (this.width - 200),
                y: 100 + Math.random() * (this.height - 200)
            };
        }
        
        if (this.saccadePos) {
            this.ctx.fillStyle = "#fff";
            this.ctx.beginPath();
            this.ctx.arc(this.saccadePos.x, this.saccadePos.y, this.targetSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add a "Gabor" like ring for better visual stimulation
            this.ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.saccadePos.x, this.saccadePos.y, this.targetSize, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    /**
     * MODULE 3: Digital Brock String
     * Simulates a string going from the bridge of the nose to infinity.
     */
    drawBrockString() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Draw the string base (perspective)
        this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, this.height);
        this.ctx.lineTo(centerX, 0);
        this.ctx.stroke();
        
        // Draw beads
        const beads = [
            { y: this.height - 100, color: "red", label: "近 (Near)" },
            { y: this.height / 2, color: "green", label: "中 (Mid)" },
            { y: 100, color: "cyan", label: "远 (Far)" }
        ];
        
        beads.forEach((bead, i) => {
            const size = 15 + (bead.y / this.height) * 20; // Perspective size
            this.ctx.fillStyle = bead.color === "red" ? this.RED : (bead.color === "green" ? this.accent_green_val() : this.CYAN);
            this.ctx.beginPath();
            this.ctx.arc(centerX, bead.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Interaction: Pulse the bead we should focus on
            const activeIndex = Math.floor(this.frame / (120 / this.speed)) % 3;
            if (i === activeIndex) {
                this.ctx.strokeStyle = "#fff";
                this.ctx.lineWidth = 4;
                const pulse = 5 * Math.sin(this.frame * 0.1);
                this.ctx.beginPath();
                this.ctx.arc(centerX, bead.y, size + 10 + pulse, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    accent_green_val() { return "#10b981"; }

    /**
     * MODULE 4: Random Dot Stereogram (Simple Horizontal Shift)
     * To simulate depth without glasses using Cross-Eye/Parallel.
     */
    drawRDS() {
        const dotSize = 4;
        const density = 0.1;
        const spacing = 300; // Separation between stereo pairs
        
        if (!this.rdsStatic) {
            this.rdsStatic = [];
            for(let i=0; i<1000; i++) {
                this.rdsStatic.push({
                    x: Math.random() * (this.width / 2 - 100),
                    y: Math.random() * (this.height - 100) + 50
                });
            }
        }
        
        const offsetX = (this.width / 2) - spacing / 2;
        const depthShift = Math.sin(this.frame * 0.05) * 10;
        
        this.ctx.fillStyle = "rgba(255,255,255,0.8)";
        
        this.rdsStatic.forEach(dot => {
            // Left Image
            this.ctx.fillRect(dot.x + 50, dot.y, dotSize, dotSize);
            
            // Right Image (with a slight horizontal shift relative to left)
            this.ctx.fillRect(dot.x + offsetX + 100 + depthShift, dot.y, dotSize, dotSize);
        });
        
        // Reference alignment markers
        this.ctx.fillStyle = "#ff0";
        this.ctx.fillRect(this.width/2 - spacing/2, 50, 10, 10);
        this.ctx.fillRect(this.width/2 + spacing/2, 50, 10, 10);
    }
}

// Global instance
let app;

function initTraining() {
    app = new StrabismusTraining('training-canvas');
}

function startModule(moduleName) {
    app.start(moduleName);
}

function stopModule() {
    app.stop();
}

function updateParams(key, value) {
    if (app) {
        app[key] = parseFloat(value);
    }
}
