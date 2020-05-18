(function() {
	'use strict';

	var appLogin = angular.module( "diforb.login.controllers" );

	appLogin.controller('diforbLoginSignUpCtrl', diforbLoginSignUpCtrl);

	diforbLoginSignUpCtrl.$inject = ['$scope', 'AuthService', 'errorService'];

	function diforbLoginSignUpCtrl($scope,  AuthService, errorService) {

		$scope.registerData = {
			userName: "",
			password: "",
			confirmpassword: ""
		};
		$scope.spinnerShow = false;
		$scope.infoMessage = null;
		$scope.errorMessage = null;
		$scope.register = _register;
		$scope.errorService = errorService;

		function _register(evt) {
			evt.preventDefault();

			if(!$scope.formsignup.$valid) {
				return;
			}
			$scope.spinnerShow = true;

			AuthService.register($scope.registerData).then( function(response){
				$scope.infoMessage = {
					title: "Awesome!",
					message: "Please check your e-mail and click the link to confirm your account."
				};
				$scope.spinnerShow = false;
			}, function (err) {
				$scope.infoMessage = null;

				var modelState = err.modelState;
				var errorString = "";

				if(err.modelState) {
					for (var key in modelState) {
						if (modelState.hasOwnProperty(key)) {
							errorString = (errorString == "" ? "" : errorString + "<br/>") + modelState[key];
						}
					}
				} else {
					errorString = err.message;
				}
				$scope.errorMessage = errorString;
				$scope.spinnerShow = false;
			});
		};
	};
})();

