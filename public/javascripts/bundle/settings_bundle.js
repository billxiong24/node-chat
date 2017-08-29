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
	var chatAjaxService = __webpack_require__(3);
	$(document).ready(function() {
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
/* 2 */,
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