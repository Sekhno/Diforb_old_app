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

BufferLoader.prototype.loadBuffer = function(url ,callBackFunc) {
	// Load buffer asynchronously
	var userTokenLoc = "Bearer " + this.userToken;
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";
	request.setRequestHeader("Authorization", userTokenLoc);
	this.onload = callBackFunc;

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
		alert('BufferLoader: XHR error');
	}

	request.send();
}