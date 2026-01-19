/**
 * MenuManager.js
 * Handles command palette menu, background image upload, and settings
 */

export class MenuManager {
    constructor() {
        this.paletteOverlay = null;
        this.commandPalette = null;
        this.hamburgerBtn = null;
        this.closeBtn = null;
        this.commandInput = null;
        this.commandItems = null;
        this.bgUpload = null;
        this.defaultBackground = '../images/backdrop.jpeg';
        
        this.init();
    }

    /**
     * Initialize menu elements and event listeners
     */
    init() {
        // Get DOM elements
        this.paletteOverlay = document.getElementById('command-palette-overlay');
        this.commandPalette = document.querySelector('.command-palette');
        this.hamburgerBtn = document.getElementById('hamburger-btn');
        this.closeBtn = document.getElementById('close-palette-btn');
        this.commandInput = document.getElementById('command-input');
        this.commandItems = document.querySelectorAll('.command-item');
        this.bgUpload = document.getElementById('bg-upload');

        // Set up event listeners
        this.setupEventListeners();

        // Load saved background if exists
        this.loadSavedBackground();

        console.log('✅ MenuManager (Command Palette) initialized');
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Hamburger button - open palette
        this.hamburgerBtn.addEventListener('click', () => {
            this.openPalette();
        });

        // Close button - close palette
        this.closeBtn.addEventListener('click', () => {
            this.closePalette();
        });

        // Close palette when clicking on overlay background
        this.paletteOverlay.addEventListener('click', (e) => {
            if (e.target === this.paletteOverlay) {
                this.closePalette();
            }
        });

        // Command items
        this.commandItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleCommandClick(item);
            });
        });

        // Search input filtering
        this.commandInput.addEventListener('input', (e) => {
            this.filterCommands(e.target.value);
        });

        // Background image upload
        this.bgUpload.addEventListener('change', (e) => {
            this.handleBackgroundUpload(e);
        });

        // Close palette with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.paletteOverlay.classList.contains('visible')) {
                this.closePalette();
            }
            
            // Keyboard shortcuts (⌘/Ctrl + Key)
            if ((e.metaKey || e.ctrlKey) && this.paletteOverlay.classList.contains('visible')) {
                switch(e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.triggerBackgroundUpload();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetBackground();
                        break;
                    case 'g':
                        e.preventDefault();
                        this.openGitHub();
                        break;
                }
            }
        });
    }

    /**
     * Open command palette
     */
    openPalette() {
        this.paletteOverlay.classList.remove('hidden');
        this.paletteOverlay.classList.add('visible');
        
        // Focus search input
        setTimeout(() => {
            this.commandInput.focus();
        }, 100);
        
        console.log('📂 Command Palette opened');
    }

    /**
     * Close command palette
     */
    closePalette() {
        this.paletteOverlay.classList.remove('visible');
        this.paletteOverlay.classList.add('hidden');
        
        // Clear search input
        this.commandInput.value = '';
        this.filterCommands('');
        
        console.log('📂 Command Palette closed');
    }

    /**
     * Handle command item click
     */
    handleCommandClick(item) {
        const action = item.getAttribute('data-action');
        
        switch(action) {
            case 'upload-background':
                this.triggerBackgroundUpload();
                break;
            case 'reset-background':
                this.resetBackground();
                this.closePalette();
                break;
            case 'view-source':
                this.openGitHub();
                break;
        }
    }

    /**
     * Filter command items based on search query
     */
    filterCommands(query) {
        const lowerQuery = query.toLowerCase();
        
        this.commandItems.forEach(item => {
            const title = item.querySelector('h4').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(lowerQuery) || description.includes(lowerQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Trigger background upload file dialog
     */
    triggerBackgroundUpload() {
        this.bgUpload.click();
    }

    /**
     * Open GitHub repository
     */
    openGitHub() {
        window.open('https://github.com/riannelimje/cny-motion-detector', '_blank', 'noopener,noreferrer');
        this.closePalette();
    }

    /**
     * Handle background image upload
     */
    handleBackgroundUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('Image file is too large. Please upload an image smaller than 10MB');
            return;
        }

        // Create FileReader to read image
        const reader = new FileReader();

        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            
            // Set as background
            this.setBackground(imageDataUrl);
            
            // Save to localStorage
            try {
                localStorage.setItem('customBackground', imageDataUrl);
                console.log('✅ Custom background saved');
                
                // Close palette after successful upload
                this.closePalette();
            } catch (error) {
                console.warn('⚠️ Failed to save background to localStorage:', error);
                alert('Background set but could not be saved for future sessions (file may be too large)');
            }
        };

        reader.onerror = () => {
            alert('Failed to read image file');
        };

        reader.readAsDataURL(file);
    }

    /**
     * Set background image
     */
    setBackground(imageUrl) {
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        console.log('🖼️ Background updated');
    }

    /**
     * Reset to default background
     */
    resetBackground() {
        // Set default background
        this.setBackground(this.defaultBackground);
        
        // Remove from localStorage
        localStorage.removeItem('customBackground');
        
        // Clear file input
        this.bgUpload.value = '';
        
        console.log('🔄 Background reset to default');
    }

    /**
     * Load saved background from localStorage
     */
    loadSavedBackground() {
        const savedBackground = localStorage.getItem('customBackground');
        
        if (savedBackground) {
            this.setBackground(savedBackground);
            console.log('✅ Loaded saved custom background');
        }
    }
}
