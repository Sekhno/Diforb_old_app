function RecorderBase()
{
}

function Saver(uToken)
{
	this.IsPlaying  = false;
	this.SavedBlobs = [];
	this.CallBackAfterSave = null;
	this.Zipper = new Zipper();
	this.BlobForDownload = {
		fileName : "",
		blob : null
	};	
	this.prefixFileName = "";
	this.Recorder = null;
	this.CurrentFileNumber = null;
	this.LastFileNumber = null;
	this.library = null;
	this.showPercent = null;
	this.userToken = uToken;

	var saverInst = this;

	this.Render = function(prefixFileName, filesLength)
	{
		this.prefixFileName = prefixFileName;
		var testName = this.Name;

		this.SavedBlobs.splice(0, saverInst.SavedBlobs.length);
		this.CurrentFileNumber = 0;
		this.LastFileNumber = filesLength;
		if(saverInst.DownlodProgress)
		{
			saverInst.DownlodProgress(1, 10);
		}
		this.renderSound();
	}

	this.renderSound = function()
	{
		var nameFirstSound = this.library.LeftSide.Sounds[0];
		// var bufferLength = this.library.LeftSide.Sounds[nameFirstSound].Files[saverInst.CurrentFileNumber].buffer.length;

		saverInst.Recorder = new Recorder(saverInst.userToken);

		saverInst.Recorder.bufferSize.clearAll();
		this.library.LeftSide.Sounds[nameFirstSound].Files.forEach(function(currFile, i, arr) {	
			saverInst.Recorder.bufferSize.fullSize += currFile.buffer.length;
		})

		// Show percents on UI callback functions
		if(this.showPercent != null)
		{
			saverInst.Recorder.showPercent = this.showPercent;
		}

		RecConvolver.prototype.FillBuffers(saverInst.cloneSettingsFromPlayer, saverInst);
	}

	this.cloneSettingsFromPlayer = function()
	{
		// Left Side
		var loclibrary = this.library;

		if(!loclibrary.LeftSide.reseted)
		{
			loclibrary.LeftSide.Sounds.forEach(function(soundName, i, arr) {	
				if(!(soundName in saverInst.Recorder.LeftSide.Sounds))
				{
					saverInst.Recorder.LeftSide.AddSound(soundName);
				}
				saverInst.Recorder.LeftSide.Sounds[soundName].SetBuffer(loclibrary.LeftSide.Sounds[soundName].Files[saverInst.CurrentFileNumber].buffer);
				saverInst.Recorder.LeftSide.Sounds[soundName].IsMuted  = loclibrary.LeftSide.Sounds[soundName].IsMuted;
				saverInst.Recorder.LeftSide.Sounds[soundName].DelayVal = loclibrary.LeftSide.DelayVal;
			});

			// Set Convolver buffers
			saverInst.Recorder.LeftSide.Convolver.SetBuffer(loclibrary.LeftSide.Convolver.Instance.BufferName);
			saverInst.Recorder.LeftSide.Convolver.IsOn  = loclibrary.LeftSide.Convolver.IsOn;		
			saverInst.Recorder.LeftSide.SetConvolver();
			saverInst.Recorder.LeftSide.Convolver.Volume  = loclibrary.LeftSide.Convolver.Volume;

			// Set sound parameters
			saverInst.Recorder.LeftSide.SetVolume(loclibrary.LeftSide.Volume);
			saverInst.Recorder.LeftSide.SetPitch(loclibrary.LeftSide.PitchValue);
			saverInst.Recorder.LeftSide.SetCrossFade(loclibrary.CrossFadeValue);	
		}

		// Right side

		if(!loclibrary.RightSide.reseted)
		{
			loclibrary.RightSide.Sounds.forEach(function(soundName, i, arr) {
				if(!(soundName in saverInst.Recorder.RightSide.Sounds))
				{
					saverInst.Recorder.RightSide.AddSound(soundName);
				}
				if(loclibrary.RightSide.Sounds[soundName].Files &&
				   loclibrary.RightSide.Sounds[soundName].Files.length > 0)
				{
					saverInst.Recorder.RightSide.Sounds[soundName].SetBuffer(loclibrary.RightSide.Sounds[soundName].Files[saverInst.CurrentFileNumber].buffer);
					saverInst.Recorder.RightSide.Sounds[soundName].IsMuted = loclibrary.RightSide.Sounds[soundName].IsMuted;
					saverInst.Recorder.RightSide.Sounds[soundName].DelayVal = loclibrary.RightSide.DelayVal;				
				}
			});

			// Set Convolver buffers
			saverInst.Recorder.RightSide.Convolver.SetBuffer(loclibrary.RightSide.Convolver.Instance.BufferName);
			saverInst.Recorder.RightSide.Convolver.IsOn  = loclibrary.RightSide.Convolver.IsOn;	
			saverInst.Recorder.RightSide.SetConvolver();
			saverInst.Recorder.RightSide.Convolver.Volume = loclibrary.RightSide.Convolver.Volume;

			// Set sound parameters
			saverInst.Recorder.RightSide.SetVolume(loclibrary.RightSide.Volume);
			saverInst.Recorder.RightSide.SetPitch(loclibrary.RightSide.PitchValue);
			saverInst.Recorder.RightSide.SetCrossFade(loclibrary.CrossFadeValue);			
		}
		

		saverInst.Recorder.CallBackFuction = saverInst.AddBlob;

		saverInst.Recorder.Record();		
	}

	this.AddBlob = function(blob)
	{
		var fileNumber = saverInst.CurrentFileNumber + 1;
		blob.name = saverInst.prefixFileName + "_" + fileNumber + ".wav";
		saverInst.SavedBlobs.push(blob);
		if(saverInst.DownlodProgress)
		{
			saverInst.DownlodProgress(saverInst.CurrentFileNumber + 1, saverInst.LastFileNumber);
		}
		saverInst.Recorder = null;
		if(saverInst.CurrentFileNumber < saverInst.LastFileNumber - 1)
		{
			saverInst.CurrentFileNumber++;
			saverInst.renderSound();
		} else {
			saverInst.Save();
		}
		if(saverInst.showPercent != null)
		{
			saverInst.showPercent(0);
		}
	}
	
	this.Save = function()
	{
		if(saverInst.DownlodProgress)
		{
			saverInst.DownlodProgress(0, 0);
		}
		if(saverInst.LastFileNumber > 1)
		{
			saverInst.Zip();
		} else
		{
			saverInst.BlobForDownload.fileName = this.prefixFileName + ".wav";
			saverInst.BlobForDownload.blob = saverInst.SavedBlobs[0];
			saverInst.SaveFile();
		}
	}

	this.SaveFile = function()
	{
	    saveAs(saverInst.BlobForDownload.blob,
	           saverInst.BlobForDownload.fileName);
	    if(saverInst.CallBackAfterSave)
	    {
			saverInst.CallBackAfterSave();
	    }
	}

	this.Zip = function()
	{
		saverInst.Zipper.clear();
		saverInst.Zipper.setCreationMethod("Blob");
		saverInst.Zipper.addFiles(this.SavedBlobs, function() {}, function() {}, function() {}, function() {
			saverInst.Zipper.getBlob(function(blob) {
				saverInst.BlobForDownload.fileName = saverInst.prefixFileName + ".zip";
				saverInst.BlobForDownload.blob = blob;				
				saverInst.SaveFile();
			});
		});	
	}
}

