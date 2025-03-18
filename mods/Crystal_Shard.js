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

// Adding 20 New Liquid Elements

elements.liquid_gold = {
    color: "#FFD700",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 1925,
    state: "liquid",
    density: 19300
};

elements.liquid_silver = {
    color: "#C0C0C0",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 2550,
    state: "liquid",
    density: 10490
};

elements.liquid_mercury = {
    color: "#B0C4DE",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 1550,
    state: "liquid",
    density: 13546
};

elements.liquid_copper = {
    color: "#B87333",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 2500,
    state: "liquid",
    density: 8960
};

elements.liquid_iron = {
    color: "#B7410E",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 2800,
    state: "liquid",
    density: 7874
};

elements.liquid_bronze = {
    color: "#CD7F32",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 2350,
    state: "liquid",
    density: 8800
};

elements.liquid_platinum = {
    color: "#E5E4E2",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 2700,
    state: "liquid",
    density: 21450
};

elements.liquid_ruby = {
    color: "#9B111E",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3300,
    state: "liquid",
    density: 4000
};

elements.liquid_sapphire = {
    color: "#0F52BA",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3200,
    state: "liquid",
    density: 4000
};

elements.liquid_emerald = {
    color: "#50C878",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3400,
    state: "liquid",
    density: 4000
};

elements.liquid_diamond = {
    color: "#FFFFFF",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3500,
    state: "liquid",
    density: 3500
};

elements.liquid_amethyst = {
    color: "#9966CC",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3250,
    state: "liquid",
    density: 4000
};

elements.liquid_opal = {
    color: "#A8C3BC",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3000,
    state: "liquid",
    density: 3500
};

elements.liquid_topaz = {
    color: "#FFC87C",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3100,
    state: "liquid",
    density: 3500
};

elements.liquid_turquoise = {
    color: "#40E0D0",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 2950,
    state: "liquid",
    density: 3500
};

elements.liquid_onyx = {
    color: "#353839",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3600,
    state: "liquid",
    density: 3500
};

elements.liquid_pearl = {
    color: "#EAE0C8",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3700,
    state: "liquid",
    density: 3500
};

elements.liquid_garnet = {
    color: "#733635",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3800,
    state: "liquid",
    density: 3500
};

elements.liquid_amber = {
    color: "#FFBF00",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 3900,
    state: "liquid",
    density: 3500
};

elements.liquid_jade = {
    color: "#00A86B",
    behavior: behaviors.LIQUID,
    category: "liquids",
    viscosity: 4000,
    state: "liquid",
    density: 3500
};
