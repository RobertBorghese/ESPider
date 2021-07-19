// Let's get this party started.

const TS = 48;
const TS2 = 24;

var ESP = {};

ESP.GlobalKeys = Object.keys(globalThis).length;

ESP.AddToHistory = function(func, className, name) {
	if(func) {
		if(ESP[className][name]) {
			alert("Repeat override of: `" + className + "." + name + "`!!");
		}
		ESP[className][name] = func;
	}
}

ESP.MeltTogether = function(es6Class, name) {
	const className = name || (es6Class.MELTNAME || es6Class.prototype.constructor.name.replace(/_+$/, ""));
	const classObj = globalThis[className];
	if(classObj) {
		ESP[className] = ESP[className] || {};
		Object.getOwnPropertyNames(es6Class.prototype).forEach(function(name) {
			if(name === "constructor") return;
			ESP.AddToHistory(classObj.prototype[name], className, name);
			classObj.prototype[name] = es6Class.prototype[name];
		});
		Object.getOwnPropertyNames(es6Class).forEach(function(name) {
			if(name === "length" || name === "prototype" || name === "name") return;
			ESP.AddToHistory(classObj[name], className, name);
			classObj[name] = es6Class[name];
		});
	}
};

ESP.ApplyModifies = function() {
	const Keys = Object.keys(globalThis);
	const NewLength = Keys.length;
	for(let i = ESP.GlobalKeys; i < NewLength; i++) {
		const name = Keys[i];
		if(name.startsWith("modify_")) {
			ESP.MeltTogether(globalThis[name], name.replace(/^modify_([a-zA-Z_]+)(?:_\d+)?$/, "$1"));
		}
	}
};

ESP.lerp = function(a, b, x) {
	if(Math.abs(a - b) < 0.1) return b;
	return a + (b - a) * x;
};

ESP.makeText = function(text, fontSize = 20, align = "center") {
	const Text = new PIXI.Text(text, {
		fontFamily: $gameSystem.mainFontFace(),
		fontSize: fontSize,
		fill: 0xffffff,
		align: align,
		stroke: "rgba(0, 0, 0, 0.75)",
		strokeThickness: 4,
		lineJoin: "round"
	});
	Text.anchor.set(0.5, 1);
	Text.resolution = 2;
	return Text;
};

ESP.snap = function(obj, width, height) {
	const bitmap = new Bitmap(width, height);
	const renderTexture = PIXI.RenderTexture.create(width, height);
	if(obj) {
		const renderer = Graphics.app.renderer;
		renderer.render(obj, renderTexture);
		obj.worldTransform.identity();
		const canvas = renderer.extract.canvas(renderTexture);
		bitmap.context.drawImage(canvas, 0, 0);
		canvas.width = 0;
		canvas.height = 0;
	}
	renderTexture.destroy({ destroyBase: true });
	bitmap.baseTexture.update();
	return bitmap;
}

// World Speed
ESP.WS = 1;

ESP.CameraSmoothing = 0.04;

// do these do anything?? :/
/*
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;
PIXI.settings.RESOLUTION = 1;
window.devicePixelRatio = 1;*/

// pixel-art needs to be ROUGH uwu
ESP.Bitmap_load = Bitmap.load;
Bitmap.load = function() {
	const result = ESP.Bitmap_load.apply(this, arguments);
	result.smooth = false;
	return result;
};

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
// https://stackoverflow.com/a/6274381
Object.defineProperty(Array.prototype, 'shuffle', {
	value: function() {
		for (let i = this.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this[i], this[j]] = [this[j], this[i]];
		}
		return this;
	}
});

Bitmap.snapWhole = function(stage, width, height) {
	const bitmap = new Bitmap(width, height);
	const renderTexture = PIXI.RenderTexture.create(width, height);
	if (stage) {
		const renderer = Graphics.app.renderer;
		renderer.render(stage, renderTexture);
		stage.worldTransform.identity();
		const canvas = renderer.extract.canvas(renderTexture);
		bitmap.context.drawImage(canvas, 0, 0);
		canvas.width = 0;
		canvas.height = 0;
	}
	renderTexture.destroy({ destroyBase: true });
	bitmap.baseTexture.update();
	return bitmap;
};
