(function(){
	'use strict';

	var appLogin = angular.module('diforb.login.controllers');

	appLogin.controller('diforbLoginSignInCtrl', diforbLoginSignInCtrl);

	appLogin.animation('.slide', slideAnimation);

	diforbLoginSignInCtrl.$inject = ['$scope', '$window','DiforbConstans', '$location', '$state', 'AuthService', 'errorService'];

	function diforbLoginSignInCtrl($scope, $window, DiforbConstans, $location, $state, AuthService, errorService)
	{

		$scope.loginData = {
			userName: "",
			password: "",
			useRefreshTokens: false
		};
		$scope.spinnerShow = false;
		$scope.infoMessage = null;
		$scope.errorMessage = "";

		$scope.login = _login;
		$scope.errorService = errorService;

		function _login(evt){
			evt.preventDefault();

			if(!$scope.formlogin.$valid) return;

			$scope.spinnerShow = true;

			AuthService.login($scope.loginData).then(function (response){
				$window.location.href = "/#/home/libraries";
				$scope.spinnerShow = false;
				// $state.go('dashboard');
			}, function(err){
				// Account is not confirmed
				if (err
					&& err.error_description
					&& err.error_description.toLowerCase() == ("user did not confirm email."))
				{
					$state.go('resendlink', { email: $scope.loginData.userName });
					return;
				};

				if(err && err.error_description){
					$scope.errorMessage = err.error_description;
				};
				$scope.spinnerShow = false;
				//$scope.errorMessage = err.error_description;
			});
		};
	};

	function slideAnimation(){
		var NG_HIDE_CLASS = 'ng-hide';
		return {
			beforeAddClass: function(element, className, done) {
				if(className === NG_HIDE_CLASS) {
					element.slideUp(done);
				}
			},
			removeClass: function(element, className, done) {
				if(className === NG_HIDE_CLASS) {
					element.hide().slideDown(done);
				}
			}
		}
	};

})();

