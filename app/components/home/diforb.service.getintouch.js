(function(){
	var services = angular.module('diforb.services');

	services.factory('getintouchService', getintouchService);

	getintouchService.$inject = ['$resource', 'DiforbConstans'];

	function getintouchService($resource, DiforbConstans)
	{
	    return $resource(DiforbConstans.baseApiUrl + '/api/getintouch/:id', { id:'@id' }, { })
	}

})();