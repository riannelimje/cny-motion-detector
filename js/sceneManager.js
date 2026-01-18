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
        // Backdrop is now a CSS background, so Three.js scene is transparent
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
        this.camera.position.set(0, 400, 800);
        this.camera.lookAt(0, 450, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true, // Enable transparency to show backdrop
            powerPreference: 'high-performance'
        });
        this.renderer.setClearColor(0x000000, 0); // Fully transparent
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Add lights (no backdrop plane needed - using CSS background)
        this.createLights();

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());

        console.log('✅ SceneManager initialized');
    }

    /**
     * Create Marina Bay Sands backdrop
     */
    createBackdrop() {
        const backdropGeometry = new THREE.PlaneGeometry(
            CONFIG.BACKDROP.WIDTH,
            CONFIG.BACKDROP.HEIGHT
        );

        // Load actual Marina Bay Sands night skyline image
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            '/images/backdrop.jpeg',
            (texture) => {
                // Success callback
                const backdropMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: false,
                    side: THREE.DoubleSide,
                    depthWrite: true
                });

                const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
                backdrop.position.z = CONFIG.BACKDROP.POSITION_Z;
                backdrop.position.y = CONFIG.BACKDROP.POSITION_Y;
                this.scene.add(backdrop);

                console.log('✅ Marina Bay Sands backdrop loaded successfully');
                console.log('Backdrop position:', backdrop.position);
                console.log('Camera position:', this.camera.position);
                console.log('Texture loaded:', texture);
            },
            undefined,
            (error) => {
                // Error callback - fallback to gradient
                console.warn('⚠️ Failed to load backdrop image, using fallback:', error);
                this.createFallbackBackdrop(backdropGeometry);
            }
        );

        // Add ambient stars
        this.createStars();
    }

    /**
     * Create fallback backdrop if image fails to load
     */
    createFallbackBackdrop(geometry) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#000510');
        gradient.addColorStop(0.5, '#001530');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 400, 512, 112);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: CONFIG.BACKDROP.OPACITY,
            side: THREE.DoubleSide
        });

        const backdrop = new THREE.Mesh(geometry, material);
        backdrop.position.z = CONFIG.BACKDROP.POSITION_Z;
        backdrop.position.y = CONFIG.BACKDROP.POSITION_Y;
        this.scene.add(backdrop);
        console.log('✅ Fallback backdrop created');
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
        // Ambient light (increased for scroll visibility)
        const ambientLight = new THREE.AmbientLight(0x666666);
        this.scene.add(ambientLight);

        // Directional light (moonlight)
        const moonLight = new THREE.DirectionalLight(0x9999FF, 0.3);
        moonLight.position.set(-100, 200, -100);
        this.scene.add(moonLight);

        // Spotlight for scroll (warm light from above)
        const scrollLight = new THREE.SpotLight(0xFFEECC, 1.5);
        scrollLight.position.set(0, 800, 400);
        scrollLight.angle = Math.PI / 6;
        scrollLight.penumbra = 0.3;
        scrollLight.decay = 2;
        scrollLight.distance = 1000;
        this.scene.add(scrollLight);

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
     * Get camera for raycasting
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Cleanup
     */
    dispose() {
        this.renderer.dispose();
        window.removeEventListener('resize', () => this.onResize());
    }
}
