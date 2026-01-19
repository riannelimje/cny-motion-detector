/**
 * ScrollManager.js
 * Manages three fortune scrolls and handles selection logic
 */

import { FortuneScroll } from './fortuneScroll.js';
import { CONFIG } from './config.js';

export class ScrollManager {
    constructor(scene) {
        this.scene = scene;
        this.scrolls = []; // Array of 3 FortuneScroll instances
        this.selectedScrollIndex = null;
        this.isAnimating = false;
        this.state = 'IDLE'; // IDLE, SELECTING, UNROLLING, DISPLAYED
    }

    /**
     * Initialize three scrolls side-by-side
     */
    initialize() {
        console.log('🎋 Initializing three fortune scrolls...');
        
        // Get unique fortunes for each scroll
        const fortunes = this.getUniqueRandomFortunes(3);
        
        // Use mobile positions on smaller screens
        const isMobile = window.innerWidth <= 768;
        const positionSet = isMobile ? CONFIG.SCROLL.MOBILE_POSITIONS : CONFIG.SCROLL.POSITIONS;
        
        // Create scrolls at left, center, right positions
        const positions = [
            positionSet.LEFT,
            positionSet.CENTER,
            positionSet.RIGHT
        ];
        
        positions.forEach((position, index) => {
            const scroll = new FortuneScroll(this.scene, index, position, fortunes[index]);
            scroll.setIdle();
            this.scrolls.push(scroll);
        });
        
        this.state = 'IDLE';
        this.selectedScrollIndex = null;
        this.isAnimating = false;
    }

    /**
     * Get unique random fortunes (no duplicates)
     */
    getUniqueRandomFortunes(count) {
        const allFortunes = [
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
        
        // Shuffle and take first 'count' items
        const shuffled = [...allFortunes].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Select a scroll by index (0, 1, or 2)
     * This will be called by gesture detection later
     */
    selectScroll(index) {
        if (this.isAnimating || this.state !== 'IDLE') return;
        if (index < 0 || index >= this.scrolls.length) return;
        
        console.log(`🎋 Hovering over scroll ${index + 1}`);
        
        // Update hover state for all scrolls
        this.scrolls.forEach((scroll, i) => {
            if (i === index) {
                scroll.setHovering(true);
            } else {
                scroll.setHovering(false);
            }
        });
        
        this.selectedScrollIndex = index;
        this.state = 'SELECTING';
    }

    /**
     * Clear selection (when no fingers shown)
     */
    clearSelection() {
        if (this.state !== 'SELECTING') return;
        
        this.scrolls.forEach(scroll => {
            scroll.setHovering(false);
        });
        
        this.selectedScrollIndex = null;
        this.state = 'IDLE';
    }

    /**
     * Confirm selection and trigger unroll
     */
    confirmSelection() {
        if (this.selectedScrollIndex === null || this.isAnimating) return;
        if (this.state !== 'SELECTING') return;
        
        console.log(`🎋 Confirming scroll ${this.selectedScrollIndex + 1} selection`);
        
        this.isAnimating = true;
        this.state = 'UNROLLING';
        
        // Trigger selection animation
        this.scrolls.forEach((scroll, i) => {
            if (i === this.selectedScrollIndex) {
                scroll.setSelected();
                
                // Start unroll after selection pulse (0.8s delay)
                setTimeout(() => {
                    scroll.show();
                }, 800);
            } else {
                scroll.fadeAway();
            }
        });
    }

    /**
     * Get scroll index at raycaster position (for mouse clicks)
     */
    getScrollAtPosition(raycaster) {
        if (this.state !== 'IDLE' && this.state !== 'SELECTING') return null;
        
        // Collect all meshes from all scrolls
        const meshes = [];
        this.scrolls.forEach((scroll, index) => {
            if (scroll.scrollGroup && scroll.parchmentMesh) {
                meshes.push({
                    mesh: scroll.parchmentMesh,
                    index: index
                });
            }
        });
        
        // Check for intersections
        const intersects = raycaster.intersectObjects(meshes.map(m => m.mesh));
        
        if (intersects.length > 0) {
            // Find which scroll was clicked
            const clickedMesh = intersects[0].object;
            const result = meshes.find(m => m.mesh === clickedMesh);
            return result ? result.index : null;
        }
        
        return null;
    }

    /**
     * Hide all scrolls without reinitializing (for fireworks)
     */
    hideAll() {
        console.log('🎋 Hiding all scrolls...');
        
        // Remove all existing scrolls from scene
        this.scrolls.forEach(scroll => {
            scroll.hide();
        });
        
        this.scrolls = [];
        this.selectedScrollIndex = null;
        this.isAnimating = false;
        this.state = 'IDLE';
    }

    /**
     * Reset all scrolls to initial state
     */
    reset() {
        console.log('🎋 Resetting scroll selection...');
        
        // Remove all existing scrolls
        this.scrolls.forEach(scroll => {
            scroll.hide();
        });
        
        this.scrolls = [];
        this.selectedScrollIndex = null;
        this.isAnimating = false;
        
        // Re-initialize with new fortunes
        this.initialize();
    }

    /**
     * Update all scrolls
     */
    update(deltaTime) {
        this.scrolls.forEach(scroll => {
            scroll.update(deltaTime);
        });
        
        // Check if selected scroll finished displaying and clean up
        if (this.state === 'DISPLAYED') {
            const selectedScroll = this.scrolls[this.selectedScrollIndex];
            if (selectedScroll && selectedScroll.state === 'HIDDEN') {
                // Clean up all scrolls after selected one fades out completely
                console.log('🎋 Scroll display complete, cleaning up...');
                this.hideAll();
            }
        }
        
        // Update state when unroll completes
        if (this.state === 'UNROLLING') {
            const selectedScroll = this.scrolls[this.selectedScrollIndex];
            if (selectedScroll && selectedScroll.state === 'DISPLAYED') {
                this.state = 'DISPLAYED';
            }
        }
    }

    /**
     * Check if manager is busy with animation
     */
    isBusy() {
        return this.isAnimating || this.state !== 'IDLE';
    }
}
