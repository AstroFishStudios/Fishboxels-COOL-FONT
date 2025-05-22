// Mod Menu Bar
// Created by: Fischy6734
// Created on: 2025-05-22

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

var modName = "mods/mod_menu_bar.js";

whenAvailable(["elements"], function() {
    // Add the style for the mod menu button
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'modMenuStylesheet';
    style.innerHTML = `
        .modMenuButton {
            background: #333;
            color: #fff;
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 10px;
            font-family: inherit;
        }
        .modMenuButton:hover {
            background: #444;
        }
        .modStatus {
            color: #E11;
            text-decoration: none;
        }
        #modMenuContainer {
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
        }
        .mod-category {
            background: #333;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
        }
        .mod-item {
            background: #444;
            padding: 5px;
            margin: 5px 0;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);

    // Create the mod menu button in the top bar
    let topBar = document.querySelector('.topbar') || document.getElementById('topbar');
    if (topBar) {
        let modMenuButton = document.createElement('button');
        modMenuButton.className = 'modMenuButton';
        modMenuButton.innerHTML = '🔧 Mods';
        modMenuButton.onclick = toggleModMenu;
        topBar.insertBefore(modMenuButton, topBar.firstChild);
    }

    // Create the mod menu container
    let menuDiv = document.createElement('div');
    menuDiv.id = 'modMenuContainer';
    document.body.appendChild(menuDiv);

    // Mod menu state
    let modMenuOpen = false;

    // Toggle mod menu function
    function toggleModMenu() {
        modMenuOpen = !modMenuOpen;
        menuDiv.style.display = modMenuOpen ? 'block' : 'none';
        if (modMenuOpen) {
            updateModMenu();
        }
        // Update the button style
        document.getElementById('modMenuStylesheet').innerHTML = 
            `.modStatus { color: ${modMenuOpen ? '#1E1' : '#E11'}; text-decoration: ${modMenuOpen ? 'underline' : 'none'}; }`;
    }

    // Function to update the mod menu content
    function updateModMenu() {
        const modCategories = {
            "Fun Stuff": ["rainbow_powder", "bouncy_ball", "party_pixel"],
            "Effects": ["magic_paint", "disco_floor", "firework_launcher"],
            "Tools": ["super_hot", "steel_glow", "realistic_metal"],
            "Elements": ["diddy_oil", "bust", "metals"]
        };

        let content = `
            <h2 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">Mod Menu</h2>
            <div id="modCategories">
                ${Object.entries(modCategories).map(([category, mods]) => `
                    <div class="mod-category">
                        <h3 style="margin: 0; color: #4CAF50;">${category}</h3>
                        ${mods.map(mod => `
                            <div class="mod-item">
                                <span>${mod}</span>
                                <input type="checkbox" 
                                    ${enabledMods.includes(`mods/${mod}.js`) ? 'checked' : ''}
                                    onchange="window.toggleMod('${mod}')">
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            <button onclick="window.toggleModMenu()" style="
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

        menuDiv.innerHTML = content;
    }

    // Function to toggle mods
    window.toggleMod = function(mod) {
        const modPath = `mods/${mod}.js`;
        if (enabledMods.includes(modPath)) {
            enabledMods = enabledMods.filter(m => m !== modPath);
        } else {
            enabledMods.push(modPath);
        }
        localStorage.setItem("enabledMods", JSON.stringify(enabledMods));
        if (confirm("Reload page to apply changes?")) {
            location.reload();
        }
    };

    // Make toggleModMenu available globally
    window.toggleModMenu = toggleModMenu;
});
