// Steel Glow Mod

// Glow Shader
const glowVertexShader = `
    varying vec3 vNormal;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const glowFragmentShader = `
    uniform vec3 glowColor;
    varying vec3 vNormal;
    void main() {
        float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(glowColor * intensity, 1.0);
    }
`;

// Function to check availability of required dependencies
function whenAvailable(names, callback) {
    var interval = 10; // ms
    window.setTimeout(function() {
        let bool = true;
        for (let i = 0; i < names.length; i++) {
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

var modName = "mods/steel_glow_mod.js";

whenAvailable(["elements"], function() {
    // Function to apply glow shader to steel elements
    function applyGlowShader(pixel) {
        if (!pixel.glowApplied && pixel.name === "steel") {
            const material = new THREE.ShaderMaterial({
                vertexShader: glowVertexShader,
                fragmentShader: glowFragmentShader,
                uniforms: {
                    glowColor: { type: "c", value: new THREE.Color(0x808080) } // Gray glow
                },
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            });
            pixel.material = material;
            pixel.glowApplied = true;
        }
    }

    // Apply glow shader to steel elements
    if (elements.steel) {
        elements.steel.tick = applyGlowShader;
    }
});
