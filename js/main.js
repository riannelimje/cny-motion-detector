/**
 * Main.js
 * Entry point - orchestrates gesture detection and fireworks animation
 */

import { CONFIG } from './config.js';
import { GestureDetector } from './gestureDetector.js';
import { TextToPoints } from './textToPoints.js';
import { FireworksSystem } from './fireworksSystem.js';
import { SceneManager } from './sceneManager.js';
import { ScrollManager } from './scrollManager.js';
import { MenuManager } from './menuManager.js';

class CNYFireworksApp {
    constructor() {
        this.gestureDetector = null;
        this.textConverter = null;
        this.fireworksSystem = null;
        this.scrollManager = null;
        this.sceneManager = null;
        this.menuManager = null;
        
        this.targetPoints = null;
        this.isReady = false;
        this.fireworksLaunched = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎆 Starting CNY Fireworks Experience...');
            
            // Update status
            this.updateStatus('Initializing Three.js scene...');

            // Initialize Three.js scene
            const container = document.getElementById('scene-container');
            this.sceneManager = new SceneManager(container);

            // Convert text to points
            this.updateStatus('Generating text point cloud...');
            this.textConverter = new TextToPoints();
            this.targetPoints = this.textConverter.convertToPoints();

            // Initialize fireworks system
            this.updateStatus('Setting up fireworks system...');
            this.fireworksSystem = new FireworksSystem(this.sceneManager.getScene());

            // Initialize scroll manager system
            this.scrollManager = new ScrollManager(this.sceneManager.getScene());

            // Initialize gesture detector
            this.updateStatus('Initializing webcam & MediaPipe...');
            this.gestureDetector = new GestureDetector();
            
            // Set up callbacks
            this.gestureDetector.onGestureTrigger = () => this.onGestureTrigger();
            this.gestureDetector.onStateChange = (state) => this.onGestureStateChange(state);
            this.gestureDetector.onFingerCountChange = (scrollIndex) => this.onFingerCountChange(scrollIndex);
            this.gestureDetector.onFistGesture = () => this.onFistGesture();

            const gestureReady = await this.gestureDetector.init();

            if (!gestureReady) {
                throw new Error('Failed to initialize gesture detector');
            }

            // Set up keyboard controls for testing
            this.setupKeyboardControls();

            // Initialize menu manager
            this.menuManager = new MenuManager();

            // Start animation loop
            this.animate();

            // Hide loading screen
            this.hideLoadingScreen();
            this.isReady = true;

            this.updateStatus('✅ Ready! Make a fist then open your palm to start');
            
            console.log('✅ CNY Fireworks Experience ready!');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.updateStatus(`Error: ${error.message}`);
        }
    }

    /**
     * Set up keyboard controls for scroll selection
     */
    setupKeyboardControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            // Number keys 1, 2, 3 to select scrolls
            if (event.key === '1') {
                this.scrollManager.selectScroll(0);
            } else if (event.key === '2') {
                this.scrollManager.selectScroll(1);
            } else if (event.key === '3') {
                this.scrollManager.selectScroll(2);
            }
            // Space to confirm selection
            else if (event.key === ' ') {
                event.preventDefault();
                this.scrollManager.confirmSelection();
            }
            // R to reset
            else if (event.key === 'r' || event.key === 'R') {
                this.scrollManager.reset();
            }
        });

        // Mouse and touch controls
        const canvas = document.querySelector('canvas');
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleInteraction = (event) => {
            // Prevent default to avoid double-firing on touch devices
            event.preventDefault();
            
            // Get coordinates from either mouse or touch event
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;
            
            if (event.type.startsWith('touch')) {
                const touch = event.touches[0] || event.changedTouches[0];
                clientX = touch.clientX;
                clientY = touch.clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }
            
            // Calculate position in normalized device coordinates (-1 to +1)
            mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

            // Update raycaster
            raycaster.setFromCamera(mouse, this.sceneManager.getCamera());

            // Check intersection with scrolls
            const scrollIndex = this.scrollManager.getScrollAtPosition(raycaster);
            
            if (scrollIndex !== null) {
                const inputType = event.type.startsWith('touch') ? '👆' : '🖱️';
                console.log(`${inputType} Tapped scroll ${scrollIndex + 1}`);
                
                // If clicking already selected scroll, confirm it
                if (this.scrollManager.selectedScrollIndex === scrollIndex) {
                    this.scrollManager.confirmSelection();
                } else {
                    // Otherwise, select it
                    this.scrollManager.selectScroll(scrollIndex);
                }
            }
        };

        // Add both click and touch event listeners
        canvas.addEventListener('click', handleInteraction);
        canvas.addEventListener('touchend', handleInteraction);

        console.log('⌨️  Controls enabled: Tap/click scrolls or press 1/2/3 to select, SPACE to confirm, R to reset');
    }

    /**
     * Handle gesture trigger (fist → open palm)
     */
    onGestureTrigger() {
        // Check if fireworks are already running
        if (this.fireworksSystem.isRunning()) {
            console.log('⚠️ Fireworks already running, ignoring trigger');
            return;
        }

        console.log('🎆 LAUNCHING FIREWORKS!');
        console.log('🎆 LAUNCHING FIREWORKS!');
        this.updateStatus('🎆 新年快乐! Happy Chinese New Year!');

        // Hide any existing scrolls before fireworks
        if (this.scrollManager.scrolls.length > 0) {
            console.log('🎋 Hiding scrolls for fireworks...');
            this.scrollManager.hideAll();
        }

        // Add slight jitter for organic feel
        const jitteredPoints = this.textConverter.jitterPoints(this.targetPoints, 3);

        // Launch fireworks
        this.fireworksSystem.launch(jitteredPoints);
        
        // Mark that fireworks have been launched
        this.fireworksLaunched = true;

        // Play sound effect (optional)
        // this.playFireworkSound();
    }

    /**
     * Handle finger count change for scroll selection
     * @param {number} scrollIndex - Index of scroll to select (0, 1, or 2)
     */
    onFingerCountChange(scrollIndex) {
        // Only respond to finger count when scrolls are in selection mode
        if (this.scrollManager.state === 'IDLE' || this.scrollManager.state === 'SELECTING') {
            this.scrollManager.selectScroll(scrollIndex);
        }
    }

    /**
     * Handle fist gesture (used for confirming scroll selection)
     */
    onFistGesture() {
        // Use fist gesture to confirm selection when in selecting mode
        if (this.scrollManager.state === 'SELECTING') {
            console.log('✊ Fist gesture → Confirming selection');
            this.scrollManager.confirmSelection();
        }
    }

    /**
     * Handle gesture state change
     */
    onGestureStateChange(state) {
        const stateEmojis = {
            'FIST': '✊',
            'OPEN': '🖐️',
            'UNKNOWN': '❓'
        };

        const emoji = stateEmojis[state] || '';
        
        if (CONFIG.DEBUG.LOG_GESTURES) {
            console.log(`Gesture state: ${state} ${emoji}`);
        }

        // Update hint based on state and scroll status
        const hintElement = document.getElementById('gesture-hint');
        const hasScrolls = this.scrollManager.scrolls.length > 0;
        
        if (state === 'FIST') {
            if (hasScrolls) {
                hintElement.textContent = '✊ Fist detected - open palm for new fortune! 🎆';
            } else {
                hintElement.textContent = '✊ Fist detected - open your palm to trigger! 🖐️';
            }
        } else if (state === 'OPEN') {
            if (hasScrolls) {
                hintElement.textContent = '🖐️ Palm open - close to fist for fireworks & new scrolls ✊';
            } else {
                hintElement.textContent = '🖐️ Palm open - close to fist to reset ✊';
            }
        } else {
            hintElement.textContent = 'Show your hand to the camera 👋';
        }
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isReady) return;

        // Get delta time
        const deltaTime = this.sceneManager.getDeltaTime();

        // Update fireworks
        this.fireworksSystem.update(deltaTime);

        // Sequence: After fireworks complete, show three scrolls for selection
        if (this.fireworksLaunched && 
            !this.fireworksSystem.isAnimating && 
            this.scrollManager.scrolls.length === 0) {
            
            // Initialize three scrolls after fireworks complete
            setTimeout(() => {
                this.scrollManager.initialize();
                this.fireworksLaunched = false;
                
                // Show selection instructions
                this.updateStatus('🎋 Show 1-3 fingers to select, make a fist ✊ to confirm');
            }, CONFIG.SCROLL.DELAY_AFTER_FIREWORKS * 1000);
        }

        // Update scroll manager
        this.scrollManager.update(deltaTime);

        // Render scene
        this.sceneManager.render();
    }

    /**
     * Update status text
     */
    updateStatus(text) {
        const statusElement = document.getElementById('status-text');
        if (statusElement) {
            statusElement.textContent = text;
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    /**
     * Toggle debug visualization
     */
    toggleDebug() {
        const canvas = document.getElementById('gesture-canvas');
        CONFIG.DEBUG.SHOW_GESTURE_CANVAS = !CONFIG.DEBUG.SHOW_GESTURE_CANVAS;
        canvas.style.display = CONFIG.DEBUG.SHOW_GESTURE_CANVAS ? 'block' : 'none';
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.gestureDetector) this.gestureDetector.dispose();
        if (this.fireworksSystem) this.fireworksSystem.dispose();
        if (this.sceneManager) this.sceneManager.dispose();
    }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new CNYFireworksApp();
    });
} else {
    window.app = new CNYFireworksApp();
}

// Expose toggle debug for console access
window.toggleDebug = () => {
    if (window.app) {
        window.app.toggleDebug();
    }
};

export default CNYFireworksApp;
