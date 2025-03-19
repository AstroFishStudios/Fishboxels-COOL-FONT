// Diddy Dog Mod

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

var modName = "mods/diddy_dog.js";

whenAvailable(["elements", "behaviors"], function() {
    elements.diddy_dog = {
        color: ["#c78950", "#ffffff", "#262524", "#664120", "#453120" ],
        behavior: [
            "XX|XX|XX",
            "M2%5|XX|M2%5",
            "M2|M1|M2"
        ],
        reactions: {
            "meat": { elem2: null, chance: 0.5, func: behaviors.FEEDPIXEL },
            "egg": { elem2: null, chance: 0.5, func: behaviors.FEEDPIXEL },
            "yolk": { elem2: null, chance: 0.5, func: behaviors.FEEDPIXEL },
            "cheese": { elem2: null, chance: 0.5, func: behaviors.FEEDPIXEL },
            "ice_cube": { elem2: null, chance: 0.8, func: behaviors.FEEDPIXEL },
            "cooked_meat": { elem2: null, chance: 0.5, func: behaviors.FEEDPIXEL },
            "chocolate": { elem2: null, chance: 0.2, func: behaviors.FEEDPIXEL, elem1: "rotten_meat" },
            "grape": { elem2: null, chance: 0.2, func: behaviors.FEEDPIXEL, elem1: "rotten_meat" },
            "rat": { elem2: null, chance: 0.3, func: behaviors.FEEDPIXEL },
            "dog_food": { elem2: null, chance: 0.8, func: behaviors.FEEDPIXEL },
            "nut_butter": { elem2: null, chance: 0.5, func: behaviors.FEEDPIXEL },
            "infection": { elem1: "dog_with_rabies", chance: 0.4 },
            "dog_with_rabies": { elem1: "dog_with_rabies", chance: 0.3 },
        },
        category: "life",
        state: "solid",
        tempHigh: 100,
        stateHigh: "cooked_meat",
        breakInto: "rotten_meat",
        tempLow: -20,
        stateLow: "frozen_meat",
    };
});
