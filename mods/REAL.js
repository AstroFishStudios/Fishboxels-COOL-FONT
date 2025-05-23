// Realistic Shaders v2.0
// By Fischy6734 (2025)
// Enhanced lighting system with ambient occlusion, dynamic shadows, and optimized performance

// Core lighting constants
const LIGHTING = {
    DEFAULT_FACTOR: 0.85,      // Increased from 0.8 for more contrast
    MIN_INTENSITY: 0.5,        // Lowered from 0.6 for darker shadows
    AMBIENT_LIGHT: 0.2,        // New: Ambient light factor
    MAX_NEIGHBORS: 4,
    UPDATE_INTERVAL: 2,        // Frames between updates
    SHADOW_SOFTNESS: 0.15,     // New: Controls shadow edge softness
    DEPTH_INFLUENCE: 0.7,      // New: How much depth affects lighting
    AO_STRENGTH: 0.6,          // New: Ambient Occlusion strength
    MAX_CACHE_SIZE: 10000      // New: Prevent memory leaks
};

// Enhanced neighbor checking coordinates
const LIGHT_CHECK_PATTERNS = {
    DIRECT: [
        [-1, 0], [1, 0], [0, -1], [0, 1]  // Cardinal directions
    ],
    DIAGONAL: [
        [-1, -1], [-1, 1], [1, -1], [1, 1]  // Diagonal directions
    ],
    EXTENDED: [
        [-2, 0], [2, 0], [0, -2], [0, 2],
        [-2, -1], [-2, 1], [2, -1], [2, 1],
        [-1, -2], [1, -2], [-1, 2], [1, 2],
        [-3, 0], [3, 0], [0, -3], [0, 3]
    ]
};

// Combined coordinate array for optimization
const FOLLOWUP_COORDS_TO_CHECK = [
    ...LIGHT_CHECK_PATTERNS.DIAGONAL,
    ...LIGHT_CHECK_PATTERNS.EXTENDED
];

// Enhanced transparent elements system
class TransparentElementsManager {
    constructor() {
        this.elements = new Set();
        this.defaultTransparent = new Set(
            "glass,stained_glass,glass_shard,solid_diamond,ice,led_r,led_g,led_b,water,steam,cloud,plasma"
            .split(",")
        );
    }

    initialize() {
        this.elements.clear();
        // Add default transparent elements
        this.defaultTransparent.forEach(e => this.elements.add(e));
        
        // Scan elements for additional transparent materials
        Object.entries(elements).forEach(([name, element]) => {
            if (this.shouldBeTransparent(element)) {
                this.elements.add(name);
            }
        });
    }

    shouldBeTransparent(element) {
        return (
            element.state === "gas" ||
            element.category === "special" ||
            element.putInTransparentList ||
            element.isTransparent ||
            (element.properties && element.properties.includes("transparent"))
        );
    }

    isTransparent(elementName) {
        return this.elements.has(elementName);
    }
}

// Enhanced caching system with LRU (Least Recently Used) functionality
class LightingCache {
    constructor(maxSize = LIGHTING.MAX_CACHE_SIZE) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to front (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }
}

// Initialize managers and caches
const transparentManager = new TransparentElementsManager();
const brightnessCache = new LightingCache();
let frameCounter = 0;

// Utility functions
function isOutOfBounds(x, y) {
    return x >= width || y >= height || x < 0 || y < 0;
}

function getNeighborCount(pixel, pattern) {
    return pattern.reduce((count, [dx, dy]) => {
        const x = pixel.x + dx;
        const y = pixel.y + dy;
        
        if (isOutOfBounds(x, y)) return count + 1;
        
        const neighbor = pixelMap[x][y];
        if (neighbor && !transparentManager.isTransparent(neighbor.element)) {
            return count + 1;
        }
        return count;
    }, 0);
}

// Enhanced brightness calculation
function calculateBrightness(pixel) {
    const cacheKey = `${pixel.x},${pixel.y}`;
    const cached = brightnessCache.get(cacheKey);
    if (cached !== undefined) return cached;

    // Calculate direct occlusion
    const directNeighbors = getNeighborCount(pixel, LIGHT_CHECK_PATTERNS.DIRECT);
    if (directNeighbors < LIGHTING.MAX_NEIGHBORS) {
        brightnessCache.set(cacheKey, 1);
        return 1;
    }

    // Calculate extended occlusion
    const extendedNeighbors = getNeighborCount(pixel, FOLLOWUP_COORDS_TO_CHECK);
    const totalPossible = FOLLOWUP_COORDS_TO_CHECK.length;
    
    // Calculate base light factor
    let lightFactor = 1 - (extendedNeighbors / totalPossible);
    
    // Apply ambient occlusion
    lightFactor = Math.pow(lightFactor, 1 + LIGHTING.AO_STRENGTH);
    
    // Apply depth influence
    const depth = pixel.y / height;
    lightFactor *= 1 - (depth * LIGHTING.DEPTH_INFLUENCE);
    
    // Calculate final brightness
    const brightness = Math.max(
        LIGHTING.MIN_INTENSITY,
        lightFactor * LIGHTING.DEFAULT_FACTOR + LIGHTING.AMBIENT_LIGHT
    );

    brightnessCache.set(cacheKey, brightness);
    return brightness;
}

// Enhanced pixel rendering
function drawPixelShade(ctx, pixel, brightness) {
    const shade = 1 - brightness;
    const alpha = Math.min(1, shade + LIGHTING.SHADOW_SOFTNESS);
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgba(0, 0, 0, ${shade})`;
    
    // Soft shadow effect
    if (shade > 0.1) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = pixelSize * 0.5;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    ctx.fillRect(
        pixel.x * pixelSize, 
        pixel.y * pixelSize, 
        pixelSize, 
        pixelSize
    );
}

// Main rendering function
function applyLightingToPixels(ctx) {
    // Update cache periodically
    if (frameCounter % LIGHTING.UPDATE_INTERVAL === 0) {
        currentPixels.forEach(pixel => {
            calculateBrightness(pixel);
        });
    }

    // Apply lighting
    ctx.save();
    currentPixels.forEach(pixel => {
        const brightness = brightnessCache.get(`${pixel.x},${pixel.y}`) || 1;
        drawPixelShade(ctx, pixel, brightness);
    });
    ctx.restore();

    frameCounter++;
}

// Initialize the system
function initializeShaders() {
    transparentManager.initialize();
    brightnessCache.clear();
    frameCounter = 0;
}

// Set up the renderer
renderPostPixel(applyLightingToPixels);

// Initialize on load or reload
initializeShaders();
