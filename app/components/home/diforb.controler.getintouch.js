(function () {
	angular.module('diforb.controllers')

	.controller('getintouchController', getintouchController);

	getintouchController.$inject   = ['$scope', 'getintouchService', 'errorService'];

	function getintouchController($scope, getintouch, errorService) {
		console.log('Get in Touch');
		$scope.getintouch = new getintouch();
		$scope.button = 'Send';
		$scope.saveGetintouch = saveGetintouch;
		$scope.isMessageSend = false;
		$scope.errorService  = errorService;

		function saveGetintouch() {
			console.log($scope.formGetintouch.$valid);
			if (!$scope.formGetintouch.$valid) return;
			$scope.button = 'Sending...';

			$scope.getintouch.$save( function(data) {
				// success
				console.log(data);
				$scope.isMessageSend = true;
			}, function(data) {
				// Error
				console.log('Error');
				$scope.button = 'Send';

			});
		}
	}
})();