function Recorder(userToken)
{
    RecorderBase.prototype.Context = new OfflineAudioContext(2, 44100*40, 44100);
	RecConvolver.prototype.Context = RecorderBase.prototype.Context;
    RecConvolver.prototype.BufferLoader = new BufferLoader(RecConvolver.prototype.Context, userToken);
    this.showPercent = null;

	this.bufferSize = {
		fullSize: 0,
		currentSize: 0,
		getPercents: function()
		{
			if(this.fullSize == 0)
			{
				return 0;
			}
			return this.currentSize * 100  / this.fullSize;
		},
		clearAll: function()
		{
	 		this.currentSize = 0;
	 		this.fullSize = 0;
		}
	};    

	this.GainNode = this.Context.createGain();
	this.LeftSide  = new RecSide(this.GainNode);
	this.RightSide = new RecSide(this.GainNode);

	this.Compressor = new RecCompressor();

	this.GainNode.connect(this.Context.destination);
	// this.Compressor.Instance.connect(this.Context.destination);

	this.CrossFadeValue = 1;
	this.SoundTransformer = new SoundTransformer();
	this.WavExporter = new WavExporter(this.Context.sampleRate);
	this.CallBackFuction = null;

	var recorderInst = this;		

	this.PlayOnce = function()
	{
		recorderInst.LeftSide.Play();
		recorderInst.RightSide.Play();
	}

	this.Record = function()
	{
		recorderInst.visualizers = [];
		recorderInst.GainNode.connect(recorderInst.Context.destination);

		// recorderInst.Analyser = recorderInst.Context.createAnalyser();
		// recorderInst.Analyser.fftSize = 1024;
	 //    recorderInst.Analyser.smoothingTimeConstant = 0.5;
	 //    recorderInst.ScriptProcessor = null;
	    
	 //    if(!recorderInst.Context.createScriptProcessor){
	 //       recorderInst.ScriptProcessor = recorderInst.Context.createJavaScriptNode(1024, 2, 2);
	 //    } else {
	 //       recorderInst.ScriptProcessor = recorderInst.Context.createScriptProcessor(1024, 2, 2);
	 //    }

	 //    recorderInst.GainNode.connect(recorderInst.Analyser);
	 //    recorderInst.Analyser.connect(recorderInst.ScriptProcessor);
	 //    recorderInst.ScriptProcessor.connect(recorderInst.Context.destination);
	 //	   recorderInst.ScriptProcessor.onaudioprocess = onAudioProcess;

		recorderInst.PlayOnce();
		recorderInst.Context.oncomplete = afterRendering;
		recorderInst.Context.startRendering();		

		function afterRendering(e) {
			var renderedBuffer = e.renderedBuffer;
			var buffer = [
		        recorderInst.cutZeros(renderedBuffer.getChannelData(0)),
		        recorderInst.cutZeros(renderedBuffer.getChannelData(1))
	        ];
			var buffers = recorderInst.SoundTransformer.TransformBuffer(buffer);
			var blob = recorderInst.WavExporter.Export(buffers);

			if(recorderInst.CallBackFuction)
			{
				recorderInst.CallBackFuction(blob);
			}
		}

	    function onAudioProcess(e) {
	    	recorderInst.bufferSize.currentSize += e.inputBuffer.length;
	    	if(recorderInst.showPercent != null)
	    	{
	    		recorderInst.showPercent(recorderInst.bufferSize.getPercents());
	    	}
	    }

	}

	this.cutZeros = function(channeArr)
	{
		//var minVol = 0.002;
		var minVol = 0.0007;
		var countOfElements = 0;
		var delta = 44100;

		var firstElement = 0;
		var lastElement  = firstElement + delta;

		while(lastElement < channeArr.length - 2)
		{
			var found = false;
			for (var i = firstElement; i < lastElement; i++) {
				if(Math.abs(channeArr[i]) > minVol)
				{
					found = true;
					break;
				}
			}
			countOfElements = lastElement;			
			if(found)
			{
				firstElement = lastElement + 1;
				lastElement  = firstElement + delta;
				if(lastElement > channeArr.length - 1)
				{
					lastElement = channeArr.length - 1;
				}
			} else
			{
				lastElement  = channeArr.length;
			}
		}

		var result = new Float32Array(countOfElements);
		for (var i = 0; i < countOfElements; i++) {
			result[i] = channeArr[i];
		}
		return result;
	}

	this.SetCrossfade = function(val)
	{
		this.CrossFadeValue = val;
		this.LeftSide.SetCrossFade(Math.cos(this.CrossFadeValue * 0.5 * Math.PI));
		this.RightSide.SetCrossFade(Math.cos((1.0 - this.CrossFadeValue) * 0.5 * Math.PI));
	}	

}



