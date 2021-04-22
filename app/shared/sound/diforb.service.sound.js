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
		function getFileList(libraryId, categoryId, subCategoryId, soundId){
			// var fileListUrl = DiforbConstans.baseApiUrl + '/api/file/list/' + categoryId + "/" + soundId;
			var fileListUrl = 'backend/storage/Sounds/' + libraryId + '/' + categoryId + '/' + subCategoryId + '/' + soundId + '.wav';
			return $resource(fileListUrl, {});
		}
		return this;
	};

})();