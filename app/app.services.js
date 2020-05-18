(function(){
	var services = angular.module('diforb.services', []);

	services.constant('DiforbConstans', new diforbConstans());
	function diforbConstans()
	{
		// Master
		this.baseApiUrl = 'http://diforbapi.azurewebsites.net';
		// Prod
		// this.baseApiUrl = 'http://diforbapiprod.azurewebsites.net';
		// Dev
		//this.baseApiUrl = 'http://diforbapidev.azurewebsites.net';
		// Localhost
		//this.baseApiUrl = 'http://localhost:50881';
	  	this.convolverSoundsBasePath = "src/sounds/reverb/";
	  	this.clientId = 'diforbApp';

	  	this.ConvolverBufferPath = {
			stadium: this.convolverSoundsBasePath + "rever_room.wav",
	  		// stadium: this.convolverSoundsBasePath + "rever_stadium.wav",
	  		hall: this.convolverSoundsBasePath + "rever_hall.wav",
	  		room: this.convolverSoundsBasePath + "rever_room.wav"
	  	};
	};

	services.factory('preloaderService', preloaderService);
	preloaderService.$inject = ['$timeout'];
	function preloaderService($timeout)
	{
		var loader;
		this.on = _on;
		this.off = _off;

		return this;

		function _on(object)
		{
			loader = new SVGLoader(document.getElementById('loader'), object);

			loader.show();
			loader.options = {speedIn: 1000, speedOut: 1000};
		}
		function _off(time)
		{
			$timeout( function() {
				loader.hide();
			}, time);

		}
	}

	services.factory('faqService',faqService);
	faqService.$inject = ['$resource'];
	function faqService($resource){
		var url = 'app/components/home/faq.json';
		return $resource(url, {});
	};

})();