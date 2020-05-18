function Convolver(contex)
{
	this.context = contex;
	this.source = null;
	this.volume = 1.0;
	this.muted = false;

	this.instance = null;
	this.convolverGainNode = null;
	this.isOn = false;

	this.init();
}

//--------- Functions   ----------------

Convolver.prototype.init = function()
{
    this.instance = this.context.createConvolver();
    this.gainNode = this.context.createGain();
	this.instance.connect(this.gainNode);
	this.setGainVolume();    
}

Convolver.prototype.setBuffer = function(buffer)
{
	if(!this.instance)
	{
		return;
	}

	if(buffer === "")
	{
		this.isOn = false;
		this.instance.buffer
	} else
	{
		this.isOn = true;
		this.instance.buffer = buffer;
	}
}

Convolver.prototype.mute = function()
{
	this.muted = true;
	this.setGainVolume();
}

Convolver.prototype.unmute = function()
{
	this.muted = false;
	this.setGainVolume();
}

Convolver.prototype.setVolume = function(val)
{
	this.volume = val;
	this.setGainVolume();
}

Convolver.prototype.setGainVolume = function()
{
	if(this.gainNode)
	{
		this.gainNode.gain.value = this.muted ? 0 : this.volume;
	}
}