function RecSide(recGaineNode)
{
	this.CrossFadeValue = 1;
	this.PitchValue = 1.0;
	this.RecGainNode = recGaineNode;
	this.GainNode = this.Context.createGain();
	this.Convolver = new RecConvolver();
	this.Sounds = [];

	this.GainNode.connect(this.RecGainNode);

	this.AddSound = function(name)
	{
		this.Sounds.push(name);
		this.Sounds[name] = new RecSound(this.GainNode, this.RecGainNode);
	}

	this.Play = function()
	{
		var thisSide = this;
		this.Sounds.forEach(function(soundName, i, arr) {
			arr[soundName].Play();
		});
	}

	this.SetPitch = function(val)
	{
		this.PitchValue = val;
		this.Sounds.forEach(function(soundName, i, arr) {
			arr[soundName].SetPitch(val);
		});		
	}

	this.SetVolume = function(val)
	{
		this.Volume = val;
		this.UpdateVolume();
	}

	this.UpdateVolume = function()
	{
		var soundVolume = this.ApplyCrossfade(this.Volume);
		this.Sounds.forEach(function(soundName, i, arr) {
			arr[soundName].SetVolume(soundVolume);
		});
	}

	this.ApplyCrossfade = function(val)
	{
		return val * this.CrossFadeValue;
	}

	this.SetCrossFade = function(val)
	{
		this.CrossFadeValue = val;
		this.UpdateVolume();
	}

	this.SetConvolver = function()
	{
		var locConvolver = this.Convolver;
		if(locConvolver &&
		   locConvolver.IsOn &&			
		   locConvolver.Instance &&
		   locConvolver.Instance.buffer)
		{
			this.GainNode.connect(locConvolver.Instance);
			locConvolver.GainNode.connect(this.RecGainNode);
		} else
		{
			if(locConvolver && 
			   locConvolver.Instance)
			{
				locConvolver.GainNode.disconnect();
			}
		}
	}
}


