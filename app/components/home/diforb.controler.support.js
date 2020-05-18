(function () {
	angular.module('diforb.controllers')

	.controller('supportController',supportController);

	supportController.$inject   = ['$scope', 'supportService', 'errorService'];

	function supportController($scope, support, errorService) {
		$scope.support = new support();
		$scope.button = 'Send';
		$scope.saveSupport = saveSupport;
		$scope.isMessageSend = false;
		$scope.errorService  = errorService;

    	function saveSupport() {
    		if(!$scope.formSupport.$valid) return;
    		$scope.button = 'Sending...';

        	$scope.support.$save( function(data) {
	        	// success
	        	console.log(data);
	        	$scope.isMessageSend = true;
			},
			function(data) {
				// Error
				console.log('Error');
				$scope.button = 'Send';

			});
		}
	}
})();