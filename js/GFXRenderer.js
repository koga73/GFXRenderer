/*
* GFXRenderer v1.0.0 Copyright (c) 2015 AJ Savino
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
var GFXRenderer = (function(params){
	var _instance = null;
	
	var _consts = {
		FPS:60, //Used when requestAnimationFrame doesn't exist
		RESIZE_TIMEOUT:250
	};
	
	var _vars = {
        contextType:"2d",
        
		canvas:null,
		context:null,
        paused:false,
		
		_resizeTimeout:null,
		_renderInterval:null,
		_normalTimer:null
	};
	
	var _methods = {
		init:function(){
            var canvas = _instance.canvas;
            if (!canvas){
                throw "Canvas does not exist.";
            }
            
            var contextType = _instance.contextType;
            var context = canvas.getContext(contextType);
            if (!context){
                throw "Context '" + contextType + "' could not be created. Ensure that this feature is supported by your browser.";
            }
            _instance.context = context;
			
			var resizeEvent = ("onorientationchange" in window) ? "orientationchange" : "resize";
			if (window.addEventListener){
				window.addEventListener(resizeEvent, _methods._handler_resize, false);
			} else if (window.attachEvent){
				window.attachEvent("on" + resizeEvent, _methods._handler_resize);
			}
			_methods._resize();
			
			_vars._normalTimer = new NormalTimer();
			if ("requestAnimationFrame" in window){
				requestAnimationFrame(_methods._render);
			} else {
				_vars._renderInterval = setInterval(_methods._render, 1000 / _consts.FPS);
			}
		},
		
		destroy:function(){
            _vars._normalTimer = null;
            
            var renderInterval = _vars._renderInterval;
            if (renderInterval){
                clearInterval(renderInterval);
                _vars._renderInterval = null;
            }
            
            var resizeTimeout = _vars._resizeTimeout;
            if (resizeTimeout){
                clearTimeout(resizeTimeout);
                _vars._resizeTimeout = null;
            }
            var resizeEvent = ("onorientationchange" in window) ? "orientationchange" : "resize";
			if (window.removeEventListener){
				window.removeEventListener(resizeEvent, _methods._handler_resize);
			} else if (window.detachEvent){
				window.detachEvent("on" + resizeEvent, _methods._handler_resize);
			}
            
            var context = _instance.context;
            if (context){
                _instance.context = null;
            }
		},
		
		_render:function(){
            var normalTimer = _vars._normalTimer;
            if (!normalTimer){
                return; //Stop rendering
            }
			var delta = normalTimer.tick();
			if (!_instance.paused && delta < 1){ //As to not "jump" when returning to page
                _instance.render(delta);
			}
			if (!_vars.renderTimer){
				requestAnimationFrame(_methods._render);
			}
		},
		
		_handler_resize:function(){
			var timeout = _vars._resizeTimeout;
			if (timeout){
				clearTimeout(timeout);
				_vars._resizeTimeout = null;
			}
			_vars._resizeTimeout = setTimeout(function(){
				clearTimeout(timeout);
				_vars._resizeTimeout = null;
				_methods._resize();
			}, _consts.RESIZE_TIMEOUT);
		},
		
		_resize:function(){
			var canvas = _instance.canvas;
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
            
            if (_instance.resize){
                _instance.resize();
            }
		}
	};
	
	_instance = {
        contextType:_vars.contextType,
        
        canvas:_vars.canvas,
        context:_vars.context,
		paused:_vars.paused,
        
        elapsed:function(){
            return (_vars._normalTimer) ? _vars._normalTimer.elapsed() : NaN;
        },
        delta:function(){
            return (_vars._normalTimer) ? _vars._normalTimer.delta() : NaN;
        },
		
		init:_methods.init,
		destroy:_methods.destroy,
        render:null,
        resize:null
	};
    for (var prop in params){
        _instance[prop] = params[prop];
    }
	_instance.init();
	return _instance;
});

/*
* NormalTimer v1.0.0 Copyright (c) 2014 AJ Savino
* MIT LICENSE
*/
var NormalTimer = function(){
	var _vars = {
		_elapsed:0,
		_delta:0,
		_lastTime:0,
		_startTime:new Date().getTime()
	};
	_vars._lastTime = _vars._startTime;
	
	var _methods = {
		elapsed:function(){ //Getter
			return _vars._elapsed;
		},

		delta:function(){ //Getter
			return _vars._delta;
		},

		tick:function(){
			var currentTime = new Date().getTime();
			_vars._elapsed = (currentTime - _vars._startTime) * 0.001;
			_vars._delta = (currentTime - _vars._lastTime) * 0.001;
			_vars._lastTime = currentTime;
			return _vars._delta;
		}
	};

	return {
		elapsed:_methods.elapsed,
		delta:_methods.delta,
		tick:_methods.tick
	};
};