// Crystal Shard Item Mod with Adjustable Size and Category Name

var colors = ["#87CEEB", "#00BFFF", "#1E90FF", "#4682B4", "#5F9EA0"];
var newCategoryName = "cool_spawners"; // Change this to the desired category name

elements.crystal_shard = {
    color: colors,
    behavior: [
        "XX|XX|XX",
        "XX|CH:crystal_core|XX",
        "XX|XX|XX",
    ],
    category: newCategoryName,
    state: "solid",
    hardness: 0.5,
    breakInto: "crystal_dust",
    maxSize: 5, // Change this value to make the crystal bigger
    cooldown: defaultCooldown,
}

elements.crystal_core = {
    color: colors,
    behavior: [
        "XX|XX|XX",
        "XX|CR:crystal_shard|XX",
        "XX|XX|XX",
    ],
    state: "solid",
    hardness: 0.8,
    breakInto: "crystal_shard",
    maxSize: 5, // Change this value to make the crystal core bigger
    cooldown: defaultCooldown,
    category: newCategoryName
}

elements.crystal_dust = {
    color: "#B0E0E6",
    behavior: behaviors.POWDER,
    category: "powders",
    state: "solid",
    tempHigh: 600,
    stateHigh: "molten_crystal",
    hardness: 0.2,
    breakInto: "none"
}

elements.molten_crystal = {
    color: "#00CED1",
    behavior: behaviors.LIQUID,
    category: "liquids",
    state: "liquid",
    viscosity: 10000,
    tempLow: 600,
    stateLow: "crystal_shard",
    temp: 1000
}

// Adding Crystal World Generation Type

worldgentypes.crystal_cave = {
    layers: [
        [0.85, "crystal_shard"],
        [0.50, "crystal_dust"],
        [0.10, "rock"],
        [0, "basalt"],
    ],
    decor: [ // [element, chance, distance from top]
        ["crystal_core", 0.05],
    ],
    baseHeight: 0.2
}
