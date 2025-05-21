// Menu Block Mod
// Created by: Fischy6734
// Created on: 2025-05-21

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

var modName = "mods/menu_block_mod.js";

whenAvailable(["elements"], function() {
    // Create the mod menu UI
    let menuDiv = document.createElement("div");
    menuDiv.id = "modMenuContainer";
    menuDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #666;
        border-radius: 10px;
        padding: 20px;
        color: white;
        display: none;
        z-index: 1000;
        min-width: 300px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    document.body.appendChild(menuDiv);

    // Function to create the menu content
    function createMenuContent() {
        return `
            <h2 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">Mod Menu</h2>
            <div id="modCategories" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                ${createModButtons()}
            </div>
            <button onclick="closeModMenu()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: #ff4444;
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
            ">✕</button>
        `;
    }

    // Function to create mod category buttons
    function createModButtons() {
        const modCategories = {
            "Fun Stuff": ["rainbow_powder", "bouncy_ball", "party_pixel"],
            "Effects": ["magic_paint", "disco_floor", "firework_launcher"],
            "Tools": ["super_hot", "steel_glow", "realistic_metal"],
            "Elements": ["diddy_oil", "bust", "metals"]
        };

        return Object.entries(modCategories).map(([category, mods]) => `
            <div style="
                background: #333;
                padding: 10px;
                border-radius: 5px;
                text-align: center;
                cursor: pointer;
                transition: background 0.3s;
            " onclick="toggleModCategory('${category}')">
                <h3 style="margin: 0; color: #4CAF50;">${category}</h3>
                <div id="${category.replace(/\s+/g, '')}" style="display: none;">
                    ${mods.map(mod => `
                        <div style="
                            margin: 5px 0;
                            padding: 5px;
                            background: #444;
                            border-radius: 3px;
                        ">
                            <label style="display: flex; align-items: center; justify-content: space-between;">
                                <span>${mod}</span>
                                <input type="checkbox" onchange="toggleMod('${mod}')" 
                                    ${enabledMods.includes(`mods/${mod}.js`) ? 'checked' : ''}>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Add global functions for the menu
    window.openModMenu = function() {
        menuDiv.style.display = "block";
        menuDiv.innerHTML = createMenuContent();
    };

    window.closeModMenu = function() {
        menuDiv.style.display = "none";
    };

    window.toggleModCategory = function(category) {
        const categoryDiv = document.getElementById(category.replace(/\s+/g, ''));
        categoryDiv.style.display = categoryDiv.style.display === "none" ? "block" : "none";
    };

    window.toggleMod = function(mod) {
        const modPath = `mods/${mod}.js`;
        if (enabledMods.includes(modPath)) {
            enabledMods = enabledMods.filter(m => m !== modPath);
        } else {
            enabledMods.push(modPath);
        }
        localStorage.setItem("enabledMods", JSON.stringify(enabledMods));
        // Reload the page to apply changes
        if (confirm("Reload page to apply changes?")) {
            location.reload();
        }
    };

    // Add the menu block element
    elements.menu_block = {
        name: "Mod Menu",
        color: "#4CAF50",
        behavior: behaviors.WALL,
        category: "solids",
        state: "solid",
        info: "Click to open the mod menu!",
        onClick: function(pixel) {
            openModMenu();
        },
        tick: function(pixel) {
            // Add a slight pulsing effect
            if (pixelTicks % 30 === 0) {
                pixel.color = `hsl(${(pixelTicks / 2) % 360}, 70%, 60%)`;
            }
        }
    };

    // Add CSS for hover effects
    const style = document.createElement('style');
    style.textContent = `
        #modMenuContainer div:hover {
            background: #444 !important;
        }
        #modMenuContainer input[type="checkbox"] {
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
});
