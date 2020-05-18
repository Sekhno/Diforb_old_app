(function () {
	'use strict';

	var appLogin = angular.module("diforb.login.controllers");

	appLogin.controller('diforbLoginResendCtrl', diforbLoginResendCtrl);
	// appLogin.animation('.slide', slideAnimation);

	diforbLoginResendCtrl.$inject = ['$scope', '$window', 'DiforbConstans', '$location', '$state', '$stateParams', 'AuthService', 'errorService'];

	function diforbLoginResendCtrl($scope, $window, DiforbConstans, $location, $state, $stateParams, AuthService, errorService)
	{
		$scope.loginData = {
			email: ""
		};

		$scope.infoMessage = null;
		$scope.errorMessage = "";

		$scope.resendlink = _resendlink;
		$scope.errorService = errorService;

		if ($stateParams && $stateParams.email) {
			$scope.loginData.email = $stateParams.email;
		}

		function _resendlink(evt) {
			evt.preventDefault();

			if (!$scope.formlogin.$valid) {
				return
			};

			$scope.spinnerShow = true;

			AuthService.resendlink($scope.loginData).then(function (response) {
				$scope.spinnerShow = false;
				$scope.infoMessage = {
					title: "Resend link",
					message: "Please check your e-mail and click the link to confirm your account."
				}
			},
			function (err) {
				$scope.spinnerShow = false;
				$scope.errorMessage = err;
			});
		};
	};

})();

