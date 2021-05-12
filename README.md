# GFXRenderer

Provides boilerplate rendering code for canvas graphics

## EcmaScript Module Usage

```js
import GFXRenderer from "gfx-renderer";

const gfx = new GFXRenderer({
	canvas: document.getElementById("gfxRenderer")
	/*
    onRender:function(delta){},
    onResize:function(){},
    paused:true
    */
});

//Required function
gfx.onRender = function (delta) {
	const canvas = gfx.canvas;
	const context = gfx.context;

	//Update Position
	testPosition[0] += testSpeed[0] * delta;
	testPosition[1] += testSpeed[1] * delta;

	//Clear
	context.clearRect(0, 0, canvas.width, canvas.height);

	//Draw BG
	context.fillStype = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);

	//Draw Circle
	context.save();
	context.fillStyle = "#FFFFFF";
	context.globalAlpha = 0.5;
	context.beginPath();
	context.arc(testPosition[0], testPosition[1], 64, 0, Math.PI << 1);
	context.fill();
	context.closePath();
	context.restore();
};

//Optional function
gfx.onResize = function (width, height) {
	console.log("resize", width, height);
};
```

## CommonJS Usage

```js
var gfx = new GFXRenderer({
	canvas: document.getElementById("gfxRenderer")
	/*
    onRender:function(delta){},
    onResize:function(){},
    paused:true
    */
});

//Required function
gfx.onRender = function (delta) {
	var canvas = gfx.canvas;
	var context = gfx.context;

	//Update Position
	testPosition[0] += testSpeed[0] * delta;
	testPosition[1] += testSpeed[1] * delta;

	//Clear
	context.clearRect(0, 0, canvas.width, canvas.height);

	//Draw BG
	context.fillStype = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height);

	//Draw Circle
	context.save();
	context.fillStyle = "#FFFFFF";
	context.globalAlpha = 0.5;
	context.beginPath();
	context.arc(testPosition[0], testPosition[1], 64, 0, Math.PI << 1);
	context.fill();
	context.closePath();
	context.restore();
};

//Optional function
gfx.onResize = function (width, height) {
	console.log("resize", width, height);
};
```

## API

```js
constructor({
	fps: 60,
	contextType: "2d",
	canvas: null, //Required
	context: null,
	paused: false,
	onRender: null
});
```

-   init()
-   destroy()
-   elapsed()
-   delta()
-   onRender = function(delta)
-   onResize = function(width, height)
