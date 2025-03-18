// Metals Mod

// Function to check availability of required dependencies
function whenAvailable(names, callback) {
    var interval = 10; // ms
    window.setTimeout(function() {
        let bool = true;
        for(let i = 0; i < names.length; i++) {
            if(!window[names[i]]) {
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

var modName = "mods/metals.js";
var changeTempMod = "mods/changeTempReactionParameter.js";
var runAfterAutogenMod = "mods/runAfterAutogen2.js";
var libraryMod = "mods/code_library.js";
var onTryMoveIntoMod = "mods/onTryMoveInto.js";

if(enabledMods.includes(changeTempMod) && enabledMods.includes(runAfterAutogenMod) && enabledMods.includes(libraryMod) && enabledMods.includes(onTryMoveIntoMod)) {
    whenAvailable(["runAfterAutogen"], function() {
        elements.iron.hardness = 0.74;

        // Existing metal elements
        elements.chromium = {
            color: ["#c8cccb", "#dce3e0", "#ebedeb"],
            behavior: behaviors.WALL,
            tempHigh: 1907,
            category: "solids",
            density: 7190,
            conduct: 0.35,
            hardness: 0.985,
            state: "solid",
        };

        elements.nichrome = {
            color: ["#d1cfcb", "#dbd7ce", "#e8e2d5"],
            behavior: behaviors.WALL,
            tempHigh: 1400,
            category: "solids",
            density: 8300,
            conduct: 0.75,
            hardness: 0.7,
            state: "solid",
            tick: function(pixel) {
                if(nichromeDoNeighborCount) {
                    var neighbors = 0;
                    for(let i = 0; i < adjacentCoords.length; i++) {
                        if(!isEmpty(pixel.x+adjacentCoords[i][0],pixel.y+adjacentCoords[i][1],true)) {
                            var newPixel = pixelMap[pixel.x+adjacentCoords[i][0]][pixel.y+adjacentCoords[i][1]];
                            if(elements[newPixel.element].conduct) { neighbors++; }
                        }
                    }
                }
                if(pixel.charge) {
                    pixel.temp += ((1.1 + nichromeNeighborLogic(neighbors)) * pixel.charge);
                }
            },
        };

        // Adding New Metal Elements
        elements.titanium = {
            color: ["#b0b0b0", "#bdbdbd", "#c8c8c8"],
            behavior: behaviors.WALL,
            tempHigh: 1668,
            category: "solids",
            density: 4500,
            conduct: 0.23,
            hardness: 0.9,
            state: "solid",
        };

        elements.tungsten = {
            color: ["#4b4b4b", "#5b5b5b", "#6b6b6b"],
            behavior: behaviors.WALL,
            tempHigh: 3422,
            category: "solids",
            density: 19300,
            conduct: 0.18,
            hardness: 1.0,
            state: "solid",
        };

        elements.stainless_steel = {
            color: ["#e0e0e0", "#f0f0f0", "#ffffff"],
            behavior: behaviors.WALL,
            tempHigh: 1510,
            category: "solids",
            density: 8000,
            conduct: 0.30,
            hardness: 0.85,
            state: "solid",
        };

        elements.aluminum = {
            color: ["#d9d9d9", "#e3e3e3", "#ededed"],
            behavior: behaviors.WALL,
            tempHigh: 660,
            category: "solids",
            density: 2700,
            conduct: 0.59,
            hardness: 0.2,
            state: "solid",
        };

        // Adding Durable Stove Element
        elements.durable_stove = {
            color: "#8B4513",
            behavior: [
                "XX|M1|XX",
                "M1|M1|M1",
                "XX|M1|XX"
            ],
            tempHigh: 2000,
            category: "appliances",
            state: "solid",
            hardness: 1.0,
            density: 7800,
            conduct: 0.5,
            tick: function(pixel) {
                if(pixel.temp > 1200) {
                    // Stove heats up and glows
                    pixel.color = "#FF4500";
                } else {
                    // Stove cools down
                    pixel.color = "#8B4513";
                }
            }
        };
    });
} else {
    if(!enabledMods.includes(changeTempMod)) {
        enabledMods.splice(enabledMods.indexOf(modName), 0, changeTempMod);
    }
    if(!enabledMods.includes(libraryMod)) {
        enabledMods.splice(enabledMods.indexOf(modName), 0, libraryMod);
    }
    if(!enabledMods.includes(onTryMoveIntoMod)) {
        enabledMods.splice(enabledMods.indexOf(modName), 0, onTryMoveIntoMod);
    }
    localStorage.setItem("enabledMods", JSON.stringify(enabledMods));
    alert(`The "${changeTempMod}", "${runAfterAutogenMod}" and "${onTryMoveIntoMod}" mods are required; any missing mods in this list have been automatically inserted (reload for this to take effect).`);
}
