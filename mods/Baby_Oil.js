// Baby Oil Mod

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

var modName = "mods/baby_oil.js";

whenAvailable(["elements"], function() {
    elements.baby_oil = {
        color: "#f5deb3",
        behavior: behaviors.LIQUID,
        category: "liquids",
        viscosity: 3000,
        state: "liquid",
        density: 850,
        tempHigh: 300,
        stateHigh: "gasoline",
        tempLow: -50,
        stateLow: "frozen_baby_oil",
        reactions: {
            water: { elem1: "baby_oil", elem2: "water", chance: 0.1 },
        },
    };

    elements.frozen_baby_oil = {
        color: "#d2b48c",
        behavior: behaviors.WALL,
        category: "solids",
        state: "solid",
        density: 900,
        tempHigh: -50,
        stateHigh: "baby_oil",
    };
});
