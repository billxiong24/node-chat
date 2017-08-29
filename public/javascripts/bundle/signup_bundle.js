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

	var chatAjaxService = __webpack_require__(3);
	$(document).ready(function() {
	    
	    var last_username = null;

	    function validate() {
	        return false;
	    }
	    $(window).keydown(function(event){
	        if((event.keyCode == 13) && (!validate())) {
	              event.preventDefault();
	              return false;
	        }
	    });

	    $('#form_register').submit(function(event) {
	        event.preventDefault();
	        var obj = {};
	        obj._csrf = $('input[name=_csrf]').val();
	        obj.user_signup =$('input[name=user_signup]').val();
	        obj.password_signup = $('input[name=password_signup]').val();
	        obj.firstname_signup = $('input[name=firstname_signup]').val();
	        obj.lastname_signup = $('input[name=lastname_signup]').val();
	        obj.email = $('input[name=email]').val();
	        var confirmed = $('input[name=pass_confirm]').val();

	        var para = $('#username_error');
	        var pass = $('#password_error');
	        console.log(obj.user_signup.length);
	        if(obj.user_signup.length < 5) {
	            para.text("Username should be at least 5 characters.");
	            para.show();
	            pass.hide();
	            return;
	        }

	        if(obj.password_signup.length < 6) {
	            pass.text("Password should be at least 6 characters.");
	            para.hide();
	            pass.show();
	            return;
	        }
	        if(obj.password_signup !== confirmed) {
	            pass.text("Passwords should match");
	            pass.show();
	            para.hide();
	            return;
	        }
	        if(obj.user_signup === last_username) {
	            console.log("same username");
	            return;
	        }
	        last_username = obj.user_signup;  
	        
	        chatAjaxService.chatAjax('/signup', 'POST', JSON.stringify(obj), function(data) {
	            if(!data.signup_error) {
	                window.location.replace('/signup_success');
	                return;
	            }
	            para.text(data.error);
	            para.show();
	            pass.hide();
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