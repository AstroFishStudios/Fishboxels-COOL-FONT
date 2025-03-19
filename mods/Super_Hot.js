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
        temp: 1e102, // 100 googol degrees
        conduct: true, // Transfer heat
        tick: function(pixel) {
            pixel.temp = 1e102; // Maintain temperature at 100 googol degrees
        },
        burn: 100,
        burnTime: 200,
        burnInto: ["fire", "smoke"],
    };

    elements.fire = {
        name: "fire",
        color: ["#ff4500", "#ff4500", "#ff4500"], // Original fire colors
        behavior: behaviors.GAS,
        temp: 500,
        category: "gases",
        state: "gas",
        density: 1,
        burn: 20,
        burnTime: 50,
    };

    elements.smoke = {
        name: "smoke",
        color: ["#696969", "#808080", "#a9a9a9"], // Original smoke colors
        behavior: behaviors.GAS,
        temp: 20,
        category: "gases",
        state: "gas",
        density: 0.5,
    };
});
