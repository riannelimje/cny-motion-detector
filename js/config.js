/**
 * Configuration file for CNY Fireworks Experience
 * Centralized settings for easy tweaking
 */

export const CONFIG = {
    // MediaPipe Hands Configuration
    MEDIAPIPE: {
        MAX_NUM_HANDS: 1,
        MODEL_COMPLEXITY: 1,
        MIN_DETECTION_CONFIDENCE: 0.7,
        MIN_TRACKING_CONFIDENCE: 0.5
    },

    // Gesture Detection
    GESTURE: {
        FIST_THRESHOLD: 4,           // Fingers extended to be considered "open palm" (changed to 4 to avoid conflict with scroll selection)
        COOLDOWN_MS: 1000,           // Minimum time between triggers (ms)
        FINGER_CURL_THRESHOLD: 0.6   // How curled a finger needs to be (0-1)
    },

    // Fireworks Text Settings
    TEXT: {
        CONTENT: '新年快乐',          // Chinese characters for "Happy New Year"
        FONT_SIZE: 180,               // Size for sampling
        FONT_FAMILY: 'SimHei, "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif',
        SAMPLE_DENSITY: 0.3,          // Lower = more particles (0-1)
        SPACING_X: 250,               // Horizontal spacing between characters
        POSITION_Y: 450,              // Height in 3D space (centered for desktop)
        POSITION_Z: 0,                // Base z-depth (particles vary around this)
        Z_VARIATION: 30,              // Random z-depth variation for layering
        
        // Mobile adjustments
        MOBILE_FONT_SIZE: 90,         // Much smaller text for mobile
        MOBILE_SPACING_X: 120,        // Very tight spacing on mobile
        MOBILE_POSITION_Y: 300        // Much lower position for mobile
    },

    // Fireworks Animation
    FIREWORKS: {
        LAUNCH_COUNT: 80,             // Particles per character launch
        LAUNCH_SPEED: 15,             // Initial upward velocity
        LAUNCH_SPREAD: 100,           // Horizontal spread at launch
        RISE_TIME: 1.5,               // Seconds to reach target
        EXPLOSION_SIZE: 50,           // Radius of explosion
        EXPLOSION_PARTICLES: 30,      // Particles per explosion point
        FADE_TIME: 1.0,               // Seconds to fade after explosion
        GRAVITY: 0.98,                // Gravity multiplier
        DRAG: 0.99,                   // Air resistance
        PARTICLE_SIZE: 4,             // Base particle size
        GLOW_SIZE: 8                  // Glow particle size
    },

    // Colors (Chinese New Year theme)
    COLORS: {
        GOLD: 0xFFD700,
        RED: 0xFF0000,
        BRIGHT_RED: 0xFF3333,
        YELLOW: 0xFFFF00,
        ORANGE: 0xFF8C00,
        PALETTE: [0xFFD700, 0xFF0000, 0xFF3333, 0xFFFF00, 0xFF8C00]
    },

    // Scene Settings
    SCENE: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 10000,
        BACKGROUND_COLOR: 0x000510,
        FOG_COLOR: 0x000510,
        FOG_NEAR: 100,
        FOG_FAR: 3000
    },

    // Marina Bay Sands Backdrop
    BACKDROP: {
        WIDTH: 4000,
        HEIGHT: 2500,
        POSITION_Z: -100,             // Behind fireworks
        POSITION_Y: 100,
        OPACITY: 0.85
    },

    // Fortune Scroll Animation
    SCROLL: {
        UNROLL_DURATION: 2.0,         // Seconds for scroll to unroll
        TEXT_FADE_DURATION: 1.0,      // Seconds for text to fade in
        DISPLAY_DURATION: 4.0,        // Seconds to display before fade out
        FADE_OUT_DURATION: 1.5,       // Seconds to fade out
        DELAY_AFTER_FIREWORKS: 0.0,   // Seconds to wait after fireworks end
        
        // Multi-scroll selection
        IDLE_PARCHMENT_SCALE: 0.05,   // Scale when rolled up
        HOVER_SCALE: 1.05,            // Scale when hovering
        HOVER_PULSE_SPEED: 2.0,       // Speed of pulse animation
        SELECTION_PULSE_COUNT: 3,     // Number of confirmation pulses
        SELECTION_PULSE_DURATION: 0.2,// Duration of each pulse
        NON_SELECTED_FADE_DURATION: 1.0, // Fade time for non-selected scrolls
        
        POSITIONS: {
            LEFT: { x: -350, y: 400, z: 200 },
            CENTER: { x: 0, y: 400, z: 200 },
            RIGHT: { x: 350, y: 400, z: 200 }
        },
        
        MOBILE_POSITIONS: {
            LEFT: { x: -260, y: 280, z: 350 },
            CENTER: { x: 0, y: 280, z: 350 },
            RIGHT: { x: 260, y: 280, z: 350 }
        },
        
        MOBILE_SCALE: 0.7  // Scale scrolls down to 70% on mobile
    },

    // Performance Settings
    PERFORMANCE: {
        MAX_PARTICLES: 10000,         // Total particle budget
        PARTICLE_POOL_SIZE: 12000,    // Pre-allocated buffer size
        TARGET_FPS: 60
    },

    // Debug Settings
    DEBUG: {
        SHOW_GESTURE_CANVAS: false,   // Show webcam overlay
        SHOW_STATS: false,            // Show FPS stats
        LOG_GESTURES: true            // Console log gesture events
    }
};
