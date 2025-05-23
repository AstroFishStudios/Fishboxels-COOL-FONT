// REAL.js

// BetterSettings.js integration
if (!enabledMods.includes("mods/betterSettings.js")) { enabledMods.unshift("mods/betterSettings.js"); localStorage.setItem("enabledMods", JSON.stringify(enabledMods)); window.location.reload() };

var sky_settingsTab = new SettingsTab("Sky");

var realtime_setting = new Setting("Use real life time for sky", "real_time", settingType.BOOLEAN, false, defaultValue=false);
var initial_hour_setting = new Setting("Initial hour", "initial_hour", settingType.NUMBER, false, defaultValue=8);
var ticks_per_hour_setting = new Setting("Ticks per hour", "ticks_per_hour", settingType.NUMBER, false, defaultValue=300);
var airtemp_setting = new Setting("Change air temperature based on time", "air_temp", settingType.BOOLEAN, false, defaultValue=true);
var drawSun = new Setting("Add sun", "drawSun", settingType.BOOLEAN, false, defaultValue=true);

sky_settingsTab.registerSettings("Real time", realtime_setting);
sky_settingsTab.registerSettings("Initial hour", initial_hour_setting);
sky_settingsTab.registerSettings("Ticks per hour", ticks_per_hour_setting);
sky_settingsTab.registerSettings("Temperature", airtemp_setting);
sky_settingsTab.registerSettings("Sun", drawSun);

settingsManager.registerTab(sky_settingsTab);

// Destructuring makes it faster
function lerpColor([r1, g1, b1], [r2, g2, b2], t) {
    return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t].map(Math.round);
}

function hourToTemp(hour, Tmin=10, Tmax=30) {
    return Tmin + (Tmax - Tmin) * Math.pow(Math.sin((Math.PI / 24) * (hour - 4)), 2);
}

function getSunPositionInRect(x_, y_, w, h) {
	// Convert hour to angle
	var angle = Math.PI * (18 - hour) / 12;

	// Convert angle to position
	var centerX = x_ + (w / 2);
	var centerY = y_ + h;
	var radius = (w) / 2;
	var x = centerX + radius * Math.cos(angle);
	var y = centerY - radius * Math.sin(angle);

	return { angle, x, y };
}

function getSkyColors(hour) {
	const SKY_COLOR_PAIRS = [
		[[0, 0, 15], [0, 0, 30]], // midnight
		[[10, 10, 40], [20, 20, 60]],
		[[255, 100, 50], [255, 150, 100]],
		[[135, 206, 235], [180, 230, 255]],
		[[135, 206, 250], [135, 206, 255]],
		[[135, 206, 250], [120, 190, 240]],
		[[255, 150, 100], [120, 70, 70]],
		[[30, 15, 60], [20, 10, 40]],
		[[0, 0, 15], [0, 0, 30]], // midnight
	];

	// Determine the interval (each interval is 3 hours)
	const index = Math.floor(hour / 3);
	const t = (hour % 3) / 3;

	const [bottomStart, topStart] = SKY_COLOR_PAIRS[index];
	const [bottomEnd, topEnd] = SKY_COLOR_PAIRS[index + 1];

	return {
		skyTop: `rgb(${lerpColor(topStart, topEnd, t).join(", ")})`,
		skyBottom: `rgb(${lerpColor(bottomStart, bottomEnd, t).join(", ")})`,
	};
}

function drawSunSquare(ctx, sunPos, size, color, blur) {
	ctx.save();
	ctx.filter = `blur(${blur}px)`;
	ctx.translate(sunPos.x * pixelSize, sunPos.y * pixelSize);
	ctx.rotate(sunPos.angle);
	ctx.fillStyle = color;
	ctx.fillRect(-size * 0.5, -size * 0.5, size, size);
	ctx.restore();
}

