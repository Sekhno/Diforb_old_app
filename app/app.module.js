(function() {
	var app = angular.module('diforbApp', [
		'ui.router',
		'ngResource',
		'LocalStorageModule',
		'diforb.services',
		'diforb.controllers',
		'diforb.login.controllers',
		'cfp.hotkeys',
		'ngAnimate',
		'vAccordion',
		'ngMessages',
		'ng.deviceDetector'
	]);
})();