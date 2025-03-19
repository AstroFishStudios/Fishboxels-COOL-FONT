// Diddy Oil Mod

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
        category: "liquids"
    };
});
