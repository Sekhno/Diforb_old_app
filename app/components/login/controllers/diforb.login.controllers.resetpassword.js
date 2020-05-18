(function() {
	'use strict';

	var appLogin = angular.module( "diforb.login.controllers" );

	appLogin.controller('diforbResetPasswordCtrl', diforbResetPasswordCtrl);

	diforbResetPasswordCtrl.$inject = ['$scope', '$window', 'DiforbConstans', '$location', '$state', '$stateParams', 'AuthService', 'errorService'];

	function diforbResetPasswordCtrl($scope, $window, DiforbConstans, $location, $state, $stateParams, AuthService, errorService)
	{

		$scope.loginData = {
			email: ""
		};
		$scope.spinnerShow = false;
		$scope.infoMessage = null;
		$scope.errorMessage = "";
		// $scope.spinnerShow = true;
		$scope.resetpassword = _resetPassword;
		$scope.errorService = errorService;

		if ($stateParams && $stateParams.email) {
			$scope.loginData.email = $stateParams.email;
		}

		function _resetPassword(evt) {
			evt.preventDefault();

			if (!$scope.formresetpassword.$valid) {
				return;
			};
			$scope.spinnerShow = true;

			AuthService.resetpassword($scope.loginData).then(function (response) {
				$scope.infoMessage = {
					title: "Reset your password",
					message: "The email was sent to you with instructions on how to retrive new password."
				};
				$scope.spinnerShow = false;
			},

			function (err) {
				$scope.errorMessage = err;
				$scope.spinnerShow = false;
			});

		};
	};

})();

