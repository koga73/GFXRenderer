/*
* GFXRenderer v1.0.4 Copyright (c) 2015 AJ Savino
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
		FPS:60 //Used when requestAnimationFrame doesn't exist
	};
	
	var _vars = {
        contextType:"2d",
        
		canvas:null,
		context:null,
        paused:false,
		
        _resizer:null,
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
			
			_vars._resizer = new Resizer({
                onResize:_methods._resize
            });
			_methods._updateSize();
            
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
            
            var resizer = _vars._resizer;
            if (resizer){
                resizer.destroy();
                _vars._resizer = null;
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
                _instance.onRender(delta);
			}
			if (!_vars._renderInterval){
				requestAnimationFrame(_methods._render);
			}
		},
		
		_resize:function(){
			_methods._updateSize();
            if (_instance.onResize){
                _instance.onResize();
            }
		},
        
        _updateSize:function(){
            var canvas = _instance.canvas;
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
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
        onRender:null,
        onResize:null
	};
    for (var prop in params){
        _instance[prop] = params[prop];
    }
	_instance.init();
	return _instance;
});

/*
* NormalTimer v1.0.1 Copyright (c) 2015 AJ Savino
* MIT LICENSE
*/
var NormalTimer = function(){
	var _vars = {
		_delta:0,
		_lastTime:0,
		_startTime:new Date().getTime()
	};
	_vars._lastTime = _vars._startTime;
	
	var _methods = {
		elapsed:function(){ //Getter
            return (new Date().getTime() - _vars._startTime) * 0.001;
		},

		delta:function(){ //Getter
			return _vars._delta;
		},

		tick:function(){
			var currentTime = new Date().getTime();
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

/*
* Resizer v1.0.1 Copyright (c) 2015 AJ Savino
* MIT LICENSE
*/
var Resizer = function(params){
    var _instance = null;
	
    var _vars = {
        callbackDelay:300,      //Time in ms to wait before calling onResize
        
        _lastOrientation:window.orientation,
        _timeout:null,
	};
    
    var _methods = {
        init:function(){
			if (window.addEventListener){
				window.addEventListener("resize", _methods._handler_resize, false);
				window.addEventListener("orientationchange", _methods._handler_resize, false);
			} else if (window.attachEvent){
				window.attachEvent("onresize", _methods._handler_resize);
				window.attachEvent("onorientationchange", _methods._handler_resize);
			}
        },
        
        destroy:function(){
            var timeout = _vars._timeout;
			if (timeout){
				clearTimeout(timeout);
				_vars._timeout = null;
			}
            _instance.onResize = null;
            
            if (window.removeEventListener){
				window.removeEventListener("resize", _methods._handler_resize);
				window.removeEventListener("orientationchange", _methods._handler_resize);
			} else if (window.detachEvent){
				window.detachEvent("onresize", _methods._handler_resize);
				window.detachEvent("onorientationchange", _methods._handler_resize);
			}
        },
        
        getWidth:function(){
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        },
        
        getHeight:function(){
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        },
        
        _handler_resize:function(){
            if ("onorientationchange" in window){
                var orientation = window.orientation;
                if (orientation != _vars._lastOrientation){
                    _vars._lastOrientation = orientation;
                } else {
                    return;
                }
            }
			var timeout = _vars._timeout;
			if (timeout){
				clearTimeout(timeout);
				_vars._timeout = null;
			}
			_vars._timeout = setTimeout(function(){
				clearTimeout(timeout);
				_vars._timeout = null;
                _instance.onResize(_instance.getWidth(), _instance.getHeight());
			}, _instance.callbackDelay);
		}
    };
    
    _instance = {
        callbackDelay:_vars.callbackDelay,
        
        init:_methods.init,
        destroy:_methods.destroy,
        getWidth:_methods.getWidth,
        getHeight:_methods.getHeight,
        onResize:null
    };
    for (var param in params){
        _instance[param] = params[param];
    }
    _instance.init();
    return _instance;
};