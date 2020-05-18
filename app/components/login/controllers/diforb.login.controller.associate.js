(function () {
	var appLogin = angular.module( "diforb.login.controllers" );

	appLogin.controller('diforbAssociateController', diforbAssociateController);

	diforbAssociateController.$inject = ['$scope', '$window', '$timeout','AuthService', 'errorService', '$state'];

	function diforbAssociateController($scope, $window, $timeout, AuthService, errorService, $state)
	{
		var eAuthD = AuthService.externalAuthData;
		$scope.savedSuccessfully = false;
		$scope.message = "";
		$scope.errormessage = "";
		$scope.errorService = errorService;
		$scope.spinnerShow = false;

		$scope.registerData = {
	        userName: eAuthD.userName,
	        email: eAuthD.email,
	        provider: eAuthD.provider,
	        externalAccessToken: eAuthD.externalAccessToken
	    };

		$scope.craftYourSound = function (e) {
			e.preventDefault();
			$state.go("home.libraries");
		};
	}

})();