function renderSkyAndSun(ctx) {
	// Get sky colors and make gradient
	const { skyTop, skyBottom } = getSkyColors(hour);
	const gradient = ctx.createLinearGradient(0, 0, 0, height * pixelSize);
	gradient.addColorStop(0, skyTop);
	gradient.addColorStop(1, skyBottom);

	ctx.globalAlpha = 1.0;
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, (width + 1) * pixelSize, (height + 1) * pixelSize);

	// Draw sun
	if (hour < 5.5 || hour > 18.5) {return;}
	if (!drawSun.value) {return;}

	var sunPos = getSunPositionInRect(width * 0.1, height * 0.1, width * 0.8, height * 0.9);
	var sunSize = pixelSize * 9;
	var nearSunSetOrRise = Math.pow((1 - Math.cos((Math.PI / 6) * hour)) / 2, 4);
	var color = RGBToHex(lerpColor([255, 230, 225], [255, 160, 128], nearSunSetOrRise));

	drawSunSquare(ctx, sunPos, sunSize, color, 5); // Glow
	drawSunSquare(ctx, sunPos, sunSize * 0.75, "#FFFFFF", 1);
}

function updateDayTime() {
	if (paused) {return;}

	if (realtime_setting.value) {
		const now = new Date();
		hour = now.getHours() + now.getMinutes() / 60;
	} else {
		var hours_per_tick = 1 / (ticks_per_hour_setting.value + 1);
		hour = (hour + hours_per_tick) % 24; // Keep within 0-23
	}

	if (airtemp_setting.value) {
		airTemp = hourToTemp(hour, 12, 26);
	}
}

// Sky should be first layer
function prioritizeSky() {
	const idx = renderPrePixelList.indexOf(renderSkyAndSun);
	if (idx !== -1) {
		const [skyFn] = renderPrePixelList.splice(idx, 1);
		renderPrePixelList.unshift(skyFn);
	}
}

// Resetting canvas also resets hour
function initializeSky() {
	hour = initial_hour_setting.value;
}

// Hooks
runAfterReset(initializeSky);
runAfterLoad(prioritizeSky);
runEveryTick(updateDayTime);
renderPrePixel(renderSkyAndSun);

var hour = initial_hour_setting.value;

// Clouds.js

if (!enabledMods.includes("mods/betterSettings.js")) { enabledMods.unshift("mods/betterSettings.js"); localStorage.setItem("enabledMods", JSON.stringify(enabledMods)); window.location.reload() };

var clouds_settingsTab = new SettingsTab("Clouds");

var cloud_count_setting = new Setting("Cloud count", "cloud_count", settingType.NUMBER, false, defaultValue=40);

clouds_settingsTab.registerSettings("Real time", cloud_count_setting);

settingsManager.registerTab(clouds_settingsTab);

function biasedRandom(A, B, samples) {
	var sum = 0;
	for (var i = 0;i < samples;i++) {
		sum += Math.random();
	}
	var average = sum / samples;

	return A + average * (B - A);
}

function randomBetween(A, B) {
    return Math.random() * (B - A) + A;
}

function initClouds(amount) {
	for (let i = 0; i < amount; i++) {
		var w = randomBetween(6, 17);
		var h = randomBetween(4, 10);
		var x = randomBetween(0, width - w);
		var y = biasedRandom(0, height * 0.75, 4);

		// Higher clouds move faster
		var speedBoost = 1 - (y / (height * 0.75));
		var speed = ((Math.random() - 0.5) * 0.05) * (0.5 + speedBoost * 2);

		var color = Math.random() > 0.5 ? "255,255,255" : "210,210,190";
		var blur = Math.max(Math.min(1 / (Math.abs(speed) * 48), 4), 0); // For parallax

		// Pre-render the cloud
		var offCanvas = document.createElement("canvas");
		var margin = blur;
		offCanvas.width = w * pixelSize + 2 * margin;
		offCanvas.height = h * pixelSize + 2 * margin;
		var offCtx = offCanvas.getContext("2d");

		var gradient = offCtx.createLinearGradient(0, margin, 0, h * pixelSize + margin);
		gradient.addColorStop(0, `RGBA(${color},0.12)`);
		gradient.addColorStop(1, `RGBA(${color},0.24)`);

		offCtx.filter = `blur(${blur}px)`;
		offCtx.fillStyle = gradient;
		offCtx.fillRect(margin, margin, w * pixelSize, h * pixelSize);

		clouds.push({ x, y, w, h, speed, color, blur, image: offCanvas, margin });
	}
}

