(function(){
	var services = angular.module('diforb.services');

	services.factory('libraryService',libraryService);
	libraryService.$inject = ['$resource','DiforbConstans'];
	function libraryService($resource,DiforbConstans){

		this._currentLib = null;
		this.currentLibId = null;
		this.currentLibName = null;
		this.currentLib = getCurrentLib;
		this.setCurrentLib = setCurrentLib;
		this.getSides = getSides;
		this.getSidesByLibName = getSidesByLibName;
		this.getLibraryDescription = getLibraryDescription;

		return this;

		function getCurrentLib(){
			if(this._currentLib == null){
				var url = DiforbConstans.baseApiUrl + '/api/library/' + this._currentLibId;
				var library = $resource(url);
				library.query().$promise.then(function (result) {
					this._currentLib = result;
					return this._currentLib;
				});
			}else{
				return this._currentLib;
			}
		}

		function setCurrentLib(id){
			this.currentLibId = id;
			getLib().$promise.then(function(result){
				this._currentLib = result;
			});
		}

		function getLib(){
			var url = DiforbConstans.baseApiUrl + '/api/library/' + this.currentLibId;
			return $resource(url);
		}

		function getLibByName(name){
			var url = DiforbConstans.baseApiUrl + '/api/library/name/';
			if(name){
				url = url + name;
			}else{
				url = url + this.currentLibName;
			}
			return $resource(url);
		}

		function getLibById(id){
		    var url = DiforbConstans.baseApiUrl + '/api/library/' + id;
			return $resource(url);
		}

		function getSides(){
			var url = DiforbConstans.baseApiUrl + "/api/library/" + this.currentLibId + "/sides";
			return $resource(url, {});
		}

		function getSidesByLibName(name){
			// var url = DiforbConstans.baseApiUrl + "/api/library/name/" + name + "/sides";
			var url = 'backend/library/' + name + '/data.json';
			return $resource(url, {});
		}

		function getLibraryDescription(){
			// var url = DiforbConstans.baseApiUrl + "/api/library/descriptions/";
			var url = 'app/shared/library/descriptions.json';
			return $resource(url, {});
		}
	};

	services.factory('radioBtnService',radioBtnService);
	radioBtnService.$inject = ['$resource'];
	function radioBtnService($resource){
		var url = 'app/components/aplication/radiobtns.json';
		return $resource(url, {});
	};

	services.factory('pitchKnobService',pitchKnobService);
	pitchKnobService.$inject = ['$resource'];
	function pitchKnobService($resource){
		var url = 'app/components/aplication/pitchs.json';
		return $resource(url, {});
	};

	services.factory('sliderRangeService',sliderRangeService);
	sliderRangeService.$inject = ['$resource'];
	function sliderRangeService($resource){
		var url = 'app/components/aplication/sliders.json';
		return $resource(url, {});
	};

	services.service('drawAudioWave',drawAudioWave);
	function drawAudioWave(){
		this.handleChannelData = function(channelData){
			var waveEl = document.getElementById('wave');

			if(waveEl == null) return;
			var	ctx    = waveEl.getContext('2d');
			// clear the current state
			ctx.clearRect(0, 0, 204, 204);

			for(var i = 0; i < 51; i++){
				var z = Math.round(channelData.length / 68) * i,
					x1 = i * 4,
					y = Math.abs(channelData[z]) * 504;

				if(i >= 0 && i <=10){
					y += Math.round(y * 0.2);
				}else{
					if(i > 10 && i <= 20){
						y += Math.round(y * 0.5);
					}else{
						if(i > 20 && i <= 25){
							y += y;
						}else{
							if(i == 26){
								y += y;
							}else{
								if(i > 26 && i <= 31){
									y += y;
								}else{
									if(i > 31 && i <=41){
										y += Math.round(y * 0.5);
									}else{
										if(i > 41 && i <= 51){
											y += Math.round(y * 0.2);
										}
									}
								}
							}
						}
					}
				}

				y1 = 78 - Math.abs(y / 2);
				// set the fill style Gradient
				var gradient = ctx.createLinearGradient(0, 0, 0, y);

				gradient.addColorStop(0, '#ccf5fb');
				gradient.addColorStop(0.45, '#FFFFFF');
				gradient.addColorStop(0.55, '#FFFFFF');
				gradient.addColorStop(1, '#ccf5fb');

				ctx.fillStyle = gradient;
				ctx.fillRect(x1, y1, 3, y);
			}
		};
	};



})();