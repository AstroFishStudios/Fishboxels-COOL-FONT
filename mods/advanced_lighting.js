// Advanced Lighting System
// Created by: Fischy6734
// Created on: 2025-05-22 18:03:26

// Check for Chromium browser
var isChromium = !!window.chrome;

if (!isChromium) {
    window.addEventListener("load", function() {
        console.log(1);
        logMessage("Error: Advanced lighting only works on Chrome or Chromium-based browsers.");
    });
} else {
    // Initialize canvas layers
    addCanvasLayer("glowmod");
    addCanvasLayer("glowmod2");
    addCanvasLayer("lightingLayer");
    addCanvasLayer("blockGlow");
    
    canvasLayersPre.unshift(canvasLayers["glowmod"]);
    canvasLayersPre.unshift(canvasLayers["lightingLayer"]);
    canvasLayersPre.unshift(canvasLayers["blockGlow"]);
    
    // Set up contexts
    const glowmodCtx = canvasLayers["glowmod"].getContext("2d");
    const glowmodCtx2 = canvasLayers["glowmod2"].getContext("2d");
    const lightingCtx = canvasLayers["lightingLayer"].getContext("2d");
    const blockGlowCtx = canvasLayers["blockGlow"].getContext("2d");
    
    // Configure blend modes
    canvasLayers["blockGlow"].style.mixBlendMode = "screen";
    canvasLayers["blockGlow"].style.opacity = "0.6";
    
    // Delete unnecessary layers from main canvas
    delete canvasLayers.glowmod;
    delete canvasLayers.glowmod2;
    delete canvasLayers.lightingLayer;
    delete canvasLayers.blockGlow;

    // Emissive elements configuration
    const emissiveElements = {
        fire: { emit: true },
        lightning: { emit: 15 },
        electric: { emit: true },
        plasma: { emit: true },
        uranium: { emit: 3, emitColor: "#009800" },
        rainbow: { emit: true },
        static: { emit: true },
        flash: { emit: true },
        cold_fire: { emit: true },
        blaster: { emit: true },
        ember: { emit: true },
        fw_ember: { emit: 10 },
        bless: { emit: true },
        pop: { emit: true },
        explosion: { emit: true },
        n_explosion: { emit: 10 },
        supernova: { emit: 20 },
        midas_touch: { emit: true },
        fireball: { emit: true },
        sun: { emit: 15 },
        light: { emit: 3 },
        liquid_light: { emit: true },
        laser: { emit: 3 },
        neutron: { emit: 3 },
        proton: { emit: 3 },
        radiation: { emit: 3 },
        fallout: { emit: 3 },
        rad_steam: { emit: 2, emitColor: "#6ad48c" },
        rad_cloud: { emit: 2, emitColor: "#009800" },
        rad_glass: { emit: 2, emitColor: "#009800" },
        rad_shard: { emit: 2, emitColor: "#009800" },
        malware: { emit: 2 },
        border: { emit: 2 },
        void: { emit: 10 }
    };

    // Apply emissive properties
    Object.entries(emissiveElements).forEach(([element, props]) => {
        if (elements[element]) {
            Object.assign(elements[element], props);
        }
    });

    // Utility functions
    function hexToRgb(hex) {
        let result = /^#?([a-f\d]{