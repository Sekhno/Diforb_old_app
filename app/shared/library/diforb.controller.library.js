(function() {
	'use strict';

	var appCtrl = angular.module('diforb.controllers');

	appCtrl.controller('diforbLibraryCtrl', diforbLibraryCtrl);

	diforbLibraryCtrl.$inject = [
		'$location', 
		'$scope', 
		'$document', 
		'libraryService', 
		'$timeout', 
		'webAudioService', 
		'drawAudioWave', 
		'preloaderService'];
	
	function diforbLibraryCtrl(
		$location, 
		$scope, 
		$document, 
		libraryService, 
		$timeout,  
		webAudioService, 
		drawAudioWave, 
		preloaderService) 
	{
		var LIBRARY = $location.$$url.replace('/library/', '');

		getLibrary();

		drawAudioWave.handleChannelData();
		
		if (LIBRARY === 'interface') {
			$timeout( function() {
				recomend();
				function recomend() {
					var leftCtgr = document.querySelectorAll('div.left-side div.span-category');
					var rightCtgr = document.querySelectorAll('div.right-side div.span-category');

					function bounce(selector) {
			            		angular.element(selector).addClass('bounce');
			            		$timeout(function(){
			            			angular.element(selector).removeClass('bounce');
			            		},1000);
			      		}
					angular.element(rightCtgr[0]).addClass('recomend_1');
					angular.element(rightCtgr[1]).addClass('recomend_1');
					angular.element(rightCtgr[3]).addClass('recomend_2');
					angular.element(rightCtgr[2]).addClass('recomend_3');

					notRecomend();
					function notRecomend(){
						for(var i = 0; i < rightCtgr.length; i++){
							angular.element(rightCtgr[i]).css(
								'color','rgba(255,255,255,0.5)'
							);
						}
					}

					angular.element(leftCtgr[0]).on('click', function() {
						var r = angular.element(document).find('div.recomend_1');
						notRecomend();
						angular.element(r).css('color', 'rgba(255,255,255,1)');
						bounce(r);
					});
					angular.element(leftCtgr[1]).on('click', function(){
						var r = angular.element(document).find('div.recomend_1');
						notRecomend();
						angular.element(r).css('color', 'rgba(255,255,255,1)');
						bounce(r);
					});
					angular.element(leftCtgr[2]).on('click', function(){
						var r = angular.element(document).find('div.recomend_3');
						notRecomend();
						angular.element(r).css('color', 'rgba(255,255,255,1)');
						bounce(r);
					});
					angular.element(leftCtgr[3]).on('click', function(){
						var r = angular.element(document).find('div.recomend_2');
						notRecomend();
						angular.element(r).css('color', 'rgba(255,255,255,1)');
						bounce(r);
					});
				}
			}, 2000);
		}

		function getLibrary() {
			libraryService.getSidesByLibName(LIBRARY).query().$promise.then(function (result) {
				setLibrary(result)
			})
		};

		function setLibrary(libraries) {

			var library = libraries[0];

			$scope.author = library.author;
			$scope.isFree = library.isFree;
			$scope.price =  library.price;
			$scope.libSides = library.sides;

			webAudioService.setLibrary(library.name);
			webAudioService.library.SoundAnalizer.AddVisualizer(drawAudioWave.handleChannelData);

			angular.forEach($scope.libSides[0].soundGroups, function(soundGroup, key) {
				webAudioService.addLeftSound(soundGroup.name);
			});
			angular.forEach($scope.libSides[1].soundGroups, function(soundGroup, key) {
				webAudioService.addRightSound(soundGroup.name);
			});

			$scope.nameLibrary = library.name;

			preloaderService.off(2500)
		};
	}
}());