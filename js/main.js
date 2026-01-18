/**
 * Main.js
 * Entry point - orchestrates gesture detection and fireworks animation
 */

import { CONFIG } from './config.js';
import { GestureDetector } from './gestureDetector.js';
import { TextToPoints } from './textToPoints.js';
import { FireworksSystem } from './fireworksSystem.js';
import { SceneManager } from './sceneManager.js';
import { FortuneScroll } from './fortuneScroll.js';

class CNYFireworksApp {
    constructor() {
        this.gestureDetector = null;
        this.textConverter = null;
        this.fireworksSystem = null;
        this.fortuneScroll = null;
        this.sceneManager = null;
        
        this.targetPoints = null;
        this.isReady = false;
        this.scrollDelayTimer = null;
        this.scrollTriggered = false;
        this.fireworksLaunched = false; // Track if fireworks have been triggered
        
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

            // Initialize fortune scroll system
            this.fortuneScroll = new FortuneScroll(this.sceneManager.getScene());

            // Initialize gesture detector
            this.updateStatus('Initializing webcam & MediaPipe...');
            this.gestureDetector = new GestureDetector();
            
            // Set up callbacks
            this.gestureDetector.onGestureTrigger = () => this.onGestureTrigger();
            this.gestureDetector.onStateChange = (state) => this.onGestureStateChange(state);

            const gestureReady = await this.gestureDetector.init();

            if (!gestureReady) {
                throw new Error('Failed to initialize gesture detector');
            }

            // Start animation loop
            this.animate();

            // Hide loading screen
            this.hideLoadingScreen();
            this.isReady = true;

            this.updateStatus('✅ Ready! Make a fist then open your palm');
            
            console.log('✅ CNY Fireworks Experience ready!');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.updateStatus(`Error: ${error.message}`);
        }
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
        this.updateStatus('🎆 新年快乐! Happy Chinese New Year!');

        // Add slight jitter for organic feel
        const jitteredPoints = this.textConverter.jitterPoints(this.targetPoints, 3);

        // Launch fireworks
        this.fireworksSystem.launch(jitteredPoints);
        
        // Mark that fireworks have been launched
        this.fireworksLaunched = true;
        this.scrollTriggered = false; // Reset for new sequence

        // Play sound effect (optional)
        // this.playFireworkSound();
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

        // Update hint based on state
        const hintElement = document.getElementById('gesture-hint');
        if (state === 'FIST') {
            hintElement.textContent = '✊ Fist detected - open your palm to trigger! 🖐️';
        } else if (state === 'OPEN') {
            hintElement.textContent = '🖐️ Palm open - close to fist to reset ✊';
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

        // Sequence: Only show scroll after fireworks have been launched and completed
        // 1. User opens fist → fireworks launch (新年快乐)
        // 2. After fireworks complete → scroll appears
        if (this.fireworksLaunched &&
            !this.fireworksSystem.isAnimating && 
            !this.scrollTriggered &&
            !this.fortuneScroll.isRunning() && 
            !this.scrollDelayTimer) {
            
            this.scrollTriggered = true;
            
            // Delay scroll appearance after fireworks complete
            this.scrollDelayTimer = setTimeout(() => {
                this.fortuneScroll.show();
                this.scrollDelayTimer = null;
            }, CONFIG.SCROLL.DELAY_AFTER_FIREWORKS * 1000);
        }

        // Update fortune scroll
        this.fortuneScroll.update(deltaTime);

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
