/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	//TODO need a password util to validate password
	var LetterAvatar = __webpack_require__(2);
	var chatAjaxService = __webpack_require__(3);
	$(document).ready(function() {
	    LetterAvatar.transform();
	    $('.validate').submit(function(event) {
	        event.preventDefault();

	        var obj = {
	            first:$('input[name=first]').val(),
	            last: $('input[name=last]').val(),
	            email: $('input[name=email]').val(),
	            _csrf: $('input[name=_csrf]').val()
	        };
	        chatAjaxService.chatAjax(window.location.pathname+'/updatedInfo', 'PUT', JSON.stringify(obj),function(data) {
	            //TODO update result in UI
	            console.log("updated");
	        });
	    });

	    $('.password_form').submit(function(event) {
	        //TODO update errors in UI, too lazy
	        event.preventDefault();
	        var obj = {
	            old_password:$('input[name=old_password]').val(),
	            new_password:$('input[name=new_password]').val(),
	            _csrf: $('input[name=_csrf]').val()
	        };
	        
	        if(obj.new_password.length < 6) {
	            console.log("must be more than 6");
	            return;
	        }

	        if(obj.new_password !== $('input[name=confirm_password]').val()) {
	            console.log("doesnt match");
	            return;
	        }

	        chatAjaxService.chatAjax(window.location.pathname+'/updatedPassword', 'PUT', JSON.stringify(obj), function(data) {
	            if(data.changed) {
	                //update ui
	                return;
	            }
	        });
	    });

	});


/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*
	     * LetterAvatar
	     * 
	     * Artur Heinze
	     * Create Letter avatar based on Initials
	     * based on https://gist.github.com/leecrossley/6027780
	     */
	    (function(w, d){

	        function LetterAvatar (name, size) {

	            name  = name || '';
	            size  = size || 60;

	            var colours = [
	                    "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", 
	                    "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
	                ],

	                nameSplit = String(name).split(' '),
	                initials, charIndex, colourIndex, canvas, context, dataURI;


	            if (nameSplit.length == 1) {
	                initials = nameSplit[0] ? nameSplit[0].charAt(0):'?';
	            } else {
	                initials = nameSplit[0].charAt(0) + nameSplit[1].charAt(0);
	            }
	            //initials=name.substring(0, 4);

	            if (w.devicePixelRatio) {
	                size = (size * w.devicePixelRatio);
	            }
	                
	            charIndex     = (initials == '?' ? 72 : initials.charCodeAt(0)) - 64;
	            colourIndex   = charIndex % (colours.length + 1);
	            canvas        = d.createElement('canvas');
	            canvas.width  = size;
	            canvas.height = size;
	            context       = canvas.getContext("2d");
	             
	            context.fillStyle = colours[colourIndex - 1];
	            context.fillRect (0, 0, canvas.width, canvas.height);
	            context.font = Math.round(canvas.width/2.5)+"px Arial";
	            context.textAlign = "center";
	            context.fillStyle = "#FFF";
	            context.fillText(initials, size / 2, size / 1.6);

	            dataURI = canvas.toDataURL();
	            canvas  = null;

	            return dataURI;
	        }

	        LetterAvatar.transform = function() {

	            Array.prototype.forEach.call(d.querySelectorAll('img[avatar]'), function(img, name) {
	                name = img.getAttribute('avatar');
	                img.src = LetterAvatar(name, img.getAttribute('width'));
	                img.removeAttribute('avatar');
	                img.setAttribute('alt', name);
	            });
	        };


	        // AMD support
	        if (true) {
	            
	            !(__WEBPACK_AMD_DEFINE_RESULT__ = function () { return LetterAvatar; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        
	        // CommonJS and Node.js module support.
	        } else if (typeof exports !== 'undefined') {
	            
	            // Support Node.js specific `module.exports` (which can be a function)
	            if (typeof module != 'undefined' && module.exports) {
	                exports = module.exports = LetterAvatar;
	            }

	            // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
	            exports.LetterAvatar = LetterAvatar;

	        } else {
	            
	            window.LetterAvatar = LetterAvatar;

	            d.addEventListener('DOMContentLoaded', function(event) {
	                LetterAvatar.transform();
	            });
	        }

	    })(window, document);


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	//chat ajax function
	//why the fuck is Handlebars.templates undefined
	//define(function(Handlebars) {
	    //return {
	        //chatAjax: chatAjaxRequire(),
	        //chatAjaxPromise: chatAjaxPromise
	    //};
	//});

	function chatAjaxPromise(url, type, data) {
	    return $.ajax({
	        url: url,
	        type: type,
	        data: data,
	        contentType: 'application/json'
	    });
	}

	function chatAjaxRequire() {
	    
	    return function(url, type, data, callback) {
	        return $.ajax({
	            url: url,
	            type: type,
	            data: data,
	            contentType: 'application/json',
	            success: function (data) {
	                callback(data);
	            },
	            error: function(err) {
	                console.log(err);
	            }
	        });
	    };        
	}

	module.exports = {
	    chatAjaxPromise: chatAjaxPromise,
	    chatAjax: chatAjaxRequire()
	};


/***/ })
/******/ ]);