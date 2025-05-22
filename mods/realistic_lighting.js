// Realistic Lighting Mod
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

var modName = "mods/realistic_lighting.js";

whenAvailable(["elements"], function() {
    // Add a canvas layer for lighting effects
    addCanvasLayer("lightingLayer");
    const lightingCtx = canvasLayers.lightingLayer.getContext("2d");
    
    // Light sources configuration
    const lightSources = {
        fire: { radius: 15, intensity: 1.0, color: [255, 200, 100] },
        plasma: { radius: 20, intensity: 1.2, color: [150, 150, 255] },
        laser: { radius: 10, intensity: 1.5, color: [255, 0, 0] },
        radiation: { radius: 12, intensity: 0.8, color: [0, 255, 0] },
        electric: { radius: 8, intensity: 1.3, color: [255, 255, 100] }
    };

    // Add lighting property to elements that emit light
    Object.keys(lightSources).forEach(element => {
        if (elements[element]) {
            elements[element].isLightSource = true;
            elements[element].lightProperties = lightSources[element];
        }
    });

    // Function to render lighting
    function renderLighting() {
        // Clear the lighting canvas
        lightingCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient for ambient lighting
        let ambient = lightingCtx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0,
            canvas.width/2, canvas.height/2, canvas.width/2
        );
        ambient.addColorStop(0, 'rgba(0,0,0,0.7)');
        ambient.addColorStop(1, 'rgba(0,0,0,0.9)');
        
        // Apply ambient lighting
        lightingCtx.fillStyle = ambient;
        lightingCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set blending mode for lights
        lightingCtx.globalCompositeOperation = 'lighter';

        // Render each light source
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (pixelMap[x][y]) {
                    let pixel = pixelMap[x][y];
                    if (elements[pixel.element].isLightSource) {
                        let props = elements[pixel.element].lightProperties;
                        
                        // Create radial gradient for light
                        let gradient = lightingCtx.createRadialGradient(
                            x * pixelSize, y * pixelSize, 0,
                            x * pixelSize, y * pixelSize, props.radius * pixelSize
                        );
                        
                        let [r, g, b] = props.lightProperties.color;
                        gradient.addColorStop(0, `rgba(${r},${g},${b},${props.intensity})`);
                        gradient.addColorStop(1, 'rgba(0,0,0,0)');
                        
                        // Draw light
                        lightingCtx.fillStyle = gradient;
                        lightingCtx.beginPath();
                        lightingCtx.arc(
                            x * pixelSize, 
                            y * pixelSize, 
                            props.radius * pixelSize, 
                            0, 
                            Math.PI * 2
                        );
                        lightingCtx.fill();
                    }
                }
            }
        }
        
        // Reset blend mode
        lightingCtx.globalCompositeOperation = 'source-over';
    }

    // Create new light source elements
    elements.light_bulb = {
        name: "Light Bulb",
        color: "#ffff00",
        behavior: behaviors.WALL,
        category: "machines",
        isLightSource: true,
        lightProperties: {
            radius: 25,
            intensity: 1.2,
            color: [255, 255, 200]
        },
        state: "solid",
        temp: 40,
        conduct: 1
    };

    elements.neon_light = {
        name: "Neon Light",
        color: "#ff00ff",
        behavior: behaviors.WALL,
        category: "machines",
        isLightSource: true,
        lightProperties: {
            radius: 20,
            intensity: 1.0,
            color: [255, 0, 255]
        },
        state: "solid",
        temp: 30,
        conduct: 1
    };

    // Modify existing elements to interact with light
    elements.glass.isTransparent = true;
    elements.water.isTransparent = true;
    elements.ice.isTransparent = true;

    // Add light reflection properties
    elements.mirror = {
        name: "Mirror",
        color: "#808080",
        behavior: behaviors.WALL,
        category: "solids",
        reflective: true,
        reflectivity: 0.9,
        state: "solid"
    };

    // Hook into the game's render loop
    let oldRenderPixels = renderPixels;
    renderPixels = function() {
        oldRenderPixels();
        renderLighting();
    };

    // Add dynamic shadow casting
    function castShadows() {
        lightingCtx.fillStyle = 'rgba(0,0,0,0.7)';
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (pixelMap[x][y] && !elements[pixelMap[x][y].element].isTransparent) {
                    // Cast shadows in 8 directions
                    for (let i = 1; i <= 5; i++) {
                        lightingCtx.fillRect(
                            (x + i) * pixelSize, 
                            (y + i) * pixelSize, 
                            pixelSize, 
                            pixelSize
                        );
                    }
                }
            }
        }
    }

    // Update lighting on temperature changes
    let oldUpdateTemp = updateTemp;
    updateTemp = function() {
        oldUpdateTemp();
        // Make light sources brighter when hot
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let pixel = pixelMap[x][y];
                if (pixel && elements[pixel.element].isLightSource) {
                    let intensity = elements[pixel.element].lightProperties.intensity;
                    intensity *= 1 + (pixel.temp - 20) / 100;
                    intensity = Math.max(0.1, Math.min(2.0, intensity));
                }
            }
        }
    };
});
