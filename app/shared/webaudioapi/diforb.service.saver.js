(function(){
	var services = angular.module( 'diforb.services' );

	services.factory( 'saverService', saverService );
	saverService.$inject = ['$resource', '$window', 'DiforbConstans', 'webAudioService', 'AuthService'];

	function saverService($resource, $window, DiforbConstans, webAudioService, AuthService)
	{
	    RecorderBase.prototype.IsRecording  = false;	
	    RecorderBase.prototype.WorkerPath   = "js/recorderjs/recorderWorker.js";
	    RecorderBase.prototype.CurrentFileNumber = 0;		

		//--- Set Rec Convolver base sounds
		RecConvolver.prototype.Buffers = {
			Stadium: new ConvolverBuffer(DiforbConstans.ConvolverBufferPath.stadium),
			Hall:    new ConvolverBuffer(DiforbConstans.ConvolverBufferPath.hall),
			Room:    new ConvolverBuffer(DiforbConstans.ConvolverBufferPath.room)
		};

	    RecConvolver.prototype.FillBuffers = function(callbackFunction, saver)
		{
			var instance = this;
			instance.BufferLoader.loadBuffer(instance.Buffers.Stadium.Url, function(buffer) {
				instance.Buffers.Stadium.Buffer = buffer;
				instance.BufferLoader.loadBuffer(instance.Buffers.Hall.Url, function(buffer) {
					instance.Buffers.Hall.Buffer = buffer;
					instance.BufferLoader.loadBuffer(instance.Buffers.Room.Url, function(buffer) {
						instance.Buffers.Room.Buffer = buffer;
						callbackFunction.call(saver);
					});
				});
			});
		};
		//--- End of Convolver base sounds

		this.saver = new Saver(AuthService.authentication.token);
		this.library = null;
		this.save  = save;

		function save()
		{
			var library = webAudioService.library;
			this.saver.library = library;

			var filePrefName = library.Name + "_" + webAudioService.soundNamePrefix;
			var firstKey = library.LeftSide.Sounds[0];
			var filesLength = library.LeftSide.Sounds[firstKey].Files.length;

			this.saver.Render(filePrefName, filesLength);
		}

		return this;
	}
})()