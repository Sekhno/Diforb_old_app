(function(){
	var services = angular.module( 'diforb.services' );

	services.factory( 'payPalPdt', payPalPdt );
	payPalPdt.$inject = ['$resource', 'DiforbConstans'];

	function payPalPdt ( $resource, DiforbConstans )
	{
		var url = DiforbConstans.baseApiUrl + '/api/paypalpdt';
	    return $resource(url, {}, {
	        update: {
	            method: 'PUT'
	        }
	    });

	};

})();