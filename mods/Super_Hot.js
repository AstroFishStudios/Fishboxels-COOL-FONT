// SUPER HOT Mod

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

var modName = "mods/super_hot.js";

whenAvailable(["elements"], function() {
    elements.super_hot = {
        name: "SUPER HOT",
        color: "#ff4500",
        behavior: behaviors.WALL,
        category: "solids",
        state: "solid",
        density: 8000,
        temp: 1e100, // 1 googol degrees
        conduct: true, // Transfer heat
        tick: function(pixel) {
            pixel.temp = 1e100; // Maintain temperature at 1 googol degrees
        },
    };
});