function RecSound(sideGainNode)
{
	this.Source = this.Context.createBufferSource();
	this.GainNode = this.Context.createGain();
	this.SideGainNode = sideGainNode;
	this.NowPlaingFile = null;
	this.PlaybackRate = 1;
	this.IsMuted = false;
	this.IsPlaying = false;
	this.Volume = 1;
	this.CrossFadeValue = 1;	
	this.DelayVal = 0.001;

	this.GainNode.connect(this.SideGainNode);

	this.Read = function(buffer)
	{
		if(this.CurrenReadingSound != null && 
		   this.CurrenReadingSound >= this.Files.length - 1)
		{
			return;
		}
		this.CurrenReadingSound = this.CurrenReadingSound == null ? 0 : 
								  this.CurrenReadingSound + 1;
		var url = this.BasePath + "/" + this.Files[this.CurrenReadingSound].FileName;

		var currentSoundInst = this;

		currentSoundInst.BufferLoader.loadBuffer(url, function(buffer) {
			var currFile = currentSoundInst.Files[currentSoundInst.CurrenReadingSound];
			currFile.buffer = buffer;
			currentSoundInst.Read();
		});
	}	

	this.SetBuffer = function(buffer)
	{
		if(!this.Source)
		{
			return;
		}
		this.Source.buffer = buffer;
	}	

	this.PrepareForPlaying = function()
	{
		if(this.Source)
		{
			this.Source.disconnect();
		}
		this.Source.loop = false;
		this.Source.playbackRate.value = this.PlaybackRate;

	    this.Delay = this.Context.createDelay();
	    this.Delay.delayTime.value  = this.DelayVal;

		this.Source.connect(this.Delay);	
		this.Delay.connect(this.GainNode);


		//this.Source.connect(this.GainNode);

		// Connect to Sound Gain Node
		this.GainNode.gain.value = this.IsMuted ? 0 : this.Volume;
	}

	this.Play = function()
	{
		this.PrepareForPlaying();
		if(!this.Source ||
		   !this.Source.buffer)
		{
			return;
		}
		// Play sound
		if(!this.Source.start) {
		    this.IsPlaying = true;
		    this.Source.noteOn(0);
		} else
		{
		    this.IsPlaying = true;
			this.Source.start(0);
		}		
	}

	this.SetPitch = function(val)
	{
		this.PlaybackRate = val;
	}

	this.SetVolume = function(val)
	{
		this.Volume = val;
	}
}

//------ Convolver Class

