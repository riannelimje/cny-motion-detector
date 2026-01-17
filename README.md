# 🎆 CNY Motion Detector - Gesture-Triggered Fireworks

An interactive Chinese New Year experience that uses **hand gesture detection** to trigger stunning fireworks that spell out **"新年快乐"** (Happy New Year) in the sky, with Marina Bay Sands as the backdrop.

## ✨ Features

- 🖐️ **Hand Gesture Detection** - Uses MediaPipe Hands to detect fist-to-open-palm gesture
- 🎆 **Text-Forming Fireworks** - Fireworks particles converge to form Chinese characters
- 🌃 **Marina Bay Sands Backdrop** - Night-time Singapore skyline aesthetic
- ⚡ **High Performance** - Optimized particle system (~60 FPS)
- 🎨 **Chinese New Year Theme** - Red and gold color palette
- 🔄 **Reusable** - Returns to fist to trigger again

## 🚀 Quick Start

### Option 1: Development Server (Recommended)

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev
```

Then visit: `http://localhost:5173` (opens automatically)

### Option 2: Direct Browser

Simply open `index.html` in Chrome, Edge, or Safari - no server needed!

## 🎮 How to Use

1. **Allow webcam access** when prompted
2. **Position your hand** in front of the webcam
3. **Make a fist** ✊ (all fingers closed)
4. **Open your palm** 🖐️ (extend fingers)
5. **Watch the fireworks** spell out "新年快乐"! 🎆
6. **Return to fist** to trigger again

## 📁 Project Structure

```
cny-motion-detector/
├── index.html              # Main HTML entry point
├── styles/
│   └── main.css           # Styling and layout
├── js/
│   ├── main.js            # Application orchestrator
│   ├── config.js          # Centralized configuration
│   ├── gestureDetector.js # MediaPipe hand tracking
│   ├── textToPoints.js    # Text-to-point-cloud converter
│   ├── fireworksSystem.js # Particle animation system
│   └── sceneManager.js    # Three.js scene setup
└── README.md
```

## 🛠️ Technical Details

### Core Technologies

- **Three.js** (r159) - 3D graphics and particle system
- **MediaPipe Hands** - Real-time hand tracking
- **WebGL** - Hardware-accelerated rendering
- **Canvas API** - Text sampling for point cloud generation

### Gesture Detection Logic

```javascript
// Finger counting logic
Fist: < 3 fingers extended
Open Palm: ≥ 3 fingers extended

// Trigger condition
Transition: FIST → OPEN PALM
Cooldown: 1 second between triggers
```

### Fireworks Animation Flow

1. **Launch Phase** - Particles rise from bottom with velocity
2. **Converge Phase** - Particles move toward target text positions
3. **Explosion Phase** - Mini bursts at each character point
4. **Fade Phase** - Particles fall with gravity and fade out

### Performance Optimizations

- ✅ **Particle Pooling** - Pre-allocated 12,000 particle buffer
- ✅ **Buffer Reuse** - No runtime allocations during animation
- ✅ **Additive Blending** - Efficient GPU compositing
- ✅ **Depth Write Disabled** - Faster transparent rendering
- ✅ **Size Attenuation** - Perspective-correct particle sizing

## ⚙️ Configuration

Edit `js/config.js` to customize:

```javascript
TEXT: {
    CONTENT: '新年快乐',      // Change text
    FONT_SIZE: 180,          // Character size
    SAMPLE_DENSITY: 0.3      // Particle density
}

FIREWORKS: {
    LAUNCH_COUNT: 80,        // Particles per character
    EXPLOSION_SIZE: 50,      // Explosion radius
    FADE_TIME: 2.0          // Duration of fade
}

COLORS: {
    GOLD: 0xFFD700,
    RED: 0xFF0000,
    YELLOW: 0xFFFF00
}
```

## 🐛 Debug Mode

Open browser console and type:

```javascript
toggleDebug()
```

This shows:
- Webcam feed overlay
- Hand landmark visualization
- Gesture state tracking

## 🎯 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Recommended |
| Edge 90+ | ✅ Full | Recommended |
| Safari 14+ | ✅ Full | May need permissions |
| Firefox 88+ | ⚠️ Partial | MediaPipe may be slower |

## 📊 Performance Targets

- **FPS**: 60 (target)
- **Particle Count**: ~8,000 active
- **Memory**: < 150 MB
- **Latency**: < 100ms gesture detection

## 🔧 Troubleshooting

### Webcam not working
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser

### Low FPS
- Reduce `SAMPLE_DENSITY` in config
- Lower `EXPLOSION_PARTICLES`
- Close other tabs

### Gesture not detecting
- Ensure good lighting
- Position hand clearly in frame
- Try larger hand movements

## 🎨 Customization Ideas

- **Different Text**: Change `TEXT.CONTENT` in config
- **More Characters**: Adjust `TEXT.SPACING_X`
- **Custom Colors**: Modify `COLORS.PALETTE`
- **Different Backdrop**: Replace gradient in `sceneManager.js`
- **Sound Effects**: Add Web Audio API integration

## 📝 License

MIT License - Feel free to use and modify!

## 🙏 Credits

- **MediaPipe** by Google - Hand tracking
- **Three.js** - 3D graphics library
- **Inspired by** - Traditional Chinese New Year fireworks celebrations

---

Made with ❤️ for Chinese New Year 2026 🎆

**恭喜发财! 新年快乐!** 🧧