function renderClouds(ctx) {
	// Fade in
	ctx.globalAlpha = Math.min(pixelTicks * 0.02, 1);

	for (var i = 0; i < clouds.length; i++) {
		var cloud = clouds[i];
		ctx.drawImage(
			cloud.image,
			cloud.x * pixelSize - cloud.margin,
			cloud.y * pixelSize - cloud.margin
		);
	}
}

function updateClouds() {
	if (paused) { return; }

	if (cloud_count_setting.value != clouds.length) {
		clouds = [];
		initClouds(cloud_count_setting.value);
		return;
	}

	for (var i = 0; i < clouds.length; i++) {
		var cloud = clouds[i];
		cloud.x += cloud.speed;

		// Wrap around
		if (cloud.x > width) {
			cloud.x = -cloud.w;
		} else if (cloud.x + cloud.w < 0) {
			cloud.x = width;
		}
	}
}

// Hooks
renderPrePixel(renderClouds);
runEveryTick(updateClouds);

var clouds = [];
runAfterReset(() => {
	initClouds(cloud_count_setting.value);

if (!enabledMods.includes("mods/betterSettings.js")) { enabledMods.unshift("mods/betterSettings.js"); localStorage.setItem("enabledMods", JSON.stringify(enabledMods)); window.location.reload() };

var lightmap = [];
var nextLightmap = [];
var lightmapWidth, lightmapHeight;
var lightmapScale = 2;
var lightSourceBoost = 2;
var pixelSizeQuarter = pixelSizeHalf / 2;

// BetterSettings.js integration
var lightmap_settingsTab = new SettingsTab("Lightmap");

var resolution_setting = new Setting("Resolution (higher number = lower quality)", "resolution", settingType.NUMBER, false, defaultValue=2);
var falloff_setting = new Setting("Falloff (higher number = higher blur radius)", "falloff", settingType.NUMBER, false, defaultValue=0.8);

lightmap_settingsTab.registerSettings("Resolution", resolution_setting);
lightmap_settingsTab.registerSettings("Falloff", falloff_setting);

settingsManager.registerTab(lightmap_settingsTab);


function getRandomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

if (!rgbToArray) {
	function rgbToArray(colorString) {
		if (typeof colorString !== "string") {
			console.error("Invalid colorString:", colorString);
			return null;
		}
		if (colorString.startsWith("rgb")) {
			return colorString
				.slice(4, -1)
				.split(",")
				.map(val => parseInt(val.trim()));
		} else if (colorString.startsWith("#")) {
			let hex = colorString.slice(1);
			if (hex.length === 3) {
				hex = hex
					.split("")
					.map(char => char + char)
					.join("");
			}
			if (hex.length !== 6) {
				console.error("Invalid hex color:", colorString);
				return null;
			}
			var r = parseInt(hex.slice(0, 2), 16);
			var g = parseInt(hex.slice(2, 4), 16);
			var b = parseInt(hex.slice(4, 6), 16);
			return [r, g, b];
		}
		console.error("Invalid color format:", colorString);
		return null;
	}
}

function scaleList(numbers, scale) {
	return numbers.map(number => number * scale);
}

function initializeLightmap(_width, _height) {
	lightmapWidth = Math.ceil(_width / lightmapScale) + 1;
	lightmapHeight = Math.ceil(_height / lightmapScale) + 1;

	function createLightmapArray(width_, height_) {
		return Array.from({ length: height_ }, () =>
			Array.from({ length: width_ }, () => ({ color: [0, 0, 0] }))
		);
	}

	var newLightmap = createLightmapArray(lightmapWidth, lightmapHeight);
	var newNextLightmap = createLightmapArray(lightmapWidth, lightmapHeight);

	lightmap = newLightmap;
	nextLightmap = newNextLightmap;
}

function deepCopy(source, target) {
	for (var y = 0; y < source.length; y++) {
		target[y] = [];
		for (var x = 0; x < source[y].length; x++) {
			target[y][x] = { ...source[y][x] };
		}
	}
}

function propagateLightmap() {
	if (!lightmap || !lightmap[0]) return;

	var width = lightmap[0].length;
	var height = lightmap.length;
	var falloff = falloff_setting.value;
	var neighbors = [
		{ dx: 1, dy: 0 },
		{ dx: -1, dy: 0 },
		{ dx: 0, dy: 1 },
		{ dx: 0, dy: -1 }
	];

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var totalColor = [0, 0, 0];
			var neighborCount = 0;

			neighbors.forEach(({ dx, dy }) => {
				var nx = x + dx;
				var ny = y + dy;
				if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
					totalColor[0] += lightmap[ny][nx].color[0];
					totalColor[1] += lightmap[ny][nx].color[1];
					totalColor[2] += lightmap[ny][nx].color[2];
					neighborCount++;
				}
			});

			nextLightmap[y][x] = {
				color: [
					Math.min(Math.max(0, (totalColor[0] / neighborCount) * falloff), 255 * 8),
					Math.min(Math.max(0, (totalColor[1] / neighborCount) * falloff), 255 * 8),
					Math.min(Math.max(0, (totalColor[2] / neighborCount) * falloff), 255 * 8)
				]
			};
		}
	}

	deepCopy(nextLightmap, lightmap);
}

