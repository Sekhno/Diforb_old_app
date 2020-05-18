(function() {
	'use strict';
	var appLogin = angular.module( 'diforb.services' );

	var appLoginService = appLogin.factory('errorService', errorService);

	function errorService() {
		this.hasFieldError = hasFieldError;

		return this;

		function hasFieldError(formInst, fieldInst)
		{
			return fieldInst.$invalid && (formInst.$submitted || fieldInst.$touched);
		}
	}
})();