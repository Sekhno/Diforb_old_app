(function() {
	'use strict';

	var appLogin = angular.module( "diforb.login.controllers" );

	appLogin.controller('diforbNewPasswordCtrl', diforbNewPasswordCtrl);

	diforbNewPasswordCtrl.$inject = ['$scope', '$window', 'DiforbConstans', '$location', '$state', '$stateParams', 'AuthService', 'errorService'];

	function diforbNewPasswordCtrl($scope, $window, DiforbConstans, $location, $state, $stateParams, AuthService, errorService)
	{
		$scope.loginData = {
			id: $stateParams.id,
			code: $stateParams.code,
			password: "",
			confirmPassword: ""
		};
		$scope.spinnerShow = false;
		$scope.infoMessage = null;
		$scope.errorMessage = "";
		$scope.errorModelState = null;

		$scope.errorService = errorService;
		$scope.newPassword = _newPassword;

		if ($stateParams && $stateParams.id) {
			$scope.loginData.Id = $stateParams.id;
		}
		if ($stateParams && $stateParams.code) {
			$scope.loginData.code = $stateParams.code;
		}

		function _newPassword(evt) {
			evt.preventDefault();
			if (!$scope.formnewpassword.$valid) {
				return
			};

			$scope.spinnerShow = true;

			AuthService.newpassword($scope.loginData).then(function (response) {
				$scope.infoMessage = {
					title: "Reset your password",
					message: "The password is successfuly reset."
				};
				$scope.spinnerShow = false;
			}, function (err) {
				$scope.errorMessage = err;
				if (err) {
					for (var key in err) {
						if (key == "modelState") {
							var obj = err.modelState;
							for (var i in obj) {
								if (i == "" && obj.hasOwnProperty(i)) {
									var param = obj[""];
									$scope.errorModelState =param[0];
								}
							}
						} else {
							$scope.errorModelState = err["message"];
						}
					}
				}
				$scope.spinnerShow = false;
			});
		};
	};

})();


