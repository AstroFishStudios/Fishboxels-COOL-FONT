/* Cool Glow Mod: Makes every pixel glow with a random color and adds a cool effect */

var isChromium = !!window.chrome;

if (!isChromium) {
    window.addEventListener("load", function() {
        console.log(1);
        logMessage("Error: glow.js only works on Chrome or Chromium-based browsers.");
    });
} else {
    addCanvasLayer("coolglowmod");
    addCanvasLayer("coolglowmod2");
    canvasLayersPre.unshift(canvasLayers["coolglowmod"]);
    coolglowmodCtx = canvasLayers["coolglowmod"].getContext("2d");
    coolglowmodCtx2 = canvasLayers["coolglowmod2"].getContext("2d");
    delete canvasLayers.coolglowmod;
    delete canvasLayers.coolglowmod2;

    for (let element in elements) {
        elements[element].emit = true;
        elements[element].emitColor = getRandomColor();
    }

    viewInfo[1] = { // Blur Glow (Emissive pixels only)
        name: "",
        pixel: viewInfo[1].pixel,
        effects: true,
        colorEffects: true,
        pre: function(ctx) {
            coolglowmodCtx2.canvas.width = ctx.canvas.width;
            coolglowmodCtx2.canvas.height = ctx.canvas.height;
        },
        post: function(ctx) {
            coolglowmodCtx.canvas.width = ctx.canvas.width;
            coolglowmodCtx.canvas.height = ctx.canvas.height;
            coolglowmodCtx.filter = "blur(30px)";
            // Draw the blurred content on the canvas
            coolglowmodCtx.drawImage(coolglowmodCtx2.canvas, 0, 0);
            coolglowmodCtx.filter = "none";
        },
    };

    renderEachPixel(function(pixel, ctx) {
        if (view === 1) {
            if (elements[pixel.element].emit || pixel.emit || (elements[pixel.element].colorOn && pixel.charge)) {
                let a = (settings.textures !== 0) ? pixel.alpha : undefined;
                let d = elements[pixel.element].emit || true;
                if (d === true) d = 5;
                let r = Math.floor(d / 2);
                drawSquare(coolglowmodCtx2, elements[pixel.element].emitColor || pixel.color, pixel.x - r, pixel.y - r, d, a);
            }
            if (pixel.charge && !elements[pixel.element].colorOn) {
                drawSquare(coolglowmodCtx2, "#FFFFFF", pixel.x - 1, pixel.y - 1, 3);
            }
        }
    });

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
