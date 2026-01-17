/**
 * SceneManager.js
 * Manages Three.js scene, camera, renderer, and Marina Bay Sands backdrop
 */

import { CONFIG } from './config.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    /**
     * Initialize Three.js scene
     */
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.SCENE.BACKGROUND_COLOR);
        this.scene.fog = new THREE.Fog(
            CONFIG.SCENE.FOG_COLOR,
            CONFIG.SCENE.FOG_NEAR,
            CONFIG.SCENE.FOG_FAR
        );

        // Create camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.SCENE.FOV,
            aspect,
            CONFIG.SCENE.NEAR,
            CONFIG.SCENE.FAR
        );
        this.camera.position.set(0, 200, 1000);
        this.camera.lookAt(0, 200, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Add backdrop and lights
        this.createBackdrop();
        this.createLights();

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());

        console.log('✅ SceneManager initialized');
    }

    /**
     * Create Marina Bay Sands backdrop
     */
    createBackdrop() {
        // Create a simple dark gradient backdrop
        // In production, you would load an actual Marina Bay Sands image
        const backdropGeometry = new THREE.PlaneGeometry(
            CONFIG.BACKDROP.WIDTH,
            CONFIG.BACKDROP.HEIGHT
        );

        // Create gradient texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Night sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#000510');
        gradient.addColorStop(0.5, '#001530');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // Add city silhouette suggestion (simplified)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 400, 512, 112);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);

        const backdropMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: CONFIG.BACKDROP.OPACITY,
            side: THREE.DoubleSide
        });

        const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
        backdrop.position.z = CONFIG.BACKDROP.POSITION_Z;
        backdrop.position.y = 0;
        this.scene.add(backdrop);

        // Add ambient stars
        this.createStars();
    }

    /**
     * Create star field
     */
    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 4000;
            positions[i * 3 + 1] = Math.random() * 1000 + 200;
            positions[i * 3 + 2] = -Math.random() * 2000 - 500;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    /**
     * Create lights
     */
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        // Directional light (moonlight)
        const moonLight = new THREE.DirectionalLight(0x9999FF, 0.3);
        moonLight.position.set(-100, 200, -100);
        this.scene.add(moonLight);

        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(CONFIG.COLORS.GOLD, 0.5, 1000);
        pointLight.position.set(0, 400, 200);
        this.scene.add(pointLight);
    }

    /**
     * Handle window resize
     */
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Render scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Get delta time
     */
    getDeltaTime() {
        return this.clock.getDelta();
    }

    /**
     * Get scene for adding objects
     */
    getScene() {
        return this.scene;
    }

    /**
     * Cleanup
     */
    dispose() {
        this.renderer.dispose();
        window.removeEventListener('resize', () => this.onResize());
    }
}
