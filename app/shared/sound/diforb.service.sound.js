(function(){
	var services = angular.module('diforb.services');

	services.factory('soundService',soundService);
	soundService.$inject = ['$resource','DiforbConstans'];
	function soundService ($resource, DiforbConstans){
		var url = DiforbConstans.baseApiUrl + '/api/file/buffer/:categoryId/:soundId';

		this.getFileList = getFileList;
		this.getSoundBuffer = $resource(url, {});
		this.getSoundUrl = getSoundUrl;

		this.currentSound = {
			id: "",
			categoryId: ""
		};

		function getSoundUrl(soundId){
			var soundUrl = DiforbConstans.baseApiUrl + '/api/file/buffer/' + this.currentSound.categoryId + "/";
			if(soundId){
				soundUrl += soundId;
			}else{
				soundUrl += this.currentSound.id;
			}
			return soundUrl;
		}
		function getFileList(soundId,categoryId){
			var fileListUrl = DiforbConstans.baseApiUrl + '/api/file/list/' + categoryId + "/" + soundId;
			return $resource(fileListUrl, {});
		}
		return this;
	};

})();