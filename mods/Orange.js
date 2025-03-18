/* Glow Mod: Makes every pixel glow orange */

var isChromium = !!window.chrome;

if (!isChromium) {
    window.addEventListener("load", function() {
        console.log(1);
        logMessage("Error: glow.js only works on Chrome or Chromium-based browsers.");
    });
} else {
    addCanvasLayer("glowmod");
    addCanvasLayer("glowmod2");
    canvasLayersPre.unshift(canvasLayers["glowmod"]);
    glowmodCtx = canvasLayers["glowmod"].getContext("2d");
    glowmodCtx2 = canvasLayers["glowmod2"].getContext("2d");
    delete canvasLayers.glowmod;
    delete canvasLayers.glowmod2;

    for (let element in elements) {
        elements[element].emit = true;
        elements[element].emitColor = "#FFA500"; // Orange color
    }

    viewInfo[1] = { // Blur Glow (Emissive pixels only)
        name: "",
        pixel: viewInfo[1].pixel,
        effects: true,
        colorEffects: true,
        pre: function(ctx) {
            glowmodCtx2.canvas.width = ctx.canvas.width;
            glowmodCtx2.canvas.height = ctx.canvas.height;
        },
        post: function(ctx) {
            glowmodCtx.canvas.width = ctx.canvas.width;
            glowmodCtx.canvas.height = ctx.canvas.height;
            glowmodCtx.filter = "blur(30px)";
            // Draw the blurred content on the canvas
            glowmodCtx.drawImage(glowmodCtx2.canvas, 0, 0);
            glowmodCtx.filter = "none";
        },
    };

    renderEachPixel(function(pixel, ctx) {
        if (view === 1) {
            if (elements[pixel.element].emit || pixel.emit || (elements[pixel.element].colorOn && pixel.charge)) {
                let a = (settings.textures !== 0) ? pixel.alpha : undefined;
                let d = elements[pixel.element].emit || true;
                if (d === true) d = 5;
                let r = Math.floor(d / 2);
                drawSquare(glowmodCtx2, elements[pixel.element].emitColor || pixel.color, pixel.x - r, pixel.y - r, d, a);
            }
            if (pixel.charge && !elements[pixel.element].colorOn) {
                drawSquare(glowmodCtx2, "#FFA500", pixel.x - 1, pixel.y - 1, 3);
            }
        }
    });
}
