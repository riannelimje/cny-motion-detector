/**
 * FortuneScroll.js
 * Chinese New Year fortune scroll animation with unrolling effect
 */

import { CONFIG } from './config.js';

export class FortuneScroll {
    constructor(scene) {
        this.scene = scene;
        this.scrollGroup = null;
        this.parchmentMesh = null;
        this.textMesh = null;
        this.isAnimating = false;
        this.animationProgress = 0;
        
        // Animation states
        this.unrollProgress = 0;
        this.textFadeProgress = 0;
    }

    /**
     * Create and show the fortune scroll
     */
    show() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.unrollProgress = 0;
        this.textFadeProgress = 0;
        
        // Create scroll elements
        this.createScroll();
        
        console.log('🎋 Fortune scroll animation started');
    }

    /**
     * Create the scroll geometry and materials
     */
    createScroll() {
        this.scrollGroup = new THREE.Group();
        
        // Create wooden rods (top and bottom)
        this.createWoodenRods();
        
        // Create parchment
        this.createParchment();
        
        // Create text texture
        this.createTextMesh();
        
        // Position scroll
        this.scrollGroup.position.set(0, 400, 200);
        this.scrollGroup.rotation.x = 0.1; // Slight tilt for depth
        
        this.scene.add(this.scrollGroup);
    }

    /**
     * Create wooden rod cylinders
     */
    createWoodenRods() {
        const rodGeometry = new THREE.CylinderGeometry(8, 8, 250, 16);
        const rodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A2511,
            roughness: 0.8,
            metalness: 0.1
        });

        // Top rod
        this.topRod = new THREE.Mesh(rodGeometry, rodMaterial);
        this.topRod.rotation.z = Math.PI / 2;
        this.topRod.position.y = 200;
        this.scrollGroup.add(this.topRod);

        // Bottom rod
        this.bottomRod = new THREE.Mesh(rodGeometry, rodMaterial);
        this.bottomRod.rotation.z = Math.PI / 2;
        this.bottomRod.position.y = 200; // Start at top, will move down during unroll
        this.scrollGroup.add(this.bottomRod);

        // Add decorative ends to rods
        const endGeometry = new THREE.SphereGeometry(10, 16, 16);
        const endMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.6,
            metalness: 0.2
        });

        // Top rod ends
        const topLeftEnd = new THREE.Mesh(endGeometry, endMaterial);
        topLeftEnd.position.set(-130, 200, 0);
        this.scrollGroup.add(topLeftEnd);

        const topRightEnd = new THREE.Mesh(endGeometry, endMaterial);
        topRightEnd.position.set(130, 200, 0);
        this.scrollGroup.add(topRightEnd);
    }

    /**
     * Create parchment with gold texture
     */
    createParchment() {
        // Create canvas texture for parchment
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Gradient background (red/burgundy)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#A0252A');    // Dark red
        gradient.addColorStop(0.5, '#B8292F');  // Burgundy  
        gradient.addColorStop(1, '#A0252A');    // Dark red
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Gold decorative borders
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Inner gold accent
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

        const texture = new THREE.CanvasTexture(canvas);
        
        // Create parchment plane
        const parchmentGeometry = new THREE.PlaneGeometry(240, 400);
        const parchmentMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            roughness: 0.6,
            metalness: 0.1,
            emissive: 0x8B1820,
            emissiveIntensity: 0.4
        });

        this.parchmentMesh = new THREE.Mesh(parchmentGeometry, parchmentMaterial);
        this.parchmentMesh.position.y = 200; // Start position
        
        // Start with scale 0 for unroll effect
        this.parchmentMesh.scale.y = 0.01;
        
        this.scrollGroup.add(this.parchmentMesh);
    }

    /**
     * Create text texture for fortune message
     */
    createTextMesh() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Main title: 上上签
        ctx.font = 'bold 120px SimHei, "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('上上签', canvas.width / 2, 150);

        // Random fortune phrases
        const fortunePhrases = [
            "锦鲤相伴，惊喜连连",
            "好运爆棚，福气满格",
            "闷声发财，喜事登门",
            "惊喜开场，圆满收尾",
            "心想事成，一路开挂",
            "财运亨通，躺赢人生",
            "笑口常开，横财就手",
            "福星高照，欧气附体",
            "盆满钵满，笑逐颜开",
            "万事顺意，好运常驻"
        ];

        // Randomly select a phrase
        const selectedPhrase = fortunePhrases[Math.floor(Math.random() * fortunePhrases.length)];
        console.log('🎋 Selected fortune:', selectedPhrase);

        // Split phrase into two columns (first 4 chars, last 4 chars)
        const rightColumn = selectedPhrase.substring(0, 4);  // Characters 0-3
        const leftColumn = selectedPhrase.substring(5, 9);   // Characters 5-8 (skip comma at index 4)

        // Subtitle: Fortune phrase (2 columns, 4 chars each)
        ctx.font = 'bold 56px SimHei, "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        
        // Calculate center position for both columns
        const columnSpacing = 70;
        const charSpacing = 60;
        
        // Title ends around y=210 (150 + half of font size)
        // Available space is from 210 to canvas bottom (1024)
        const spaceTop = 210;
        const spaceBottom = canvas.height;
        const centerOfSpace = (spaceTop + spaceBottom) / 2;
        
        // Text group spans 180px (3 gaps of 60px between 4 chars)
        // Center text group in available space
        const textGroupHeight = charSpacing * 3;
        const startY = centerOfSpace - (textGroupHeight / 2);
        
        // Right column: First 4 characters
        const rightX = canvas.width / 2 + columnSpacing;
        for (let i = 0; i < rightColumn.length; i++) {
            ctx.fillText(rightColumn[i], rightX, startY + (charSpacing * i));
        }
        
        // Left column: Last 4 characters
        const leftX = canvas.width / 2 - columnSpacing;
        for (let i = 0; i < leftColumn.length; i++) {
            ctx.fillText(leftColumn[i], leftX, startY + (charSpacing * i));
        }

        const texture = new THREE.CanvasTexture(canvas);
        
        // Create text plane
        const textGeometry = new THREE.PlaneGeometry(200, 200);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
        this.textMesh.position.set(0, 100, 5); // Slightly in front of parchment
        
        this.scrollGroup.add(this.textMesh);
    }

    /**
     * Update animation (called every frame)
     */
    update(deltaTime) {
        if (!this.isAnimating || !this.scrollGroup) return;

        // Phase 1: Unroll scroll (0-2 seconds)
        if (this.unrollProgress < 1) {
            this.unrollProgress += deltaTime / CONFIG.SCROLL.UNROLL_DURATION;
            this.unrollProgress = Math.min(this.unrollProgress, 1);

            // Ease-out cubic for smooth unrolling
            const eased = 1 - Math.pow(1 - this.unrollProgress, 3);

            // Scale parchment vertically
            this.parchmentMesh.scale.y = eased;
            
            // Move bottom rod down
            this.bottomRod.position.y = 200 - (400 * eased);

            // Update parchment position to stay centered
            this.parchmentMesh.position.y = 200 - (200 * eased);
        }

        // Phase 2: Fade in text (starts at 1.5s, duration 1s)
        if (this.unrollProgress > 0.75 && this.textFadeProgress < 1) {
            this.textFadeProgress += deltaTime / CONFIG.SCROLL.TEXT_FADE_DURATION;
            this.textFadeProgress = Math.min(this.textFadeProgress, 1);

            // Ease-in for text appearance
            const eased = this.textFadeProgress * this.textFadeProgress;
            this.textMesh.material.opacity = eased;

            // Slight scale-up effect
            const scale = 0.8 + (0.2 * eased);
            this.textMesh.scale.set(scale, scale, 1);
        }

        // Add subtle floating animation after unroll
        if (this.unrollProgress >= 1) {
            const time = Date.now() * 0.001;
            this.scrollGroup.position.y = 400 + Math.sin(time * 0.5) * 5;
            this.scrollGroup.rotation.x = 0.1 + Math.sin(time * 0.3) * 0.02;
        }

        // Complete animation after both phases done
        if (this.unrollProgress >= 1 && this.textFadeProgress >= 1) {
            // Keep showing for display duration
            this.animationProgress += deltaTime;
            
            if (this.animationProgress > CONFIG.SCROLL.DISPLAY_DURATION) {
                this.fadeOut(deltaTime);
            }
        }
    }

    /**
     * Fade out and remove scroll
     */
    fadeOut(deltaTime) {
        const fadeSpeed = deltaTime / CONFIG.SCROLL.FADE_OUT_DURATION;
        
        this.parchmentMesh.material.opacity -= fadeSpeed;
        this.textMesh.material.opacity -= fadeSpeed;

        if (this.parchmentMesh.material.opacity <= 0) {
            this.hide();
        }
    }

    /**
     * Hide and cleanup scroll
     */
    hide() {
        if (this.scrollGroup) {
            this.scene.remove(this.scrollGroup);
            
            // Dispose geometries and materials
            this.scrollGroup.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            });
            
            this.scrollGroup = null;
        }
        
        this.isAnimating = false;
        this.animationProgress = 0;
        console.log('🎋 Fortune scroll animation complete');
    }

    /**
     * Check if animation is running
     */
    isRunning() {
        return this.isAnimating;
    }
}
