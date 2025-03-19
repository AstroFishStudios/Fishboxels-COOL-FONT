// Diddy Structures Mod

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

var modName = "mods/diddy_structures.js";

whenAvailable(["elements", "behaviors", "createPixel", "deletePixel", "isEmpty", "pixelMap"], function() {
    elements.diddy = {
        name: "Diddy",
        color: "#ff69b4",
        cooldown: 6,
        tick: function(pixel) {
            pixel.arr = [
                ["brick", "brick", "brick"],
                ["brick", "glass", "glass"],
                ["brick", "brick", "brick"],
                ["brick", "air", "brick"]
            ];
            pixel.carr = [
                ["#ff69b4", "#ff69b4", "#ff69b4"],
                ["#ff69b4", "#add8e6", "#add8e6"],
                ["#ff69b4", "#ff69b4", "#ff69b4"],
                ["#ff69b4", "null", "#ff69b4"]
            ];

            let aa = (0 - Math.floor(pixel.arr[0].length / 2)); // Center align code
            let na = Math.abs(aa);
            let bb = (pixel.arr[0].length % 2 == 1) ? (Math.floor(pixel.arr[0].length / 2) + 1) : Math.floor(pixel.arr[0].length / 2);

            let cc = (0 - Math.floor(pixel.arr.length / 2));
            let nc = Math.abs(cc);
            let dd = (pixel.arr.length % 2 == 1) ? (Math.floor(pixel.arr.length / 2) + 1) : Math.floor(pixel.arr.length / 2);

            for (let j = cc; j < dd; j++) { // Iterative placing and coloring of pixels
                for (let i = aa; i < bb; i++) {
                    if (!isEmpty(pixel.x + i, pixel.y + j, true)) {
                        if (pixel.arr[j + nc][i + na] !== "null") {
                            deletePixel(pixel.x + i, pixel.y + j);
                        }
                    }
                    if (pixel.arr[j + nc][i + na]) {
                        if (isEmpty(pixel.x + i, pixel.y + j, false) && pixel.arr[j + nc][i + na] !== "null" && pixel.arr[j + nc][i + na] !== "air") {
                            createPixel(pixel.arr[j + nc][i + na], pixel.x + i, pixel.y + j);
                            if (pixel.carr[j + nc][i + na]) {
                                if (!isEmpty(pixel.x + i, pixel.y + j, true) && pixel.carr[j + nc][i + na] != "null") {
                                    pixelMap[pixel.x + i][pixel.y + j].color = pixel.carr[j + nc][i + na];
                                }
                            }
                        }
                    }
                }
            }
        },
        category: "structures",
        insulate: true,
        state: "solid",
        excludeRandom: true,
    };

    elements.diddy_seed = {
        name: "Diddy Seed",
        color: "#ff69b4",
        cooldown: 6,
        behavior: [
            "DL:diddy_seed|DL:diddy_seed AND M2|DL:diddy_seed",
            "DL:diddy_seed|C2:diddy|DL:diddy_seed",
            "DL:diddy_seed|SW:diddy_seed AND DL:diddy_seed AND M1|DL:diddy_seed"
        ],
        category: "structures",
        insulate: true,
        state: "solid",
        density: 2018,
    };
});
