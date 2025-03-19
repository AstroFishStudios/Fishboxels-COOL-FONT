// Liquid Bust Mod

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

var modName = "mods/bust.js";

whenAvailable(["elements"], function() {
    elements.bust = {
        color: "#8b0000",
        behavior: behaviors.LIQUID,
        category: "liquids",
        viscosity: 1000,
        state: "liquid",
        density: 1200,
        tempHigh: 500,
        stateHigh: "bust_gas",
        tempLow: -10,
        stateLow: "frozen_bust",
        reactions: {
            water: { elem1: "bust", elem2: "water", chance: 0.5 },
        },
    };

    elements.frozen_bust = {
        color: "#5a0000",
        behavior: behaviors.WALL,
        category: "solids",
        state: "solid",
        density: 1300,
        tempHigh: -10,
        stateHigh: "bust",
    };

    elements.bust_gas = {
        color: "#ff4500",
        behavior: behaviors.GAS,
        category: "gases",
        state: "gas",
        density: 0.5,
        tempLow: 500,
        stateLow: "bust",
    };
});
