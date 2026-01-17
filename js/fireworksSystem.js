/**
 * FireworksSystem.js
 * Manages particle-based fireworks animation that forms Chinese characters
 */

import { CONFIG } from './config.js';

export class FireworksSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.isAnimating = false;
        this.targetPoints = [];
        
        // Pre-allocate particle pool for performance
        this.particlePool = this.createParticlePool();
        this.activeParticles = [];
    }

    /**
     * Create a reusable particle pool
     */
    createParticlePool() {
        const pool = [];
        const poolSize = CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE;
        
        for (let i = 0; i < poolSize; i++) {
            pool.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                target: new THREE.Vector3(),
                color: new THREE.Color(),
                life: 0,
                maxLife: 0,
                size: CONFIG.FIREWORKS.PARTICLE_SIZE,
                phase: 'inactive', // 'launch', 'converge', 'explode', 'fade', 'inactive'
                alpha: 0,
                isActive: false
            });
        }
        
        return pool;
    }

    /**
     * Launch fireworks to form target text points
     * @param {Array} targetPoints - Array of {x, y, z, color} points
     */
    launch(targetPoints) {
        if (this.isAnimating) {
            console.log('⚠️ Animation already in progress');
            return;
        }

        this.targetPoints = targetPoints;
        this.isAnimating = true;
        this.activeParticles = [];

        // Create launch particles
        const launchCount = CONFIG.FIREWORKS.LAUNCH_COUNT;
        const pointsPerParticle = Math.ceil(targetPoints.length / launchCount);

        for (let i = 0; i < targetPoints.length; i++) {
            const target = targetPoints[i];
            
            // Get particle from pool
            const particle = this.getParticleFromPool();
            if (!particle) break; // Pool exhausted

            // Launch from bottom center with spread
            const launchX = (Math.random() - 0.5) * CONFIG.FIREWORKS.LAUNCH_SPREAD;
            const launchY = -400;
            const launchZ = target.z + (Math.random() - 0.5) * 200;

            particle.position.set(launchX, launchY, launchZ);
            particle.target.set(target.x, target.y, target.z);
            particle.color.setHex(target.color);
            particle.targetZ = target.z; // Store for atmospheric perspective
            
            // Launch velocity
            const direction = particle.target.clone().sub(particle.position).normalize();
            const speed = CONFIG.FIREWORKS.LAUNCH_SPEED + Math.random() * 5;
            particle.velocity.copy(direction).multiplyScalar(speed);
            
            particle.life = 0;
            particle.maxLife = CONFIG.FIREWORKS.RISE_TIME;
            particle.phase = 'launch';
            particle.alpha = 1;
            particle.isActive = true;
            particle.size = CONFIG.FIREWORKS.PARTICLE_SIZE;

            this.activeParticles.push(particle);
        }

        // Create Three.js geometry
        this.createParticleMesh();

        console.log(`🎆 Launched ${this.activeParticles.length} firework particles`);
    }

    /**
     * Get an inactive particle from the pool
     */
    getParticleFromPool() {
        return this.particlePool.find(p => !p.isActive);
    }

    /**
     * Create Three.js mesh for particles
     */
    createParticleMesh() {
        // Remove old mesh
        if (this.particleMesh) {
            this.scene.remove(this.particleMesh);
            this.particleMesh.geometry.dispose();
            this.particleMesh.material.dispose();
        }

        // Create buffer geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE * 3);
        const colors = new Float32Array(CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE * 3);
        const sizes = new Float32Array(CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Create material with vertex colors
        const material = new THREE.PointsMaterial({
            size: CONFIG.FIREWORKS.PARTICLE_SIZE,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particleMesh = new THREE.Points(geometry, material);
        this.scene.add(this.particleMesh);
    }

    /**
     * Update particle animation (called every frame)
     * @param {number} deltaTime - Time since last frame (seconds)
     */
    update(deltaTime) {
        if (!this.isAnimating || this.activeParticles.length === 0) {
            return;
        }

        const positions = this.particleMesh.geometry.attributes.position.array;
        const colors = this.particleMesh.geometry.attributes.color.array;
        const sizes = this.particleMesh.geometry.attributes.size.array;

        let activeCount = 0;

        this.activeParticles.forEach((particle, index) => {
            if (!particle.isActive) return;

            particle.life += deltaTime;
            const lifeRatio = Math.min(particle.life / particle.maxLife, 1);

            // Phase-based behavior
            switch (particle.phase) {
                case 'launch':
                    this.updateLaunchPhase(particle, lifeRatio, deltaTime);
                    break;
                case 'explode':
                    this.updateExplodePhase(particle, lifeRatio, deltaTime);
                    break;
                case 'fade':
                    this.updateFadePhase(particle, lifeRatio, deltaTime);
                    break;
            }

            // Update buffer arrays
            const i3 = index * 3;
            positions[i3] = particle.position.x;
            positions[i3 + 1] = particle.position.y;
            positions[i3 + 2] = particle.position.z;

            colors[i3] = particle.color.r;
            colors[i3 + 1] = particle.color.g;
            colors[i3 + 2] = particle.color.b;

            // Apply atmospheric perspective - particles further back (negative z) are dimmer
            const depthFactor = particle.targetZ ? Math.max(0.6, 1 - (Math.abs(particle.targetZ) / 50)) : 1;
            const finalAlpha = particle.alpha * depthFactor;

            sizes[index] = particle.size * finalAlpha;

            if (particle.isActive) activeCount++;
        });

        // Update geometry
        this.particleMesh.geometry.attributes.position.needsUpdate = true;
        this.particleMesh.geometry.attributes.color.needsUpdate = true;
        this.particleMesh.geometry.attributes.size.needsUpdate = true;
        this.particleMesh.material.opacity = 0.9;

        // Check if animation is complete
        if (activeCount === 0) {
            this.isAnimating = false;
            console.log('✅ Fireworks animation complete');
        }
    }

    /**
     * Update particle during launch phase (rising to target)
     */
    updateLaunchPhase(particle, lifeRatio, deltaTime) {
        if (lifeRatio >= 1) {
            // Transition to explode phase
            particle.phase = 'explode';
            particle.life = 0;
            particle.maxLife = 0.3; // Quick explosion
            particle.position.copy(particle.target);
            
            // Create explosion burst
            this.createExplosion(particle);
            return;
        }

        // Move towards target with easing
        const t = this.easeOutCubic(lifeRatio);
        particle.position.lerpVectors(
            particle.position.clone().sub(particle.velocity.clone().multiplyScalar(deltaTime)),
            particle.target,
            t * 0.1
        );

        // Apply velocity with slight gravity
        particle.velocity.y -= 9.8 * deltaTime * 0.5;
        particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
    }

    /**
     * Update particle during explosion phase
     */
    updateExplodePhase(particle, lifeRatio, deltaTime) {
        if (lifeRatio >= 1) {
            particle.phase = 'fade';
            particle.life = 0;
            particle.maxLife = CONFIG.FIREWORKS.FADE_TIME;
            return;
        }

        // Quick bright flash
        particle.size = CONFIG.FIREWORKS.PARTICLE_SIZE * (1 + Math.sin(lifeRatio * Math.PI) * 2);
        particle.alpha = 1;
    }

    /**
     * Update particle during fade phase
     */
    updateFadePhase(particle, lifeRatio, deltaTime) {
        if (lifeRatio >= 1) {
            particle.isActive = false;
            particle.alpha = 0;
            return;
        }

        // Fade and fall
        particle.alpha = 1 - lifeRatio;
        particle.velocity.y -= 9.8 * deltaTime * CONFIG.FIREWORKS.GRAVITY;
        particle.velocity.multiplyScalar(CONFIG.FIREWORKS.DRAG);
        particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
        particle.size = CONFIG.FIREWORKS.PARTICLE_SIZE * (1 - lifeRatio * 0.5);
    }

    /**
     * Create explosion particles at target point
     */
    createExplosion(centerParticle) {
        const explosionCount = CONFIG.FIREWORKS.EXPLOSION_PARTICLES;
        const explosionSize = CONFIG.FIREWORKS.EXPLOSION_SIZE;

        for (let i = 0; i < explosionCount; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;

            // Random direction
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = Math.random() * 3 + 2;

            particle.position.copy(centerParticle.position);
            particle.velocity.set(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            );

            particle.color.copy(centerParticle.color);
            particle.life = 0;
            particle.maxLife = CONFIG.FIREWORKS.FADE_TIME;
            particle.phase = 'fade';
            particle.alpha = 1;
            particle.isActive = true;
            particle.size = CONFIG.FIREWORKS.PARTICLE_SIZE * 0.7;

            this.activeParticles.push(particle);
        }
    }

    /**
     * Easing function for smooth animation
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Reset system
     */
    reset() {
        this.isAnimating = false;
        this.activeParticles.forEach(p => {
            p.isActive = false;
            p.alpha = 0;
        });
        this.activeParticles = [];
    }

    /**
     * Check if animation is running
     */
    isRunning() {
        return this.isAnimating;
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.particleMesh) {
            this.scene.remove(this.particleMesh);
            this.particleMesh.geometry.dispose();
            this.particleMesh.material.dispose();
        }
        this.particlePool = [];
        this.activeParticles = [];
    }
}
