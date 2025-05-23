elements.plasma_torch = {
    color: "#00ffff",
    behavior: [
        "XX|HE:10|XX",
        "HE:10|XX|HE:10",
        "XX|HE:10|XX"
    ],
    category: "tools",
    state: "solid",
    temp: 15000,
    hardness: 1,
    hidden: false,
    cooldown: 3,
    excludeRandom: true,
    placable: true,
    desc: "A high-temperature plasma torch that can cut through most materials.",

    // Initialize properties when placed
    onInit: function(pixel) {
        pixel.activated = false;
        pixel.charge = 100;  // Energy charge level
        pixel.temp = 300;    // Start at room temperature
    },

    // Active state properties
    tick: function(pixel) {
        if (!pixel) { return }
        
        // Handle activation state
        if (pixel.charge <= 0) {
            pixel.activated = false;
            pixel.color = "#00ffff";  // Inactive color
            return;
        }

        // Toggle activation on right click
        if (pixelTicks % 3 === 0 && pixel === pixelMap[currentPixels.indexOf(pixel)]) {
            if (rightDown) {
                pixel.activated = !pixel.activated;
                // Play activation sound effect if available
                if (typeof(audio) !== "undefined") {
                    audio.play("spark");
                }
            }
        }

        // Active state behavior
        if (pixel.activated) {
            // Visual effects
            pixel.color = `rgb(${100 + Math.random()*155},${150 + Math.random()*105},${255})`;
            
            // Temperature effects
            pixel.temp = 15000;
            pixel.charge -= 0.5;

            // Create plasma field
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    
                    let x = pixel.x + i;
                    let y = pixel.y + j;
                    
                    if (!isEmpty(x, y, true)) {
                        let targetPixel = pixelMap[y * width + x];
                        if (targetPixel && targetPixel.element !== "plasma_torch") {
                            // Heat effect
                            if (targetPixel.temp < 15000) {
                                targetPixel.temp += 500;
                            }
                            
                            // Cut through materials based on their hardness
                            if (elements[targetPixel.element].hardness < 0.9) {
                                deletePixel(x, y);
                                // Create plasma particles
                                if (Math.random() < 0.3) {
                                    createPixel("plasma", x, y);
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Cooling when inactive
            if (pixel.temp > 300) {
                pixel.temp -= 50;
            }
            // Recharge when inactive
            if (pixel.charge < 100) {
                pixel.charge += 0.1;
            }
        }
    },

    // Generate plasma particles on destruction
    onDelete: function(pixel) {
        if (pixel.activated) {
            for (let i = 0; i < 4; i++) {
                if (Math.random() < 0.5) {
                    createPixel("plasma", pixel.x + (Math.random()*2-1), pixel.y + (Math.random()*2-1));
                }
            }
        }
    },

    // Custom effects for plasma torch
    effects: {
        "conducts": true,
        "energy": 100,
    },

    // Additional properties
    related: ["plasma", "laser"],
    maxSize: 1,
};

// Add special reactions with the plasma torch
elements.plasma_torch.reactions = {
    "water": { "elem2": "steam", "chance": 1 },
    "ice": { "elem2": "steam", "chance": 1 },
    "snow": { "elem2": "steam", "chance": 1 },
};

// Optional: Add plasma torch energy consumption
if (enabledMods.includes("mods/energy.js")) {
    elements.plasma_torch.properties = elements.plasma_torch.properties || {};
    elements.plasma_torch.properties.energy = {
        voltage: 220,
        current: 40,
        conductivity: 1,
        loss: 0.05,
        enabled: true
    };
}