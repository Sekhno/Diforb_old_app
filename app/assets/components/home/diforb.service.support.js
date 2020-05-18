(function(){
	var services = angular.module('diforb.services');

	services.factory('supportService', supportService);

	supportService.$inject = ['$resource', 'DiforbConstans'];

	function supportService($resource, DiforbConstans)
	{
	    return $resource(DiforbConstans.baseApiUrl + '/api/support/:id', { id:'@id' }, { })
	}

})();