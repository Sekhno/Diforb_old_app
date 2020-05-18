function WebApiBase()
{
	this.Volume = 1;
}

function Library(name)
{
	this.Name = name;
	this.soundNamePrefix = "";
	this.TimePeriodPlaying = 1000;
	this.IsPlaying  = false;
	this.intervalId = null;
	this.IsSaving   = false;

	this.GainNode = this.Context.createGain();
	this.LeftSide  = new Side(this.GainNode);
	this.RightSide = new Side(this.GainNode);

	this.Compressor = new Compressor();
	this.GainNode.connect(this.Compressor.Instance);
	this.Compressor.Instance.connect(this.Context.destination);

	this.CrossFadeValue = 1;
	this.RenderedBuffer = null;

	// Connect SoundAnalizer
	this.SoundAnalizer = new SoundAnalizer();
	this.GainNode.connect(this.SoundAnalizer.Analyser);

	var libraryInst = this;


	WebApiBase.prototype.EndOfPlayingCallBack = function()
	{
		setTimeout(libraryInst.PlayOnce, 700);
	}

	WebApiBase.prototype.Playing = {
		SoundsCount: 0,
		Stoped: 0
	}


	this.Play = function()
	{
		//libraryInst.GainNode.disconnect();
		libraryInst.IsPlaying = true;
		libraryInst.PlayOnce();
		// libraryInst.intervalId = setInterval(libraryInst.PlayOnce, libraryInst.TimePeriodPlaying);
	}

	this.Stop = function()
	{
		if(this.IsPlaying)
		{
			this.LeftSide.Stop();
			this.RightSide.Stop();
			if(libraryInst.intervalId)
			{
				clearInterval(this.intervalId);
			}
		}
		this.IsPlaying = false;
	}

	this.PlayOnce = function()
	{
		if(!libraryInst.IsPlaying) {
			return;
		}

		libraryInst.Playing.SoundsCount = 0;
		libraryInst.Playing.Stoped = 0;

		libraryInst.LeftSide.Play();
		libraryInst.RightSide.Play();
	}

	// this.Save = function(leftSoundNamePrefix)
	// {
	// 	var filePrefName = libraryInst.Name + "_" + this.soundNamePrefix;
	// 	var firstKey = Object.keys(libraryInst.LeftSide.Sounds)[0];
	// 	var filesLength = libraryInst.LeftSide.Sounds[firstKey].length;
	// 	this.Saver.Render(filePrefName, filesLength);
	// }

	this.SaveOnce = function()
	{
		var recorder = libraryInst.Recorder;
		if(libraryInst.IsPlaying &&
		   libraryInst.IsRecording)
		{
			recorder.StartRecording();
			libraryInst.PlayOnce();
		} else
		{
			// zip blobs
			if(recorder.SoundBlobs)
				var fileForDownload = null;
				if(recorder.SoundBlobs.length > 1)
				{
					fileForDownload = libraryInst.Zip(recorder.SoundBlobs);
				} else {
					fileForDownload = recorder.SoundBlobs[0];
				}
		}
	}

	this.Zip = function()
	{

	}

	this.SetCrossfade = function(val)
	{
		this.CrossFadeValue = val;

		if(val > 0 && val <= 0.5)
		{
			this.LeftSide.DelayVal = (0.5 - val) / 0.1 * 0.14 + 0.001;
			this.RightSide.DelayVal = 0.001;
			console.log(val)
			console.log(this.LeftSide.DelayVal)
		} else
		{
			this.LeftSide.DelayVal = 0.01;
			this.RightSide.DelayVal = (val - 0.5) / 0.1 * 0.14 + 0.001;
		    	console.log(val)
		    	console.log(this.RightSide.DelayVal)
		}

		/*
		this.LeftSide.SetCrossFade(Math.cos(this.CrossFadeValue * 0.5 * Math.PI));
		this.RightSide.SetCrossFade(Math.cos((1.0 - this.CrossFadeValue) * 0.5 * Math.PI));
		*/
	}
}

