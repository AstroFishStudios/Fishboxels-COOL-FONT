// (REAL) Combined Visual Mod
// Original mods by their respective authors
// Combined by Fischy6734 on 2025-05-23

// --- lightmap.js - COMPLETE ORIGINAL CODE ---
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
}

// --- nicer_flame.js - COMPLETE ORIGINAL CODE ---
// RedBirdly's mod that makes fire look better with dark red at the top of the flame
var topColor = 'rgb(130, 0, 10)';
var blending = 0.9;

var topColdFireColor = 'rgb(30, 10, 110)';
var coldFireBlending = 0.9;

function cssColorToRGB(color) {
	let rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
}

function blendColors(color1, color2, weight) {
	const [r1, g1, b1] = cssColorToRGB(color1);
	const [r2, g2, b2] = cssColorToRGB(color2);

	const r = Math.round(r1 * weight + r2 * (1 - weight));
	const g = Math.round(g1 * weight + g2 * (1 - weight));
	const b = Math.round(b1 * weight + b2 * (1 - weight));

	return `rgb(${r}, ${g}, ${b})`;
}

let originalFireTick = elements.fire.tick;
elements.fire.tick = function(pixel) {
	// Call the original tick function
	originalFireTick(pixel);

	if (Math.random()<0.4) {
		let originalColor = pixel.color;
		pixel.color = blendColors(originalColor, topColor, blending);
	}
};

let originalColdFireTick = elements.cold_fire.tick;
elements.cold_fire.tick = function(pixel) {
	// Call the original tick function
	originalColdFireTick(pixel);

	if (Math.random()<0.4) {
		let originalColor = pixel.color;
		pixel.color = blendColors(originalColor, topColdFireColor, coldFireBlending);
	}
};

elements.fire.color = ["#ffcb31","#ffab21","#ff9600"];
elements.cold_fire.color = ["#11ddff","#2288dd"];

// --- occlusion.js - COMPLETE ORIGINAL CODE ---
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

function applyLightingToPixels(ctx) {
	if (frameCounter % calculateEveryNFrames === 0) {
		currentPixels.forEach(pixel => {
			const brightness = calculateBrightness(pixel);
			pixelBrightnessCache[`${pixel.x},${pixel.y}`] = brightness;
		});
	}
}

// --- clouds.js - COMPLETE ORIGINAL CODE ---
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
	}
}

// --- sky.js - COMPLETE ORIGINAL CODE ---
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
}

// --- heatglow.js - COMPLETE ORIGINAL CODE ---
if (!settings.heatglowMode){settings.heatglowMode = 1; saveSettings();}
if (!eLists.heatBlacklist) {eLists.heatBlacklist = []}
	eLists.heatBlacklist = eLists.heatBlacklist.concat(["void", "sun", "light", "plasma", "fire", "border", "heater", "superheater", "laser", "ray"])
function tempToRGB(temp){
	if (temp <= 6500){
		return{
			r: 255,
			g: Math.max(-325.757*Math.pow(0.999581, temp)+272.879, 0),
			b: Math.max(-571.403*Math.pow(0.999675, temp)+321.955, 0)
		} 
	} else {
		return {
			r: Math.max(604.879*Math.pow(0.999697, temp)+169.618, 0),
			g: Math.max(719.488*Math.pow(0.999599, temp)+201.788, 0),
			b: 255
		}
	}
}
function oldtempToRgb(temp, pixel){
	let halftemp = ((20+elements[pixel.element].tempHigh)/2)
	let fulltemp = elements[pixel.element].tempHigh
	let ctemp = 0;
	if (pixel.temp <= fulltemp - halftemp){
		ctemp = 0;
	} else {
		ctemp = temp/(fulltemp-halftemp)-halftemp/(fulltemp-halftemp);
	}
	if (ctemp <= 0.5){
		return{
			r: (510*ctemp),
			g: 0,
			b: 0,
			opacity: (ctemp/1.3)
		}
	} else {
		return {
			r: 255,
			g: ((510*ctemp)-255),
			b: ((280*ctemp)-140),
			opacity: (ctemp/1.3)
		}
	}
}

renderPresets.HEATGLOW = function(pixel,ctx) {
	drawDefault(ctx,pixel)
}

renderEachPixel(function(pixel,ctx) {
    // run any code when each individual pixel is rendered
	if (!eLists.heatBlacklist.includes(pixel.element)){
	let color, opacity;
	if (settings.heatglowMode == 1){
		color = tempToRGB(pixel.temp)
		opacity = Math.max(0, Math.min(1, -3.5486801*Math.pow(0.9960659, pixel.temp)+0.73333))
	} else {
		color = oldtempToRgb(pixel.temp, pixel)
		opacity = color.opacity
		if (!((elements[pixel.element].tempHigh > 400 && elements[elements[pixel.element].stateHigh] && elements[elements[pixel.element].stateHigh].state === "liquid"))){
			return;
		}
	}
	if (elements[pixel.element].glow || elements[pixel.element].isGas){
		drawPlus(ctx,"rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + opacity +")",pixel.x,pixel.y)
	} else {
		drawSquare(ctx,"rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + opacity +")",pixel.x,pixel.y)
	}}
})
keybinds["KeyH"] = function(){
	if (settings.heatglowMode == 1){settings.heatglowMode = 2}
}

// --- Initialization Code ---
var clouds = []; // Initialize clouds array
if (!window.hour) window.hour = initial_hour_setting.value; // Initialize hour if not exists

// Initialize on load
function initializeAll() {
    if (cloud_count_setting.value > 0) {
        initClouds(cloud_count_setting.value);
    }
    initializeTransparentElements();
    if (typeof initializeLightmap === 'function') {
        initializeLightmap(width, height);
    }
}

// Run initialization when elements are available
whenAvailable(["elements", "width", "height"], initializeAll);