function rgbToHsv(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h, s;
	var v = max;
	var d = max - min;
	s = max === 0 ? 0 : d / max;
	if (max === min) {
		h = 0;
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return [h, s, v];
}

function hsvToRgb(h, s, v) {
	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);
	var r, g, b;

	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function renderLightmapPrePixel(ctx) {
	if (!lightmap || !lightmap[0]) return;
	var _width = lightmap[0].length;
	var _height = lightmap.length;

	for (var y = 0; y < _height; y++) {
		for (var x = 0; x < _width; x++) {
			var color = lightmap[y][x].color;
			var r = color[0];
			var g = color[1];
			var b = color[2];

			if (r > 16 || g > 16 || b > 16) {
				var hsv = rgbToHsv(r, g, b);
				var newColor = hsvToRgb(hsv[0], hsv[1], 1);
				var alpha = hsv[2];

				ctx.globalAlpha = 1.0;
				ctx.fillStyle = `rgba(${newColor[0]}, ${newColor[1]}, ${newColor[2]}, ${alpha * 0.4})`;
				ctx.fillRect(
					x * pixelSize * lightmapScale,
					y * pixelSize * lightmapScale,
					pixelSize * lightmapScale,
					pixelSize * lightmapScale
				);

				ctx.fillStyle = `rgba(${newColor[0]}, ${newColor[1]}, ${newColor[2]}, ${alpha * 0.25})`;
				ctx.fillRect(
					(x * pixelSize - pixelSizeHalf) * lightmapScale,
					(y * pixelSize - pixelSizeHalf) * lightmapScale,
					pixelSize * lightmapScale * 2,
					pixelSize * lightmapScale * 2
				);
			}
		}
	}
}

// Main loop
renderPrePixel(function(ctx) {
	// Reset lightmap if resolution changed
	if (resolution_setting.value != lightmapScale) {
		lightmapScale = resolution_setting.value;
		initializeLightmap(width, height);
		return;
	}

	if (!paused) {
		propagateLightmap();
	}
	renderLightmapPrePixel(ctx);
});

function glowItsOwnColor(pixel) {
	if (!pixel.color) return;
	var x = Math.floor(pixel.x / lightmapScale);
	var y = Math.floor(pixel.y / lightmapScale);
	try {
		lightmap[y][x] = { color: scaleList(rgbToArray(pixel.color), lightSourceBoost) };
	} catch (e) {
		console.log(e, pixel, pixel.color, rgbToArray(pixel.color), x, y)
	}
}

function glowItsOwnColorIfPowered(pixel) {
	if (!pixel.charge || pixel.charge <= 0) return;
	if (!pixel.color) return;
	var x = Math.floor(pixel.x / lightmapScale);
	var y = Math.floor(pixel.y / lightmapScale);
	lightmap[y][x] = { color: scaleList(rgbToArray(pixel.color), lightSourceBoost) };
}

function glowColor(pixel, color) {
	if (!color) return;
	var x = Math.floor(pixel.x / lightmapScale);
	var y = Math.floor(pixel.y / lightmapScale);
	lightmap[y][x] = { color: scaleList(color, lightSourceBoost) };
}

function glowRadiationColor(pixel) {
	var x = Math.floor(pixel.x / lightmapScale);
	var y = Math.floor(pixel.y / lightmapScale);
	lightmap[y][x] = { color: scaleList(radColor, lightSourceBoost) };
}

var originalStrangeMatterTick = elements.strange_matter.tick;
elements.strange_matter.tick = function(pixel) {
	originalStrangeMatterTick(pixel);
	glowColor(pixel, strangeMatterColor);
};

var originalLightTick = elements.light.tick;
elements.light.tick = function(pixel) {
	originalLightTick(pixel);
	glowItsOwnColor(pixel);
};

var originalLiquidLightTick = elements.liquid_light.tick;
elements.liquid_light.tick = function(pixel) {
	originalLiquidLightTick(pixel);
	glowItsOwnColor(pixel);
};

var originalLaserTick = elements.laser.tick;
elements.laser.tick = function(pixel) {
	originalLaserTick(pixel);
	glowColor(pixel, scaleList(rgbToArray(pixel.color), 0.5));
};

var originalFireTick3 = elements.fire.tick;
elements.fire.tick = function(pixel) {
	originalFireTick3(pixel);
	glowItsOwnColor(pixel);
};

var originalColdFireTick2 = elements.cold_fire.tick;
elements.cold_fire.tick = function(pixel) {
	originalColdFireTick2(pixel);
	glowItsOwnColor(pixel);
};

var originalFlashTick = elements.flash.tick;
elements.flash.tick = function(pixel) {
	originalFlashTick(pixel);
	glowItsOwnColor(pixel);
};

var originalRainbowTick = elements.rainbow.tick;
elements.rainbow.tick = function(pixel) {
	originalRainbowTick(pixel);
	glowItsOwnColor(pixel);
};

var originalFireflyTick = elements.firefly.tick;
elements.firefly.tick = function(pixel) {
	originalFireflyTick(pixel);
	var x = Math.floor(pixel.x / lightmapScale);
	var y = Math.floor(pixel.y / lightmapScale);
	var tickMod = pixelTicks % pixel.fff;
	var num;

	if (tickMod <= 2) num = 1;
	else if (tickMod <= 3) num = 0.75;
	else if (tickMod <= 4) num = 0.5;
	else if (tickMod <= 5) num = 0.25;
	else return;

	lightmap[y][x] = { color: scaleList(fireflyColor, num) };
};

elements.electric.tick = pixel => glowColor(pixel, scaleList(getRandomElement(sparkColors), 0.5));

elements.neon.tick = glowItsOwnColorIfPowered;
elements.led_r.tick = glowItsOwnColorIfPowered;
elements.led_g.tick = glowItsOwnColorIfPowered;
elements.led_b.tick = glowItsOwnColorIfPowered;
elements.light_bulb.behaviorOn = null;
elements.light_bulb.tick = glowItsOwnColorIfPowered;
elements.sun.tick = glowItsOwnColor;
elements.magma.tick = glowItsOwnColor;
elements.plasma.tick = glowItsOwnColor;
elements.fw_ember.tick = glowItsOwnColor;

var radioactiveElements = [
	"uranium", "radiation", "rad_glass", "fallout",
	"molten_uranium", "rad_shard", "rad_cloud", "rad_steam"
];
radioactiveElements.forEach(element => {
	elements[element].tick = glowRadiationColor;
});

var fireflyColor = [240, 255, 70];
var radColor = [75, 100, 30];
var strangeMatterColor = [220 * 0.3, 255 * 0.3, 210 * 0.3];
var sparkColors = [[255, 210, 120], [255, 140, 10]];

runAfterReset(() => {
	initializeLightmap(width, height);
});

const DEFAULT_LIGHT_FACTOR = 0.8;
const MIN_LIGHT_INTENSITY = 0.6;  // If pixel is completely obscured, it will still have this amount of light

const MAX_DIRECT_NEIGHBORS = 4;  // getNeighbors() returns max 4 pixels
const FOLLOWUP_COORDS_TO_CHECK = [
	[-1, -1], [-1, 1], [1, -1], [1, 1],
	[-2, 0], [2, 0], [0, -2], [0, 2],
	[-3, 0], [3, 0], [0, -3], [0, 3],
	[-4, 0], [4, 0], [0, -4], [0, 4]
];

// Pre-initialize the list of transparent elements
let transparentElementsTmp = "glass,stained_glass,glass_shard,solid_diamond,ice,led_r,led_g,led_b".split(",");
let transparentElements = [];

// Function to create the list of transparent elements based on their properties
function initializeTransparentElements() {
	Object.keys(elements).forEach(elementName => {
		const element = elements[elementName];

		// Check if the element is in a gas or liquid state
		if (element.state === "gas") {
			transparentElements.push(elementName);
		}

		// Check if the element's category is "special"
		if (element.category === "special") {
			transparentElements.push(elementName);
		}

		// Check if the element has a custom flag for transparency
		if (element.putInTransparentList) {
			transparentElements.push(elementName);
		}
	});
}

// Call the function once at startup to populate the transparentElements list
initializeTransparentElements();

// Customizable frame interval for recalculating brightness
const calculateEveryNFrames = 2;
let frameCounter = 0;

// Cache for storing pixel brightnesses
let pixelBrightnessCache = {};

// scaleList should only be defined once
if (typeof scaleList === 'undefined') {
	function scaleList(numbers, scale) {
		return numbers.map(number => number * scale);
	}
}

function isOutOfBounds(x, y) {
	return x >= width || y >= height || x < 0 || y < 0;
}

function getOutOfBoundsNeighbors(pixel) {
	const outOfBoundsNeighbors = [];

	// Define the 4 direct neighbors: left, right, top, bottom
	const neighborsToCheck = [
		{ x: pixel.x - 1, y: pixel.y },
		{ x: pixel.x + 1, y: pixel.y },
		{ x: pixel.x, y: pixel.y - 1 },
		{ x: pixel.x, y: pixel.y + 1 }
	];

	// Check each of the neighbors to see if they are out of bounds
	neighborsToCheck.forEach(neighbor => {
		if (isOutOfBounds(neighbor.x, neighbor.y)) {
			outOfBoundsNeighbors.push(neighbor);
		}
	});

	return outOfBoundsNeighbors;
}

// Iterate over each pixel and either calculate or draw occlusion lighting
function applyLightingToPixels(ctx) {
	// Recalculate pixel brightnesses every `n` frames
	if (frameCounter % calculateEveryNFrames === 0) {
		currentPixels.forEach(pixel => {
			const brightness = calculateBrightness(pixel);
			pixelBrightnessCache[`${pixel.x},${pixel.y}`] = brightness;  // Cache the brightness
		});
	}

	// Draw pixels based on cached brightness
	currentPixels.forEach(pixel => {
		const brightness = pixelBrightnessCache[`${pixel.x},${pixel.y}`] || 1;  // Default to full brightness if not calculated yet
		drawPixelShade(ctx, pixel, brightness);
	});

	// Increment the frame counter
	frameCounter++;
}

// Darken a pixel based on brightness
function drawPixelShade(ctx, pixel, brightness) {
	ctx.globalAlpha = 1.0;
	ctx.fillStyle = `rgba(0, 0, 0, ${1 - brightness})`;
	ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
}

// Compute brightness for a given pixel
function calculateBrightness(pixel) {
	const neighboringPixelsCount = getNeighbors(pixel).length + getOutOfBoundsNeighbors(pixel).length;

	// If the pixel has enough light-blocking neighbors, perform a deeper search
	if (neighboringPixelsCount >= MAX_DIRECT_NEIGHBORS) {
		const lightFactor = computeBrightnessFurther(pixel);
		return adjustBrightness(lightFactor);
	}

	return 1;  // Full brightness
}

// Compute brightness based on further pixels that block light
function computeBrightnessFurther(pixel) {
	let lightBlockers = 0;

	FOLLOWUP_COORDS_TO_CHECK.forEach(offset => {
		const [dx, dy] = offset;
		const xCoord = pixel.x + dx;
		const yCoord = pixel.y + dy;

		if (isOutOfBounds(xCoord, yCoord)) {
			lightBlockers++;
			return;
		}

		// Check if the element is transparent
		const element = pixelMap[xCoord][yCoord];
		if (element != undefined && !transparentElements.includes(element.element)) {
			lightBlockers++;
		}
	});

	return 1 - (lightBlockers / FOLLOWUP_COORDS_TO_CHECK.length);
}

// Adjust brightness based on light factor
function adjustBrightness(lightFactor) {
	return lightFactor * DEFAULT_LIGHT_FACTOR + MIN_LIGHT_INTENSITY;
}

renderPostPixel(applyLightingToPixels);
});
