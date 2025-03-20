// Diddy Mod

// Function to check availability of required dependencies
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

var modName = "mods/diddy.js";

whenAvailable(["elements"], function() {
    elements.diddy = {
        name: "Diddy",
        color: "#00ff00", // Green color for Diddy
        behavior: behaviors.HUMAN,
        category: "life",
        state: "solid",
        density: 1000,
        temp: 37, // Normal human body temperature
        conduct: true, // Can conduct heat
        reactions: {
            "fire": { "elem1": "ash", "elem2": "smoke", "chance": 0.1 }
        },
        tick: function(pixel) {
            // Add custom behavior for Diddy here
            // Example: Diddy moves randomly
            if (!pixel.ticks) pixel.ticks = 0;
            pixel.ticks++;
            if (pixel.ticks % 10 === 0) {
                pixel.vx = Math.random() * 2 - 1;
                pixel.vy = Math.random() * 2 - 1;
            }
        }
    };
});
