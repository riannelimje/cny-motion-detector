/**
 * TextToPoints.js
 * Converts Chinese characters into a 3D point cloud by sampling canvas pixels
 */

import { CONFIG } from './config.js';

export class TextToPoints {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Convert text string to 3D point cloud
     * @param {string} text - Text to convert (e.g., "新年快乐")
     * @returns {Array} Array of {x, y, z, color} points
     */
    convertToPoints(text = CONFIG.TEXT.CONTENT) {
        const fontSize = CONFIG.TEXT.FONT_SIZE;
        const characters = text.split('');
        const allPoints = [];

        // Set up canvas
        this.canvas.width = fontSize * 2;
        this.canvas.height = fontSize * 2;
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${fontSize}px ${CONFIG.TEXT.FONT_FAMILY}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Process each character
        characters.forEach((char, charIndex) => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw character
            this.ctx.fillText(char, this.canvas.width / 2, this.canvas.height / 2);
            
            // Get pixel data
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const pixels = imageData.data;
            
            // Sample points from non-transparent pixels
            const charPoints = [];
            const density = CONFIG.TEXT.SAMPLE_DENSITY;
            
            for (let y = 0; y < this.canvas.height; y += 1) {
                for (let x = 0; x < this.canvas.width; x += 1) {
                    const index = (y * this.canvas.width + x) * 4;
                    const alpha = pixels[index + 3];
                    
                    // If pixel is visible and passes random sampling
                    if (alpha > 128 && Math.random() < density) {
                        // Convert 2D canvas coords to 3D world coords
                        // Center each character horizontally
                        const worldX = (x - this.canvas.width / 2) + 
                                      (charIndex - (characters.length - 1) / 2) * CONFIG.TEXT.SPACING_X;
                        const worldY = -(y - this.canvas.height / 2) + CONFIG.TEXT.POSITION_Y;
                        const worldZ = CONFIG.TEXT.POSITION_Z;
                        
                        // Assign color (weighted towards gold, with some variety)
                        const colorRoll = Math.random();
                        let color;
                        if (colorRoll < 0.6) {
                            color = CONFIG.COLORS.GOLD;
                        } else if (colorRoll < 0.8) {
                            color = CONFIG.COLORS.RED;
                        } else {
                            color = CONFIG.COLORS.YELLOW;
                        }
                        
                        charPoints.push({
                            x: worldX,
                            y: worldY,
                            z: worldZ,
                            color: color
                        });
                    }
                }
            }
            
            allPoints.push(...charPoints);
        });

        console.log(`✅ Generated ${allPoints.length} points from text: "${text}"`);
        return allPoints;
    }

    /**
     * Add slight randomness to points for organic feel
     */
    jitterPoints(points, amount = 5) {
        return points.map(p => ({
            ...p,
            x: p.x + (Math.random() - 0.5) * amount,
            y: p.y + (Math.random() - 0.5) * amount,
            z: p.z + (Math.random() - 0.5) * amount
        }));
    }

    /**
     * Get bounding box of point cloud
     */
    getBoundingBox(points) {
        if (points.length === 0) return null;

        const bounds = {
            minX: Infinity, maxX: -Infinity,
            minY: Infinity, maxY: -Infinity,
            minZ: Infinity, maxZ: -Infinity
        };

        points.forEach(p => {
            bounds.minX = Math.min(bounds.minX, p.x);
            bounds.maxX = Math.max(bounds.maxX, p.x);
            bounds.minY = Math.min(bounds.minY, p.y);
            bounds.maxY = Math.max(bounds.maxY, p.y);
            bounds.minZ = Math.min(bounds.minZ, p.z);
            bounds.maxZ = Math.max(bounds.maxZ, p.z);
        });

        return bounds;
    }
}
