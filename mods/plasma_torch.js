elements.plasma_torch = {
    color: "#4080ff",
    behavior: [
        "XX|CR:plasma|XX",
        "CR:plasma|CH:plasma|CR:plasma",
        "XX|CR:plasma|XX"
    ],
    behaviorOn: [
        "XX|CR:plasma%10|XX",
        "CR:plasma%10|CH:plasma|CR:plasma%10",
        "XX|CR:plasma%10|XX"
    ],
    category: "solids",
    state: "solid",
    temp: 3000,
    hardness: 0.8,
    conduct: 1,
    hidden: false,
    excludeRandom: true,
    placable: true,
    desc: "A high-temperature torch that creates plasma. Right-click to toggle.",

    // Initialize properties when placed
    onInit: function(pixel) {
        pixel.activated = false;
        pixel.charge = 100;
    },

    tick: function(pixel) {
        if (!pixel) { return }
        
        // Toggle activation on right click
        if (pixel === pixelMap[currentPixels.indexOf(pixel)]) {
            if (rightDown) {
                pixel.activated = !pixel.activated;
                // Play activation sound if available
                if (typeof(audio) !== "undefined") {
                    audio.play("spark");
                }
            }
        }

        // Active state behavior
        if (pixel.activated) {
            // Visual effect - glowing blue
            pixel.color = `rgb(${64 + Math.random()*50},${128 + Math.random()*50},${255})`;
            
            // Create plasma above the torch
            if (isEmpty(pixel.x, pixel.y-1)) {
                createPixel("plasma", pixel.x, pixel.y-1);
                // Heat the plasma
                let plasmaPixel = pixelMap[(pixel.y-1)*width + pixel.x];
                if (plasmaPixel) {
                    plasmaPixel.temp = 7000;
                }
            }

            // Side plasma jets (less frequent)
            if (Math.random() < 0.1) {
                // Left jet
                if (isEmpty(pixel.x-1, pixel.y)) {
                    createPixel("plasma", pixel.x-1, pixel.y);
                }
                // Right jet
                if (isEmpty(pixel.x+1, pixel.y)) {
                    createPixel("plasma", pixel.x+1, pixel.y);
                }
            }

            // Heat effect
            pixel.temp = Math.min(pixel.temp + 50, 7000);
        } else {
            // Inactive state - cool blue color
            pixel.color = "#4080ff";
            // Cool down when inactive
            if (pixel.temp > 3000) {
                pixel.temp -= 10;
            }
        }

        // Heat surrounding pixels
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                let x = pixel.x + i;
                let y = pixel.y + j;
                
                if (!isEmpty(x, y, true)) {
                    let targetPixel = pixelMap[y * width + x];
                    if (targetPixel && targetPixel.element !== "plasma_torch") {
                        targetPixel.temp += 5;
                    }
                }
            }
        }
    },

    // Create plasma burst when destroyed
    onDelete: function(pixel) {
        if (pixel.activated) {
            for (let i = 0; i < 6; i++) {
                let dx = Math.floor(Math.random()*3) - 1;
                let dy = Math.floor(Math.random()*3) - 1;
                if (isEmpty(pixel.x + dx, pixel.y + dy)) {
                    createPixel("plasma", pixel.x + dx, pixel.y + dy);
                }
            }
        }
    },

    // Properties
    tempHigh: 7000,
    stateHigh: "plasma",
    conduct: 1,
    breakInto: "plasma",
};

// Additional reactions
elements.plasma_torch.reactions = {
    "water": { "elem2": "steam", "chance": 0.5 },
    "ice": { "elem2": "steam", "chance": 0.8 },
    "snow": { "elem2": "steam", "chance": 1 }
};
