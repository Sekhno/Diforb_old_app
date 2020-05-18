(function () {

	'use strict';

	var appLogin = angular.module( 'diforb.login.controllers', [] );

	appLogin.controller( 'diforbLoginCtrl', diforbLoginCtrl );

	appLogin.directive( 'spinnerProcess', spinnerProcess );

	diforbLoginCtrl.$inject = [ '$scope', '$document' ];

	function diforbLoginCtrl ( $scope, $document )
	{

		$scope.$emit( 'homeLoadedEvent', {

			message: false
		})
	}

	function spinnerProcess()
	{

		var directive = {
			link: link,
			templateUrl: 'app/components/login/views/spinner.process.html',
			restrict: 'E'
		};

		return directive;

		function link( scope, element, attrs ) {
			//scope.spinnerShow = false;
		}
	}

})();