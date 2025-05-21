// Fun Menu Mod by Fischy6734
// Created: 2025-05-21

function whenAvailable(names, callback) {
    var interval = 10; // ms
    window.setTimeout(function() {
        let bool = true;
        for(let i = 0; i < names.length; i++) {
            if (!window[names[i]]) {
                bool = false;
            }
        }
        if (bool) {
            callback();
        } else {
            whenAvailable(names, callback);
        }
    }, interval);
}

var modName = "mods/fun_menu_mod.js";

whenAvailable(["elements"], function() {
    // Create a new category for fun elements
    categories.fun_stuff = {
        name: "Fun Stuff",
        icon: "🎈",
        color: "#ff69b4"
    };

    // Rainbow Powder - Changes color randomly
    elements.rainbow_powder = {
        name: "Rainbow Powder",
        color: "#ff0000",
        behavior: behaviors.POWDER,
        category: "fun_stuff",
        density: 1000,
        tick: function(pixel) {
            pixel.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        },
    };

    // Bouncy Ball - A powder that bounces
    elements.bouncy_ball = {
        name: "Bouncy Ball",
        color: "#4CAF50",
        behavior: behaviors.POWDER,
        category: "fun_stuff",
        density: 500,
        hardness: 0.8,
        tick: function(pixel) {
            if (pixel.vy < 10) { // If not falling too fast
                pixel.vy += 0.5; // Add some upward velocity
            }
            if (pixel.vy > 0 && !isEmpty(pixel.x, pixel.y + 1)) {
                pixel.vy = -pixel.vy * 0.8; // Bounce with 80% energy retention
            }
        },
    };

    // Party Pixel - Creates a colorful explosion
    elements.party_pixel = {
        name: "Party Pixel",
        color: "#FFD700",
        behavior: behaviors.WALL,
        category: "fun_stuff",
        state: "solid",
        tick: function(pixel) {
            if (Math.random() < 0.1) {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (isEmpty(pixel.x + i, pixel.y + j)) {
                            createPixel("rainbow_powder", pixel.x + i, pixel.y + j);
                        }
                    }
                }
            }
        },
    };

    // Magic Paint - Transforms other elements it touches
    elements.magic_paint = {
        name: "Magic Paint",
        color: ["#9400D3", "#8A2BE2", "#9370DB"],
        behavior: behaviors.LIQUID,
        category: "fun_stuff",
        viscosity: 1000,
        density: 1100,
        tick: function(pixel) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    let newX = pixel.x + i;
                    let newY = pixel.y + j;
                    if (!isEmpty(newX, newY) && pixelMap[newX][newY].element !== "magic_paint") {
                        let newPixel = pixelMap[newX][newY];
                        newPixel.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                        if (Math.random() < 0.1) {
                            newPixel.element = "rainbow_powder";
                        }
                    }
                }
            }
        },
    };

    // Fireworks Launcher
    elements.firework_launcher = {
        name: "Firework Launcher",
        color: "#FF4500",
        behavior: behaviors.WALL,
        category: "fun_stuff",
        tick: function(pixel) {
            if (Math.random() < 0.05) {
                // Launch firework
                for (let y = 1; y <= 10; y++) {
                    if (isEmpty(pixel.x, pixel.y - y)) {
                        createPixel("fire", pixel.x, pixel.y - y);
                        pixelMap[pixel.x][pixel.y - y].color = ["#FFD700", "#FF69B4", "#00FF00", "#00FFFF"][Math.floor(Math.random() * 4)];
                        pixelMap[pixel.x][pixel.y - y].vy = -5;
                    }
                }
            }
        },
    };

    // Disco Floor - Changes colors and affects nearby elements
    elements.disco_floor = {
        name: "Disco Floor",
        color: "#FF1493",
        behavior: behaviors.WALL,
        category: "fun_stuff",
        tick: function(pixel) {
            pixel.color = `hsl(${(pixelTicks * 5) % 360}, 100%, 50%)`;
            if (Math.random() < 0.2) {
                // Make nearby pixels dance
                for (let i = -2; i <= 2; i++) {
                    for (let j = -2; j <= 2; j++) {
                        let newX = pixel.x + i;
                        let newY = pixel.y + j;
                        if (!isEmpty(newX, newY) && pixelMap[newX][newY].element !== "disco_floor") {
                            let dancingPixel = pixelMap[newX][newY];
                            dancingPixel.vy -= 1;
                            dancingPixel.vx += (Math.random() - 0.5) * 2;
                        }
                    }
                }
            }
        },
    };
});