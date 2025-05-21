// Mod Settings Menu
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

var modName = "mods/mod_settings.js";

whenAvailable(["settings"], function() {
    // Create a new settings category for mods
    if (!settings.mods) {
        settings.mods = {};
    }

    // Add the mods section to the settings menu
    settingsMenu["mods"] = {
        name: "Mods",
        icon: "🔧",
        description: "Modify and control your mods",
        subMenu: {
            enabledMods: {
                name: "Enabled Mods",
                type: "multi-select",
                options: [], // Will be populated with available mods
                defaultValue: [],
                description: "Select which mods to enable",
                onChange: function(value) {
                    // Enable/disable selected mods
                    updateEnabledMods(value);
                }
            },
            modOptions: {
                name: "Mod Options",
                type: "submenu",
                subMenu: {}, // Will be populated with mod-specific settings
                description: "Configure individual mod settings"
            }
        }
    };

    // Function to update the list of available mods
    function updateModList() {
        // Get list of available mods from the mods directory
        let availableMods = Object.keys(enabledMods).map(mod => ({
            name: mod.replace("mods/", "").replace(".js", ""),
            value: mod
        }));
        
        settingsMenu.mods.subMenu.enabledMods.options = availableMods;
        settingsMenu.mods.subMenu.enabledMods.defaultValue = enabledMods;
    }

    // Function to enable/disable mods
    function updateEnabledMods(selectedMods) {
        // Store the previous state
        let previousMods = [...enabledMods];
        
        // Update enabled mods
        enabledMods = selectedMods;
        
        // Determine which mods were newly enabled/disabled
        let newlyEnabled = selectedMods.filter(mod => !previousMods.includes(mod));
        let newlyDisabled = previousMods.filter(mod => !selectedMods.includes(mod));
        
        // Handle newly enabled mods
        newlyEnabled.forEach(mod => {
            try {
                // Load the mod
                loadMod(mod);
                console.log(`Enabled mod: ${mod}`);
            } catch (error) {
                console.error(`Failed to enable mod ${mod}:`, error);
            }
        });
        
        // Handle newly disabled mods
        newlyDisabled.forEach(mod => {
            try {
                // Unload the mod
                unloadMod(mod);
                console.log(`Disabled mod: ${mod}`);
            } catch (error) {
                console.error(`Failed to disable mod ${mod}:`, error);
            }
        });
        
        // Save mod state
        localStorage.setItem("enabledMods", JSON.stringify(enabledMods));
    }

    // Function to load a mod
    function loadMod(modPath) {
        let script = document.createElement("script");
        script.src = modPath;
        script.id = `mod-${modPath.replace(/[^\w]/g, "-")}`;
        document.body.appendChild(script);
    }

    // Function to unload a mod
    function unloadMod(modPath) {
        let scriptId = `mod-${modPath.replace(/[^\w]/g, "-")}`;
        let script = document.getElementById(scriptId);
        if (script) {
            script.remove();
        }
    }

    // Add mod-specific settings
    function addModSettings(modName, settings) {
        settingsMenu.mods.subMenu.modOptions.subMenu[modName] = {
            name: modName,
            type: "submenu",
            subMenu: settings,
            description: `Settings for ${modName}`
        };
    }

    // Initialize mod settings
    function initModSettings() {
        // Load saved enabled mods
        let savedMods = localStorage.getItem("enabledMods");
        if (savedMods) {
            enabledMods = JSON.parse(savedMods);
        }
        
        // Update the mod list
        updateModList();
        
        // Add button to refresh mod list
        settingsMenu.mods.subMenu.refreshMods = {
            name: "Refresh Mod List",
            type: "button",
            description: "Refresh the list of available mods",
            action: updateModList
        };
    }

    // Initialize when the game is ready
    if (document.readyState === "complete") {
        initModSettings();
    } else {
        window.addEventListener("load", initModSettings);
    }

    // Expose functions for other mods to use
    window.modSettings = {
        addModSettings,
        updateModList,
        loadMod,
        unloadMod
    };

    // Add a button to the main menu (optional)
    if (document.getElementById("gameMenuButton")) {
        let modsButton = document.createElement("button");
        modsButton.innerHTML = "🔧 Mods";
        modsButton.onclick = function() {
            openSettings("mods");
        };
        document.getElementById("gameMenuButton").parentNode.appendChild(modsButton);
    }
});
