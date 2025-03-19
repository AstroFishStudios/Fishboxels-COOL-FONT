// Unmeltable Steel Mod

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

var modName = "mods/unmeltable_steel.js";

whenAvailable(["elements"], function() {
    elements.unmeltable_steel = {
        color: "#b0b0b0",
        behavior: behaviors.WALL,
        category: "solids",
        state: "solid",
        density: 7850,
        conduct: true,
        tempHigh: Infinity, // Cannot melt
        tempLow: -200, // Can freeze to a lower state if needed, but won't affect heat conductivity
    };
});