function RecConvolver()
{
	this.Source  = null;
	this.Volume  = 1.0;
	this.IsMuted = false;
	this.GainNode = null;
	this.IsOn     = false;
    this.BufferName = "";
	this.Instance = null;

	//Init 
    this.Instance = this.Context.createConvolver();
    this.GainNode = this.Context.createGain();
	this.Instance.connect(this.GainNode);

	this.SetBuffer = function(bufferName)
	{
		if(bufferName == null ||
		    bufferName === "" ||
		   !this.Instance)
		{
			this.Instance.buffer = null;
			this.IsOn = false;
			return;
		}		

		this.Instance.BufferName = bufferName;
		this.IsOn = true;
		this.Instance.buffer = this.Buffers[bufferName].Buffer;
	}

	this.SetMute = function(val)
	{
		this.muted = val;
		this.setGainVolume();		
	}

	this.SetVolume = function(val)
	{
		this.Volume = val;
		this.setGainVolume();
	}

	this.setGainVolume = function()
	{
		if(this.GainNode)
		{
			this.GainNode.gain.value = this.muted ? 0 : this.Volume;
		}
	}	
}

function RecCompressor()
{
	this.compressor = this.Context.createDynamicsCompressor();
	this.compressor.threshold.value = -1.4;
	this.compressor.knee.value = 12;
	this.compressor.ratio.value = 1;
	this.compressor.reduction.value = 0;
	this.compressor.attack.value = 0.03;
	this.compressor.release.value = 15.5;

	this.Instance = this.compressor;
}


RecConvolverBuffer = function(url)
{
	this.Url = url;
	this.Buffer = null;
}

//------ End of  Convolver Class


function SoundTransformer()
{
	this.inst = this;
	this.TransformBuffer = function(buffer)
	{
		var transformedBuffer = {
			recBuffers : [],
			recLength : 0
		};

		for (var channel = 0; channel < buffer.length; channel++){
			transformedBuffer.recBuffers[channel] = [];
		}
		for (var channel = 0; channel < buffer.length; channel++){
			transformedBuffer.recBuffers[channel].push(buffer[channel]);
		}
		for(var i = 0; i < buffer.length; i++)
		{
			transformedBuffer.recLength = buffer[i].length > transformedBuffer.recLength ? 
											buffer[i].length : 
											transformedBuffer.recLength;
		}
		var buffers = [];
		for (var channel = 0; channel < buffer.length; channel++){
			buffers.push(this.inst.mergeBuffers(transformedBuffer.recBuffers[channel], transformedBuffer.recLength));
		}

		return buffers;
	}

	this.mergeBuffers = function(recBuffers, recLength){
		var result = new Float32Array(recLength);
		var offset = 0;
		for (var i = 0; i < recBuffers.length; i++){
			result.set(recBuffers[i], offset);
			offset += recBuffers[i].length;
		}
		return result;
	}	
}

