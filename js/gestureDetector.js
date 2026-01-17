/**
 * GestureDetector.js
 * Handles MediaPipe Hands integration and fist-to-open-palm gesture detection
 */

import { CONFIG } from './config.js';

export class GestureDetector {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        
        // Gesture state
        this.currentState = 'UNKNOWN';
        this.previousState = 'UNKNOWN';
        this.lastTriggerTime = 0;
        
        // Callbacks
        this.onGestureTrigger = null;
        this.onStateChange = null;
        
        this.isReady = false;
    }

    /**
     * Initialize MediaPipe Hands and webcam
     */
    async init() {
        try {
            // Get video element
            this.videoElement = document.getElementById('webcam');
            this.canvasElement = document.getElementById('gesture-canvas');
            this.canvasCtx = this.canvasElement.getContext('2d');

            // Configure canvas
            this.canvasElement.width = 640;
            this.canvasElement.height = 480;

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: CONFIG.MEDIAPIPE.MAX_NUM_HANDS,
                modelComplexity: CONFIG.MEDIAPIPE.MODEL_COMPLEXITY,
                minDetectionConfidence: CONFIG.MEDIAPIPE.MIN_DETECTION_CONFIDENCE,
                minTrackingConfidence: CONFIG.MEDIAPIPE.MIN_TRACKING_CONFIDENCE
            });

            // Set up results callback
            this.hands.onResults((results) => this.onResults(results));

            // Initialize camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: this.videoElement });
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            this.isReady = true;

            if (CONFIG.DEBUG.LOG_GESTURES) {
                console.log('✅ GestureDetector initialized');
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize GestureDetector:', error);
            return false;
        }
    }

    /**
     * Process MediaPipe hand tracking results
     */
    onResults(results) {
        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);

        // Check if hand is detected
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handLandmarks = results.multiHandLandmarks[0];
            
            // Draw hand skeleton overlay
            this.drawHandSkeleton(handLandmarks);

            // Detect gesture
            const extendedFingers = this.countExtendedFingers(handLandmarks);
            const newState = extendedFingers >= CONFIG.GESTURE.FIST_THRESHOLD ? 'OPEN' : 'FIST';

            // Update state
            this.previousState = this.currentState;
            this.currentState = newState;

            // Detect FIST → OPEN transition
            if (this.previousState === 'FIST' && this.currentState === 'OPEN') {
                const now = Date.now();
                const timeSinceLastTrigger = now - this.lastTriggerTime;

                // Check cooldown
                if (timeSinceLastTrigger > CONFIG.GESTURE.COOLDOWN_MS) {
                    this.lastTriggerTime = now;
                    this.triggerGesture();
                }
            }

            // Notify state change
            if (this.onStateChange && this.previousState !== this.currentState) {
                this.onStateChange(this.currentState);
            }
        } else {
            this.currentState = 'UNKNOWN';
        }

        this.canvasCtx.restore();
    }

    /**
     * Draw hand skeleton with landmarks and connections
     */
    drawHandSkeleton(landmarks) {
        const ctx = this.canvasCtx;
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        // Define hand connections (MediaPipe standard connections)
        const connections = [
            // Thumb
            [0, 1], [1, 2], [2, 3], [3, 4],
            // Index finger
            [0, 5], [5, 6], [6, 7], [7, 8],
            // Middle finger
            [0, 9], [9, 10], [10, 11], [11, 12],
            // Ring finger
            [0, 13], [13, 14], [14, 15], [15, 16],
            // Pinky
            [0, 17], [17, 18], [18, 19], [19, 20],
            // Palm connections
            [5, 9], [9, 13], [13, 17]
        ];

        // Draw connections (lines)
        ctx.strokeStyle = '#00FFFF'; // Cyan
        ctx.lineWidth = 2;
        ctx.beginPath();

        connections.forEach(([start, end]) => {
            const startLandmark = landmarks[start];
            const endLandmark = landmarks[end];

            const startX = startLandmark.x * width;
            const startY = startLandmark.y * height;
            const endX = endLandmark.x * width;
            const endY = endLandmark.y * height;

            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        });

        ctx.stroke();

        // Draw landmarks (circles)
        ctx.fillStyle = '#00FFFF'; // Cyan
        landmarks.forEach((landmark) => {
            const x = landmark.x * width;
            const y = landmark.y * height;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    /**
     * Count how many fingers are extended
     * Using fingertip vs. knuckle Y-coordinate comparison
     */
    countExtendedFingers(landmarks) {
        let extendedCount = 0;

        // Finger indices: [tip, pip (middle joint)]
        const fingers = [
            [4, 3],   // Thumb (use X coordinate as it moves horizontally)
            [8, 6],   // Index
            [12, 10], // Middle
            [16, 14], // Ring
            [20, 18]  // Pinky
        ];

        // Thumb: check horizontal extension (X-axis)
        const thumbTip = landmarks[fingers[0][0]];
        const thumbPip = landmarks[fingers[0][1]];
        const thumbExtended = Math.abs(thumbTip.x - thumbPip.x) > 0.05;
        if (thumbExtended) extendedCount++;

        // Other fingers: check vertical extension (Y-axis)
        for (let i = 1; i < fingers.length; i++) {
            const [tipIdx, pipIdx] = fingers[i];
            const tip = landmarks[tipIdx];
            const pip = landmarks[pipIdx];
            
            // Fingertip is above (lower Y value) the middle joint
            if (tip.y < pip.y - 0.02) {
                extendedCount++;
            }
        }

        return extendedCount;
    }

    /**
     * Trigger the gesture callback
     */
    triggerGesture() {
        if (CONFIG.DEBUG.LOG_GESTURES) {
            console.log('🎆 GESTURE TRIGGERED: Fist → Open Palm');
        }

        if (this.onGestureTrigger) {
            this.onGestureTrigger();
        }
    }

    /**
     * Get current gesture state
     */
    getState() {
        return this.currentState;
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.hands) {
            this.hands.close();
        }
    }
}
