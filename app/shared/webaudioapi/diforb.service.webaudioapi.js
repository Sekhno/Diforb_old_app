(function(){
	var services = angular.module( 'diforb.services' );

	services.factory( 'webAudioService', webAudioService );

	webAudioService.$inject = ['$resource', '$window','DiforbConstans', 'AuthService'];

	function webAudioService($resource, $window, DiforbConstans, AuthService)
	{
		//---- SET General Contex
		$window.AudioContext = ($window.AudioContext ||
			$window.webkitAudioContext ||
			$window.mozAudioContext ||
			$window.oAudioContext ||
			$window.msAudioContext);


		//---- SET General Contex
		$window.OfflineAudioContext = ($window.OfflineAudioContext ||
			$window.webkitOfflineAudioContext ||
			$window.mozOfflineAudioContext ||
			$window.oAOfflineAudioContext ||
			$window.msOfflineAudioContext);

		window.AudioContext || window.webkitAudioContext

		this.audioCtxt  = new AudioContext();
		this.library    = null;
		this.soundNamePrefix = "";
		this.setLibrary = setLibrary;
		this.addLeftSound   = addLeftSound;
		this.addRightSound   = addRightSound;
		this.setSoundNamePrefix = setSoundNamePrefix;

		//---- Init BASE parameters for Audio API
		WebApiBase.prototype.Context  = this.audioCtxt;
		WebApiBase.prototype.BasePath = "src/Sounds";
		WebApiBase.prototype.BaseFilePath = DiforbConstans.baseApiUrl + '/api/file/bufferbyid';

		//--- Create Buffer Loader
		WebApiBase.prototype.BufferLoader = new BufferLoader(this.audioCtxt, AuthService.authentication.token);

    	// Set Analizer
    	var locAnalyser = this.audioCtxt.createAnalyser();
    	locAnalyser.fftSize = 1024;
		locAnalyser.smoothingTimeConstant = 0.5;
    	WebApiBase.prototype.GeneralAnalyser = locAnalyser;

    	//Set JavascriptNode for picture the wave
    	var locJavaScriptNode = null;
    	if(!this.audioCtxt.createScriptProcessor){
       	locJavaScriptNode = this.audioCtxt.createJavaScriptNode(1024, 2, 2);
    	} else {
       	locJavaScriptNode = this.audioCtxt.createScriptProcessor(1024, 2, 2);
    	};
    	WebApiBase.prototype.WaveNode = locJavaScriptNode;
    	WebApiBase.prototype.IsRecording = false;


		// Saver.prototype.DownlodProgress = refreshDownlodProgressBar;

		//---- End of Init BASE parameters for Audio API

		function setLibrary(name)
		{
			//---- Set Library and it's sides
			this.library = new Library(name);
			//---- Set Visualazer for vawe
		}

		function addLeftSound(name)
		{
			this.library.LeftSide.AddSound(name);
		}

		function addRightSound(name)
		{
			this.library.RightSide.AddSound(name);
		}

		function setSoundNamePrefix(soumdNamePrefix)
		{
			this.soundNamePrefix = soumdNamePrefix;
		}


		//.library.SoundAnalizer.AddVisualizer(drawAudioWave);

		//--- Set Convolver base sounds
		Convolver.prototype.Buffers = {
			Stadium: new ConvolverBuffer(DiforbConstans.ConvolverBufferPath.stadium),
			Hall: new ConvolverBuffer(DiforbConstans.ConvolverBufferPath.hall),
			Room: new ConvolverBuffer(DiforbConstans.ConvolverBufferPath.room)
		};

	    	Convolver.prototype.FillBuffers = function()
		{
			var instance = this;

			instance.BufferLoader.loadBuffer(instance.Buffers.Stadium.Url, function(buffer) {
				instance.Buffers.Stadium.Buffer = buffer;
				instance.BufferLoader.loadBuffer(instance.Buffers.Hall.Url, function(buffer) {
					instance.Buffers.Hall.Buffer = buffer;
					instance.BufferLoader.loadBuffer(instance.Buffers.Room.Url, function(buffer) {
						instance.Buffers.Room.Buffer = buffer;

/*
					if(LIBRARY.LeftSide.Sounds.MainSound.Files &&
					   LIBRARY.LeftSide.Sounds.MainSound.Files.length > 0)
					{
						LIBRARY.LeftSide.Sounds.MainSound.Read();
					}
*/

					});
				});
			});
		};

		Convolver.prototype.FillBuffers();

		//--- End of Convolver base sounds

	    return this;
	};


	// Buffer Loader
	function BufferLoader(context, uToken) {
	  	this.context = context;
	  	this.loadCount = 0;

	  	this.Left = null;
	  	this.Right = null;

	  	this.reverSound = null;
	  	this.reverSounds = [];
	  	this.reverSounds["Hall"] = null;
	  	this.reverSounds["Noise"] = null;
	  	this.reverSounds["Glass_hit"] = null;
	  	this.userToken = uToken;

	  	this.Stack = [];

	  	instance = this;

	}

	BufferLoader.prototype.loadLeft = function(url, callBackFunc) {
	  	this.loadBuffer(url, callBackFunc);
	}

	BufferLoader.prototype.loadReverb = function(callBackFunc) {
	  	this.loadBuffer('src/sounds/reverb/irHall.ogg', this.reverSounds["Hall"],
	    	function(){this.loadBuffer('src/sounds/reverb/noise.ogg', this.reverSounds["Noise"],
	      function(){this.loadBuffer('src/sounds/reverb/glass-hit.ogg', this.reverSounds["Glass_hit"],
	      callBackFunc); this.reverSound = this.reverSounds["Hall"]});});
	}

	BufferLoader.prototype.loadOneReverb = function(url, callBackFunc) {
	  	this.loadBuffer(url, this.reverSound, callBackFunc);
	}

	BufferLoader.prototype.loadHallReverb = function(callBackFunc) {
	  	this.loadBuffer('src/sounds/reverb/irHall.ogg', this.reverSound, callBackFunc);
	}

	BufferLoader.prototype.loadRight = function(url, callBackFunc) {
	  	this.loadBuffer(url, this.Right, callBackFunc);
	}

	BufferLoader.prototype.loadBuffer = function(url, callBackFunc) {
		var userTokenLoc = "Bearer " + this.userToken;
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";
		this.onload = callBackFunc;
		request.setRequestHeader("Authorization", userTokenLoc);

		var loader = this;

		request.onload = function() {
			// Asynchronously decode the audio file data in request.response
			loader.context.decodeAudioData(
				request.response,
				function(buffer) {
					if (!buffer) {
						alert('error decoding file data: ' + url);
						return;
					}
					loader.onload(buffer);
				},
				function(error) {
					console.error('decodeAudioData error', error);
				}
	    		);
		}

		request.onerror = function() {
			//alert('BufferLoader: XHR error');
		}

	  	request.send();
	}


	//----- Refresh progress bar in the loading process -------

	// function refreshDownlodProgressBar(val, maxVal)
	// {
	// 	var saverProgress = $(".inner-progress-bar");
	// 	if(val == 0)
	// 	{
	// 		saverProgress.hide();
	// 		return;
	// 	}
	// 	var currValProc =  Math.round(val * 100 /  maxVal) - 5 + "%";
	// 	saverProgress.show();
	// 	saverProgress.width(currValProc);
	// }

	// draw Waudio wave
	// function drawAudioWave(channelData)
 //    	{
	// 	var x = 0;
	// 	var y = 102;

	// 	var waveEl = document.getElementById("wave"),
	// 		ctx     = waveEl.getContext('2d');
	// 		waveEl.height = 204;
	// 		waveEl.width  = 204;

	// 	// clear the current state
	// 	ctx.clearRect(0, 0, 204, 204);

	// 	for(var i = 0; i < 51; i++)
	// 	{
	// 		var z = Math.round(channelData.length / 68) * i;
	// 		var x1 = i * 4;
	// 		var y = Math.abs(channelData[z]) * 204;
	// 		var y1 = 102 - Math.abs(y / 2);

 //    			// set the fill style Gradient
	// 		var gradient = ctx.createLinearGradient(0, 0, 0, y);
	// 		gradient.addColorStop(0, '#ccf5fb');
	// 		gradient.addColorStop(0.45, '#FFFFFF');
	// 		gradient.addColorStop(0.55, '#FFFFFF');
	// 		gradient.addColorStop(1, '#ccf5fb');

	// 		ctx.fillStyle = gradient;
	// 		ctx.fillRect(x1, y1, 3, y);
	// 	}
	// }

})();





