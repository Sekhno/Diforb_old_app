(function(){
	var app = angular.module('diforbApp');

	app.directive('diforbSound', function()
	{
		var directive = {
			restrict: 'E',
			templateUrl: 'app/shared/sound/diforb.view.sound.html',
			controllerAs: 'ds',
			controller: [ '$scope', '$window', '$document', '$timeout', 'soundService', 'webAudioService', 'DiforbConstans', function( $scope, $window, $document, $timeout, soundService, webAudioService, DiforbConstans)
			{

				this.clickSound = _clickSound;

				function _clickSound( $event, sound, soundPrefixData)
				{
					var cur = angular.element($event.currentTarget),
						category = cur.parents('div.sound-category'),
						square = cur.parent().find('div.sound-square'),
						allSounds = category.find('ul.ul-sound li'),
						parent = cur.parents('li.sub-category'),
						span = parent.find('div.span-sub-category'),
						dropSpan = cur.parents('div.category').find('a.dropdown-link').find('span'),
						li = cur.parents('li.category'),
						categories = category.find('li.category'),
						spanSubctr = category.find('div.span-sub-category');

					if ( sound.soundSide.isLeft ) {

						if ( !$scope.resetCategory[0].hasClass('active') ) {

							return

						} else {

							$scope.isActiveSound.isLeft = true;
							$scope.pitchControls[0].parents('.pitch').removeClass('filter-disable');
							$scope.imageCategory[0].find('i.current-sound').text(soundPrefixData.soundName);

							clickSoundActive()

						}
					} else {

						if ( !$scope.resetCategory[1].hasClass('active') ) {

							return

						} else {

							$scope.isActiveSound.isRight = true;
							$scope.pitchControls[1].parents('.pitch').removeClass('filter-disable');
							$scope.imageCategory[1].find('i.current-sound').text(soundPrefixData.soundName);

							clickSoundActive()

						}
					}

					square.css( 'top' , cur.index() * 23 + 'px' );
					spanSubctr.removeClass( 'current' );
					span.addClass( 'current' );

					if ( sound.icon )  dropSpan.attr( 'class', sound.icon );
					else  dropSpan.attr( 'class', sound.subIcon );


					if ( cur ) {

						$scope.getitButton.removeClass('notActive');
						allSounds.removeClass( 'active' );
						cur.addClass('active');

					}

					if ($scope.playButton.hasClass('paused')) $scope.btnPlayClick();
					//Spinner for loader sound
					square.addClass('animationSpinner');
					categories.removeClass('play-category-now');
					$window.activeSpinnerSound = function(){

						console.log('buffer load!');
						square.addClass('finishSpinner');
						li.addClass('play-category-now');

						$timeout( function() {

							square.removeClass('animationSpinner finishSpinner');
							$scope.btnPlayClick();

						}, 500);
					}

					// Set SoundNamePrefix
					var soundPrefix = soundPrefixData.categoryName + "_" +  soundPrefixData.subCategoryName + "_" + soundPrefixData.soundName;

					webAudioService.setSoundNamePrefix(soundPrefix);

					// Get File List
					soundService.getFileList(sound.soundId, sound.categoryId)
						.query().$promise.then( function(fileList)
					{

						var libSide = undefined;

						if (sound.soundSide.isLeft) {
							libSide = webAudioService.library.LeftSide;
						} else {
							libSide = webAudioService.library.RightSide;
						}

						var webAudioSound = libSide.Sounds[sound.soundGroupName];

						webAudioSound.AddFiles("", fileList);
						webAudioSound.Read();
					});
				};

				function clickSoundActive()
				{
					angular.forEach($scope.rangeControls, function(value, key)
					{

						var e = angular.element(value[0]).find('.slider-range'),
							p = angular.element(value[0]);

						if ( $scope.isActiveSound.isLeft && !$scope.isActiveSound.isRight) {

							if (e.hasClass('slider-left-top') || e.hasClass('slider-left-bottom')) {

								activationControll()

							}

						} else if ($scope.isActiveSound.isRight && !$scope.isActiveSound.isLeft) {

							if (e.hasClass('slider-right-top') || e.hasClass('slider-right-bottom')) {

								activationControll()

							}
						} else {
							activationControll()
						}

						function activationControll() {

							p.removeClass('notActive');
							e.slider('option', 'disabled', false);

						}
					});
				}
			}]
		}
		return directive;
	});

	app.directive('soundList',function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link(scope, element, attrs) {
			scope.soundsList.push(element);
			var f = scope.soundsList[0];

			element.slideUp('fast');

			f.slideDown('fast').addClass('active fadeOut');
			f.parents('li.sub-category').find('div.span-sub-category').addClass('current');
		}
	});

	app.directive( 'soundElem',function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs) {
			scope.sounds.push(element);
		}
	});

	app.directive( 'hoverSound', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs) {

			element.on('mouseover', function(event) {
				var cur = this,
					span = cur.querySelector('span'),
					cur = angular.element(cur),
					span = angular.element(span);

				if (span.width() > 90) {
					span.css({'margin-left': -(span.width() - 90) + 'px'})
				}
				cur.on('mouseout', function() {
					span.css({'margin-left': '0px'})
				});
			});
		}
	});

})();