/*
 * gfx-renderer v2.0.0 Copyright (c) 2021 AJ Savino
 * https://github.com/koga73/gfx-renderer
 * MIT License
 */
var GFXRenderer = function (params) {
	var _instance = null;

	var _consts = {
		FPS: 60 //Used when requestAnimationFrame doesn't exist
	};

	var _vars = {
		contextType: "2d",

		canvas: null,
		context: null,
		paused: false,

		_resizeNotifier: null,
		_renderInterval: null,
		_normalTimer: null
	};

	var _methods = {
		init: function () {
			var canvas = _instance.canvas;
			if (!canvas) {
				throw "Canvas does not exist.";
			}

			var contextType = _instance.contextType;
			var context = canvas.getContext(contextType);
			if (!context) {
				throw "Context '" + contextType + "' could not be created. Ensure that this feature is supported by your browser.";
			}
			_instance.context = context;

			_vars._resizeNotifier = new ResizeNotifier({
				immediate: true,
				onResize: _methods._resize
			});

			_vars._normalTimer = new NormalTimer();
			if ("requestAnimationFrame" in window) {
				requestAnimationFrame(_methods._render);
			} else {
				_vars._renderInterval = setInterval(_methods._render, 1000 / _consts.FPS);
			}
		},

		destroy: function () {
			_vars._normalTimer = null;

			var renderInterval = _vars._renderInterval;
			if (renderInterval) {
				clearInterval(renderInterval);
				_vars._renderInterval = null;
			}

			var resizeNotifier = _vars._resizeNotifier;
			if (resizeNotifier) {
				resizeNotifier.destroy();
				_vars._resizeNotifier = null;
			}

			var context = _instance.context;
			if (context) {
				_instance.context = null;
			}
		},

		_render: function () {
			var normalTimer = _vars._normalTimer;
			if (!normalTimer) {
				return; //Stop rendering
			}
			var delta = normalTimer.tick();
			if (!_instance.paused && delta < 1) {
				//As to not "jump" when returning to page
				_instance.onRender(delta);
			}
			if (!_vars._renderInterval) {
				requestAnimationFrame(_methods._render);
			}
		},

		_resize: function (width, height) {
			var canvas = _instance.canvas;
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;

			if (_instance.onResize) {
				_instance.onResize(width, height);
			}
		}
	};

	_instance = {
		contextType: _vars.contextType,

		canvas: _vars.canvas,
		context: _vars.context,
		paused: _vars.paused,

		elapsed: function () {
			return _vars._normalTimer ? _vars._normalTimer.elapsed() : NaN;
		},
		delta: function () {
			return _vars._normalTimer ? _vars._normalTimer.delta() : NaN;
		},

		init: _methods.init,
		destroy: _methods.destroy,
		onRender: null,
		onResize: null
	};
	for (var prop in params) {
		_instance[prop] = params[prop];
	}
	_instance.init();
	return _instance;
};
