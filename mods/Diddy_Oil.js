// Diddy Oil Mod

// Function to check availability of required dependencies
function whenAvailable(names, callback) {
    var interval = 10; // ms
    window.setTimeout(function() {
        let bool = true;
        for (let i = 0; i < names.length; i++) {
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

var modName = "mods/diddy_oil.js";

whenAvailable(["elements"], function() {
    elements.diddy_oil = {
        name: "Diddy Oil",
        color: "#f5deb3",
        behavior: behaviors.LIQUID,
        viscosity: 10000, // Higher viscosity to make it sticky
        state: "liquid",
        density: 800,
        tempHigh: 300, // Temperature at which it evaporates
        stateHigh: "steam", // Turns into steam when heated
        conduct: false, // Does not conduct heat
        category: "liquids",
        tick: function(pixel) {
            if (!pixel.tickCount) pixel.tickCount = 0;
            pixel.tickCount++;

            // Reduce the frequency of the attraction logic to every 10 ticks
            if (pixel.tickCount % 10 === 0) {
                // Find all human pixels within a radius of 10
                var nearbyHumans = findPixels("human", pixel.x, pixel.y, 10);
                for (var i = 0; i < nearbyHumans.length; i++) {
                    var human = nearbyHumans[i];
                    // Make the human move towards the Diddy Oil
                    if (human) {
                        var dx = pixel.x - human.x;
                        var dy = pixel.y - human.y;
                        human.vx += dx * 0.01; // Adjust the attraction strength as needed
                        human.vy += dy * 0.01; // Adjust the attraction strength as needed
                    }
                }
            }
        },
    };
});
