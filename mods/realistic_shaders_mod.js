// Realistic Shaders Mod

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

var modName = "mods/realistic_shaders_mod.js";

whenAvailable(["elements"], function() {
    // Example element with glow shader
    elements.realistic_metal = {
        name: "Realistic Metal",
        color: "#999999",
        behavior: behaviors.WALL,
        category: "solids",
        state: "solid",
        density: 8000,
        temp: 20,
        conduct: true,
        glow: true,
        init: function(pixel) {
            // Apply glow shader
            if (pixel.glow) {
                const material = new THREE.ShaderMaterial({
                    vertexShader: glowVertexShader,
                    fragmentShader: glowFragmentShader,
                    uniforms: {
                        glowColor: { type: "c", value: new THREE.Color(0xffff00) }
                    },
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending,
                    transparent: true
                });
                pixel.material = material;
            }
        }
    };

    // Add more elements with shaders as needed
});

// Import shaders
import { glowVertexShader, glowFragmentShader } from './glow_shader.js';
