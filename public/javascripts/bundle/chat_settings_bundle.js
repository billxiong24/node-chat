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
/***/ (function(module, exports) {

	//var chatAjaxService = require('../service/chatAjaxService.js');

	                        //<li><a href="#" id="name-change">Change name</a>
	                        //</li>
	                        //<li><a href="#" id="code-change">Change code</a>
	                        //</li>
	                        //<li><a href="#" id="description-change">Add description</a>
	                        //</li>
	                        //<li class="divider"></li>
	                        //<li><a href="#" id="block-user">Block user</a>

	module.exports = 5;
	//module.exports = (function() {
	    //$(document).ready(function() {
	        //$('#name-change').click(function(e) {
	            //e.preventDefault();
	            //console.log("hid");
	            //var text = $('.change-name').text();
	            //$('.change-name').html('<input value="' + text + '"/>');
	        //});
	    //});

	//})();


/***/ })
/******/ ]);