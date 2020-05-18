(function(){
	angular.module('diforbApp')
	.directive('diforbMenu', function ()
	{
		var directive = {
			restrict: 'E',
			link: link,
			templateUrl: 'app/shared/menu/diforb.view.menu.html',
			controllerAs: 'dm',
			controller: ['$scope', '$state', '$document', '$timeout', 'preloaderService',
				function($scope, $state, $document, $timeout, preloaderService) {

				var dm = this,
					body = $document.find('body');

				dm.transitionLink = _transitionLink;
				function _transitionLink($event) {
					var cur 	= $event.target,
						d = angular.element(cur).data('sref');

					preloaderService.on({
						speedIn : 1000,
						easingIn : mina.easeinout
					});

					$timeout( function() {

						body.removeClass('menu-active loaded');

						$state.transitionTo(d, false);
					}, 1000);
				}
				//Aplication,click Menu any library(ng-class: active, filter)
				dm.menuActive = false;
				dm.openMenuLib = function() {
					dm.menuActive = true;
					body.addClass('menu-active');
					if ($scope.playButton.hasClass('paused')) $scope.btnPlayClick();
				}
				dm.closeMenuLib = function() {
					if (dm.menuActive == true) {
						dm.menuActive = false;
						body.removeClass('menu-active');
						return
					} else {
						return
					}
				}
				//video tutorial
				dm.isVideoTutorial = true;
				dm.closeVideoTutorial = closeVideoTutorial;
				function closeVideoTutorial($event) {
					var e = angular.element($event.target).parent().find('video');
					dm.isVideoTutorial = true;
					e[0].pause()
				}
				//HOW IT WORKS
				// dm.isHowitworks = false;
				// dm.clickHowitworks = function() {
				// 	return !dm.isHowitworks ? dm.isHowitworks = true : dm.isHowitworks = false;
				// }
				dm.openVideoTutorial = function() {
					dm.isVideoTutorial = false
				}
			}]
		};
		return directive;
		function link(scope, element, attrs) {

			resizeWindow();
			function resizeWindow(){
				var e = angular.element(element),
       				a = e.find('.dashboard--menu--links ul'),
					w = e.find('div.dashboard--menu'),
					o = window.innerHeight,
					h = w.height(),
					p;

				if (o > h) {
					p = (o - h)/2;
					a.css({
					      'padding-top': p +'px',
					      'padding-bottom': p +'px'
					});
				}
			}
			window.addEventListener('resize', function(){
				resizeWindow();
			});
		}
	});
})();