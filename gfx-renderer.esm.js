/*
 * gfx-renderer v2.0.0 Copyright (c) 2021 AJ Savino
 * https://github.com/koga73/gfx-renderer
 * MIT License
 */
import ResizeNotifier from "resize-notifier";
import NormalTimer from "normal-timer";

class GFXRenderer {
	constructor(params = {}) {
		this.fps = params.fps || 60;
		this.contextType = params.contextType || "2d";
		this.canvas = params.canvas || null;
		this.context = params.context || null;
		this.paused = params.paused || false;
		this.onRender = params.onRender || null;

		this._render = this._render.bind(this);
		this._resize = this._resize.bind(this);

		this.init();
	}

	init() {
		const canvas = this.canvas;
		if (!canvas) {
			throw "Canvas does not exist.";
		}

		const contextType = this.contextType;
		const context = this.context || canvas.getContext(contextType);
		if (!context) {
			throw "Context '" + contextType + "' could not be created. Ensure that this feature is supported by your browser.";
		}
		this.context = context;

		this._resizeNotifier = new ResizeNotifier({
			immediate: true,
			onResize: this._resize
		});

		this._normalTimer = new NormalTimer();
		if ("requestAnimationFrame" in window) {
			requestAnimationFrame(this._render);
		} else {
			this._renderInterval = setInterval(this._render, 1000 / this.fps);
		}
	}

	destroy() {
		this.canvas = null;
		this.context = null;
		this.onRender = null;

		this._resizeNotifier = null;
		this._renderInterval = null;
		this._normalTimer = null;
	}

	elapsed() {
		return this._normalTimer ? this._normalTimer.elapsed() : NaN;
	}

	delta() {
		return this._normalTimer ? this._normalTimer.delta() : NaN;
	}

	_render() {
		const normalTimer = this._normalTimer;
		if (!normalTimer) {
			return; //Stop rendering
		}
		const delta = normalTimer.tick();
		if (!this.paused && delta < 1) {
			//As to not "jump" when returning to page
			this.onRender(delta);
		}
		if (!this._renderInterval) {
			requestAnimationFrame(this._render);
		}
	}

	_resize(width, height) {
		const canvas = this.canvas;
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		if (this.onResize) {
			this.onResize(width, height);
		}
	}
}
export default GFXRenderer;