function Side(libGainNode)
{
	this.CrossFadeValue = 1;
	this.DelayVal = 0.1;
	this.PitchValue = 1.0;
	this.IsMuted = false;
	this.LibGainNode = libGainNode;
	this.GainNode = this.Context.createGain();
	this.Convolver = new Convolver();
	this.Sounds = [];
	this.GainNode.connect(libGainNode);
	this.reseted = false;

	this.AddSound = function(name)
	{
		this.Sounds.push(name);
		this.Sounds[name] = new Sound(this.GainNode, this.LibGainNode);
	}

	this.ResetSounds = function(name)
	{
		this.reseted = !this.reseted;
		if((!this.Sounds || this.Sounds.length <= 0) ||
			!this.reseted)
		{
			return;
		}

		this.Stop();
		this.Sounds.forEach(function(soundName, i, arr) {
			arr[soundName].ResetFiles();
		});
	}

	this.Play = function()
	{
		if(this.reseted)
		{
			return;
		}

		var thisSide = this;
		this.Sounds.forEach(function(soundName, i, arr) {
			arr[soundName].DelayVal = thisSide.DelayVal;
			arr[soundName].Play();
		});
	}

	this.Stop = function()
	{
		var thisSide = this;
		this.Sounds.forEach(function(soundName, i, arr) {
			arr[soundName].Stop();
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
		this.GainNode.gain.value = this.Volume; 

		return; 

		var soundVolume = this.ApplyCrossfade(this.Volume);

		this.Sounds.forEach( function(soundName, i, arr) {
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

	this.SetConvolver = function(name)
	{
		this.Convolver.SetBuffer(name);
		if(this.Convolver &&
		   this.Convolver.IsOn &&
		   this.Convolver.Instance &&
		   this.Convolver.Instance.buffer)
		{
			this.GainNode.connect(this.Convolver.Instance);
			this.Convolver.GainNode.connect(this.LibGainNode);
		} else
		{
			if(this.Convolver &&
			   this.Convolver.Instance)
			{
				this.Convolver.GainNode.disconnect();
			}
		}
	}
}

function Sound(sideGainNode)
{
	this.Name = "";
	this.Files = [];
	this.DelayVal = 0.001;
	this.SoundImg = new Image();
	this.SurfaceImg = new Image();
	this.CurrenReadingSound = null;
	this.Path = "";
	this.Source = null;
	this.GainNode = this.Context.createGain();
	this.SideGainNode = sideGainNode;
	this.NowPlaingFile = null;
	this.PlaybackRate = 1;
	this.IsMuted = false;
	this.IsPlaying = false;
	this.IsReading = false;
	this.Volume = 1;
	this.CrossFadeValue = 1;

	this.GainNode.connect(this.SideGainNode);
	var SoundInst = this;

	this.Read = function()
	{
		if(this.CurrenReadingSound != null &&
		   this.CurrenReadingSound >= this.Files.length - 1)
		{
			SoundInst.IsReading = false;
			if(SoundInst.IsPlaying)
			{
				this.Stop();
				this.Play();
			}
			return;
		}
		this.CurrenReadingSound = this.CurrenReadingSound == null ? 0 :
								  this.CurrenReadingSound + 1;
		var url = this.BaseFilePath + "/" + this.Files[this.CurrenReadingSound].id;

		var currentSoundInst = this;

		SoundInst.IsReading = true;

		currentSoundInst.BufferLoader.loadBuffer(url, function(buffer) {
			window.activeSpinnerSound();
			var currFile = currentSoundInst.Files[currentSoundInst.CurrenReadingSound];
			currFile.buffer = buffer;
			window.activeDurationSound = function(){
				return buffer["duration"];
			}
			currentSoundInst.Read();
		});
	}

	this.AddFiles = function(path, files)
	{
		this.Path = path;
		this.CurrenReadingSound = null;
		this.Files = files;
	}

	this.ResetFiles = function()
	{
		if(!this.Files || this.Files.length <= 0)
		{
			return;
		}
		//this.Files.splice(0, this.Files.length);
		this.Source = null;
	}

	this.PrepareForPlaying = function()
	{
		// Check for existing files
		if(!this.Files ||
			this.Files.length <= 0)
		{
			return;
		}

		if(this.NowPlaingFile == null ||
		   this.NowPlaingFile >= this.Files.length - 1)
		{
			this.NowPlaingFile = 0
		} else
		{
			this.NowPlaingFile++;
		}
		if(!this.Files[this.NowPlaingFile].buffer)
		{
			return;
		}
		// Set the buffer source
		if(this.Source)
		{
			this.Source.disconnect();
		}
		this.Source = this.Context.createBufferSource();
		this.Source.loop = false;
		this.Source.buffer = this.Files[this.NowPlaingFile].buffer;
		this.Source.playbackRate.value = this.PlaybackRate;

	    	this.Delay = this.Context.createDelay();
	    	this.Delay.delayTime.value  = this.DelayVal;

		this.Source.connect(this.Delay);
		this.Delay.connect(this.GainNode);

		// Connect to Sound Gain Node
		this.GainNode.gain.value = this.IsMuted? 0 : this.Volume;
		this.Source.onended = function(){
			SoundInst.Playing.Stoped++;
			SoundInst.IsPlaying = false;
			if(SoundInst.Playing.Stoped >= SoundInst.Playing.SoundsCount)
			{
				SoundInst.EndOfPlayingCallBack();
			}
		};
	}

	this.Play = function()
	{
		if(SoundInst.IsReading)
		{
			this.IsPlaying = true;
			return;
		}
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
	    this.Playing.SoundsCount++;
	}

	this.Stop = function()
	{
		if(!this.Source)
		{
			return;
		}
		if (!this.Source.stop)
		{
			this.Source.noteOff(0);
		} else
		{
			this.Source.stop(0);
		}
		SoundInst.Playing.Stoped++;
	}

	this.SetPitch = function(val)
	{
		this.Source.playbackRate.value = val;
		this.PlaybackRate = val;
	}

	this.SetVolume = function(val)
	{
		this.GainNode.gain.value = val;
		//this.Volume = val;
	}

	this.Mute = function()
	{
		this.IsMuted = !this.IsMuted;
		this.ApplyMute();
	}

	this.ApplyMute = function()
	{
		if(this.IsMuted)
		{
			this.GainNode.connect(this.SideGainNode);

		} else {
			this.GainNode.disconnect();
		}
	}
}

function Image()
{
	Img = "";
	ImgNeg = "";
	ImgCurrent = "";
}

//------ Convolver Class

function Convolver()
{
	this.Source     = null;
	this.Volume     = 1.0;
	this.IsMuted    = false;
	this.GainNode   = null;
	this.IsOn       = false;
	this.BufferName = false;
	this.Instance   = null;

	//Init
    this.Instance = this.Context.createConvolver();
    this.GainNode = this.Context.createGain();
	this.Instance.connect(this.GainNode);

	this.SetBuffer = function(bufferName)
	{
		if(bufferName === "" ||
		  !this.Instance)
		{
			this.Instance.buffer = null;
			this.IsOn = false;
			return;
		}

		this.Instance.BufferName = bufferName;
		var buffer = this.Buffers[bufferName].Buffer;
		this.IsOn = true;
		this.Instance.buffer = buffer;
	}

	this.Mute = function()
	{
		this.muted = true;
		this.setGainVolume();
	}

	this.Unmute = function()
	{
		this.muted = false;
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

ConvolverBuffer = function(url)
{
	this.Url = url;
	this.Buffer = null;
}

function SoundAnalizer()
{
	this.Analyser = this.Context.createAnalyser();
	this.Analyser.fftSize = 1024;
    	this.Analyser.smoothingTimeConstant = 0.5;
    	this.ScriptProcessor = null;

    	if(!this.Context.createScriptProcessor){
       	this.ScriptProcessor = this.Context.createJavaScriptNode(1024, 2, 2);
    	} else {
       	this.ScriptProcessor = this.Context.createScriptProcessor(1024, 2, 2);
    	}
    	this.Analyser.connect(this.ScriptProcessor);
    	this.ScriptProcessor.connect(this.Context.destination);
    	this.visualizers = [];

    	var SoundAnalizerInst = this;

    	this.ScriptProcessor.onaudioprocess = function(e)
    	{
    		var channelData = e.inputBuffer.getChannelData(0);
    		SoundAnalizerInst.visualizers.forEach(function(visualizer, i, arr) {
			visualizer(channelData);
		});
    	}

    	this.AddVisualizer = function(visualizer)
    	{
    		this.visualizers.push(visualizer);
    	}
}

function Compressor()
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

Side.prototype = new WebApiBase();
Sound.prototype = new WebApiBase();
Convolver.prototype = new WebApiBase();
Library.prototype = new WebApiBase();
SoundAnalizer.prototype = new WebApiBase();
Compressor.prototype = new WebApiBase();