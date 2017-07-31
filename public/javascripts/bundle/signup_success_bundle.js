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

	var chatAjaxService = __webpack_require__(1);
	$(document).ready(function() {
	    var validate = {
	        _csrf: $('input[name=_csrf]').val()
	    };

	    $('#sendEmail').submit(function(event) {
	        event.preventDefault();
	        chatAjaxService.chatAjax('/sendEmail', 'POST', JSON.stringify(validate), function(data) {
	            if(data.sent) {
	                //TODO update the view here
	                $('.resent-email').show();
	            }
	        });
	    });
	});


/***/ }),
/* 1 */
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