function WavExporter(sampleRate)
{
	var inst = this;
	this.numChannels = 0;
	this.sampleRate = sampleRate;	

	this.Export = function(buffers)
	{
		if (buffers.length === 2){
		  var interleaved = inst.interleave(buffers[0], buffers[1]);
		} else {
		  var interleaved = buffers[0];
		}
		var dataview = inst.encodeWAV(interleaved, buffers.length);
		// var audioBlob = new Blob([dataview], { type: "audio/wav" });
		var audioBlob = new Blob([dataview], { type: "application/octet-stream" });

		var _URL = window.URL || window.webkitURL;
		var blobUrl = _URL.createObjectURL(audioBlob);

		console.log(blobUrl);
		console.log(audioBlob.size);

		return audioBlob;
	}

	this.interleave = function(inputL, inputR){
		var length = inputL.length + inputR.length;
		var result = new Float32Array(length);
		var index = 0;
		var inputIndex = 0;

		while (index < length){
			result[index++] = inputL[inputIndex];
			result[index++] = inputR[inputIndex];
			inputIndex++;
		}

		return result;
	}

	this.floatTo16BitPCM = function(output, offset, input) {
		for (var i = 0; i < input.length; i++, offset+=2) {
			var s = Math.max(-1, Math.min(1, input[i]));
			output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
		}
	}

	this.writeString = function(view, offset, string){
		for (var i = 0; i < string.length; i++){
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}

	this.encodeWAV = function (samples, numChannels){
		var numChannels = numChannels;
		var buffer = new ArrayBuffer(44 + samples.length * 2);
		var view = new DataView(buffer);

		/* RIFF identifier */
		this.writeString(view, 0, 'RIFF');
		/* RIFF chunk length */
		view.setUint32(4, 36 + samples.length * 2, true);
		/* RIFF type */
		this.writeString(view, 8, 'WAVE');
		/* format chunk identifier */
		this.writeString(view, 12, 'fmt ');
		/* format chunk length */
		view.setUint32(16, 16, true);
		/* sample format (raw) */
		view.setUint16(20, 1, true);
		/* channel count */
		view.setUint16(22, numChannels, true);
		/* sample rate */
		view.setUint32(24, this.sampleRate, true);
		/* byte rate (sample rate * block align) */
		view.setUint32(28, this.sampleRate * 4, true);
		/* block align (channel count * bytes per sample) */
		view.setUint16(32, numChannels * 2, true);
		/* bits per sample */
		view.setUint16(34, 16, true);
		/* data chunk identifier */
		this.writeString(view, 36, 'data');
		/* data chunk length */
		view.setUint32(40, samples.length * 2, true);

		this.floatTo16BitPCM(view, 44, samples);

		return view;
	}
}

//---------------- Zipper ------------------

function Zipper()
{
	this.zipFileEntry = null;
	this.zipWriter = null;
	this.writer  = null;
	this.creationMethod  = null; 
	this.URL =  window.mozURL || window.URL;
	this.files = null;
	this.addIndex = 0;

	this.onInit = null;
	this.onAdd = null;	
	this.onProgress = null;	
	this.onEnd = null;	

	var zipperInst = this;

	this.clear = function()
	{
		zipperInst.zipFileEntry = null;
		zipperInst.zipWriter = null;
		zipperInst.writer = null;
		zipperInst.creationMethod = null;
		zipperInst.URL = window.mozURL || window.URL;
	};

	this.setCreationMethod = function(method) {
		zipperInst.creationMethod = method;
	};

	this.addFiles = function(files, oninit, onadd, onprogress, onend) {
		this.addIndex = 0;
		this.files = files;

		this.onInit = oninit;
		this.onAdd = onadd;	
		this.onProgress = onprogress;	
		this.onEnd = onend;			

		if (zipperInst.zipWriter)
			zipperInst.nextFile();
		else if (zipperInst.creationMethod == "Blob") {
			zipperInst.writer = new zip.BlobWriter();
			zipperInst.createZipWriter();
		} else {
			createTempFile(function(fileEntry) {
				zipperInst.zipFileEntry = fileEntry;
				zipperInst.writer = new zip.FileWriter(zipperInst.zipFileEntry);
				zipperInst.createZipWriter();
			});
		}
	};

	this.createZipWriter = function() {
		zip.createWriter(zipperInst.writer, function(writer) {
			zipperInst.zipWriter = writer;
			zipperInst.onInit();
			zipperInst.nextFile();
		}, zipperInst.onError);
	};

	this.nextFile = function() {
		var file = zipperInst.files[zipperInst.addIndex];
		zipperInst.zipWriter.add(file.name, new zip.BlobReader(file), 
			function() {
				zipperInst.addIndex++;
				if (zipperInst.addIndex < zipperInst.files.length)
					zipperInst.nextFile();
				else
					zipperInst.onEnd();
			}, onprogress);
	};

	this.getBlobURL = function(callback) {
		zipperInst.zipWriter.close(function(blob) {
			var blobURL = zipperInst.creationMethod == "Blob" ? zipperInst.URL.createObjectURL(blob) : 
																zipperInst.zipFileEntry.toURL();
			callback(blobURL);
			zipperInst.zipWriter = null;
		});
	};

	this.getBlob = function(callback) {
		zipperInst.zipWriter.close(callback);
	}

	this.onError = function(message)
	{
		console.log(message);
	}
}


Recorder.prototype = new RecorderBase(); 
RecSide.prototype = new RecorderBase();
RecSound.prototype = new RecorderBase();
RecConvolver.prototype = new RecorderBase();
RecCompressor.prototype = new RecorderBase();