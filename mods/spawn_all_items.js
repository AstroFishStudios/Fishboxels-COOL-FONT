// Spawn All Items Mod

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

var modName = "mods/spawn_all_items.js";

whenAvailable(["elements"], function() {
    const items = [
        "fire", "lightning", "electric", "plasma", "uranium", "rainbow", "static", "flash",
        "cold_fire", "blaster", "ember", "fw_ember", "bless", "pop", "explosion", "n_explosion",
        "supernova", "midas_touch", "fireball", "sun", "light", "liquid_light", "laser", "neutron",
        "proton", "radiation", "fallout", "rad_steam", "rad_cloud", "rad_glass", "rad_shard", "malware",
        "border", "void", "liquid_silver", "liquid_mercury", "liquid_copper", "liquid_iron",
        "liquid_bronze", "liquid_platinum", "liquid_ruby", "liquid_sapphire", "liquid_emerald",
        "liquid_diamond", "liquid_amethyst", "liquid_opal", "liquid_topaz", "liquid_turquoise", "liquid_onyx"
    ];

    items.forEach(item => {
        elements[item] = {
            color: elements[item]?.color || "#FFFFFF",
            behavior: behaviors.WALL,
            category: "spawners",
            state: "solid",
            density: 1000,
            tempHigh: 10000,
            stateHigh: "molten_" + item,
            tempLow: -100,
            stateLow: "frozen_" + item,
            maxSize: 1,
            cooldown: defaultCooldown,
        };
    });
});
