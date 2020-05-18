(function(){
	var app = angular.module('diforbApp');

	app.directive('diforbLibrary', function()
	{
		var directive = {
			restrict: 'A',
			controller: ['$scope', '$window', '$document', '$timeout',
				function($scope, $window, $document, $timeout) {

				var BV = $document.find('#big-video-wrap');
				if (BV) BV.css('display', 'none');

				$scope.resetCategory = [];
				$scope.imageCategory = [];
				$scope.categories = [];
				$scope.elem_ctgr = [];
				$scope.subnames = [];
				$scope.soundsList = [];
				$scope.sounds = [];
				$scope.rangeControls = [];
				$scope.pitchControls = [];
				$scope.isActiveSound = {
					isLeft: false,
					isRight: false
				};

				$scope.playButton;
				$scope.getitButton;
				$scope.btnPlayClick;

				$scope.runBounce = runBounce;
				function runBounce()
				{

					var left = $scope.imageCategory[0],
						right = $scope.imageCategory[1];

					if ($scope.isActiveSound.isLeft
						&& !$scope.isActiveSound.isRight) {
						runBounceElement(right)
					} else if ($scope.isActiveSound.isRight
						&& !$scope.isActiveSound.isLeft) {
						runBounceElement(left)
					} else if (!$scope.isActiveSound.isLeft
						&& !$scope.isActiveSound.isRight) {
						runBounceElement(left);
						runBounceElement(right)
					}

					function runBounceElement(elem) {
						elem.addClass('bounce');
						$timeout( function() {
							elem.removeClass('bounce');
						},1000);
						return;
					}
				}


			}]
		}
		return directive;
	});

	app.directive('diforbAplication', function($timeout)
	{
		var directive = {
			templateUrl: 'app/components/aplication/diforb.view.aplication.html',
			restrict: 'E',
			controller: ['$scope', '$document', '$timeout', '$location', 'webAudioService', 'radioBtnService', 'pitchKnobService', 'sliderRangeService', 'saverService', 'preloaderService', '$q', 'DiforbConstans', 'AuthService', 'payPalPdt', 'hotkeys',
				function($scope, $document, $timeout, $location, webAudioService, radioBtnService, pitchKnobService, sliderRangeService, saverService, preloaderService, $q, DiforbConstans, AuthService, payPalPdt, hotkeys) {

				var dApl = this;
				dApl.isAuthenticated = AuthService.isAuthenticated();

				$scope.btnPlayClick = btnPlayClick;
				$scope.btnGetItClick = btnGetItClick;
				$scope.reverBtnClick = reverBtnClick;

				$scope.siderTopLeftSlide = siderTopLeftSlide;
				$scope.siderTopRightSlide = siderTopRightSlide;

				$scope.pitchLeftChange = pitchLeftChange;
				$scope.pitchRightChange = pitchRightChange;

				$scope.sliderReverLeftChange = sliderReverLeftChange;
				$scope.sliderReverRightChange = sliderReverRightChange;

				$scope.getItProgressVal = 0;

				$scope.isPlaying = false;
				$scope.isDownload = false;

				$scope.downloadSound = downloadSound;

				$q.all([getRadionBtnLibs(), getPitchKnob(), getSliderRange()]).then( function () {
					$timeout( function() {
						$document.find('body').addClass('loaded')
					}, 2000)
				});

				hotkeys.bindTo($scope).add({
					combo: 'space',
					description: 'press key Space',
					callback: function() {
						btnPlayClick()
					}
    				});

				function getRadionBtnLibs(){
					$scope.radiobtns = radioBtnService.query();
					return $scope.radiobtns.$promise;
				};

				function getPitchKnob(){
					$scope.pitchs = pitchKnobService.query();
					return $scope.pitchs.$promise;
				};

				function getSliderRange(){
					$scope.sliders = sliderRangeService.query();
					return $scope.sliders.$promise;
				};

				function btnPlayClick(){
					if ($scope.isActiveSound.isLeft
						|| $scope.isActiveSound.isRight) {
						$scope.playButton.toggleClass('paused');
					} else {
						$scope.runBounce();
					};

					if ($scope.playButton.hasClass('paused')) {
						webAudioService.library.Stop();
						webAudioService.library.Play();
						$scope.isPlaying = true;
						angular.forEach($scope.elem_ctgr, function(value, key) {
							var e = value.find('.ul-sound li');
							if (e.hasClass('active')) {
								value.addClass('play-category-now');
								// return
							}
						})
					} else {
						webAudioService.library.Stop();
						$scope.isPlaying = false;
						angular.forEach($scope.elem_ctgr, function(value, key) {
							if (value.hasClass('play-category-now'))
								value.removeClass('play-category-now');
						})
					}
				};

				function btnGetItClick(){
					var rand = function() {
						return Math.random().toString(36).substr(2);
					};

					if (!$scope.isActiveSound.isLeft && !$scope.isActiveSound.isRight) {
						$scope.runBounce();
						return
					}

					if (webAudioService.library.IsPlaying) {
						$scope.btnPlayClick();
					}

					// ToDo:  Check for registration
					if (!saverService || !webAudioService || !webAudioService.library) {
						console.log('Something wrong with saverService or webAudioService or webAudioService.library');
						return
					}
					if (!dApl.isAuthenticated) {
						$scope.showModalAuthorize = true;
						$scope.closeModalAuthorize = function(){
							$scope.showModalAuthorize = false
						}
						return
					} else {
						if ($scope.isFree) {
							downloadSound()
						} else {
							$scope.itemNumber = rand() + rand();
							$scope.itemName  = webAudioService.library.Name + "_" + webAudioService.soundNamePrefix;
							var hostPort = $location.protocol() + "://" + $location.host() + ":" + $location.port();
							window.$windowScope = $scope;
							var externalProviderUrl = hostPort + "/payment/paypal/paypal.html";
							//var externalProviderUrl = "http://app-test.diforb.com/payment/paypal/paypal.html";
							var payPalWindow = window.open(externalProviderUrl, "PayPal payment", "location=1,status=0,width=1000,height=750");
						}
					}
				}

				function downloadSound(params) {
					if (params && params.tx) {
						var payPalPdtObj = new payPalPdt();
						payPalPdtObj.un = AuthService.authentication.userName;
						payPalPdtObj.tx = params.tx;
						payPalPdtObj.$save();
					}

					$scope.isDownload = true;
					$timeout( function() {
						$scope.isDownload = false;
						saverService.saver.CallBackAfterRecord = function() {};
						saverService.saver.showPercent = changeDownloadPercents;
						saverService.save();
					}, 4700);
				}

				function reverBtnClick($event) {

					var cur = angular.element($event.currentTarget),
						cur_name = angular.element(cur).attr('name'),
						isLeft = cur.attr('name') == 'player_reverb_left';

					if (!$scope.isActiveSound.isLeft
						&& !$scope.isActiveSound.isRight) {
						$scope.runBounce();
						return
					} else if ($scope.isActiveSound.isLeft
						&& !$scope.isActiveSound.isRight) {
						if (isLeft) {
							reverbOn();
							// $scope.runBounce();
							return
						} else {
							$scope.runBounce();
							return
						}
					} else if (!$scope.isActiveSound.isLeft
						&& $scope.isActiveSound.isRight) {
						if (!isLeft) {
							reverbOn();
							// $scope.runBounce();
							return
						} else {
							$scope.runBounce();
							return
						}
					} else {
						reverbOn();
						return
					}

					function reverbOn() {
						if (cur.attr('checked') == 'checked') {
							cur.removeAttr('checked');
							cur.parents('.radio-holder:eq(0)').removeClass('checked');
						} else {
							angular.element(':radio[name="' + cur_name + '"]').each(function(){
								angular.element(this).removeAttr('checked');
								angular.element(this).parents('.radio-holder:eq(0)').removeClass('checked');
							})
							cur.attr('checked','checked').parents('.radio-holder:eq(0)').addClass('checked');
						}

						var reverVal = cur.attr('checked') ? cur.attr('value') : '',
							side = null;

						if (isLeft) {
							side = webAudioService.library.LeftSide;
						} else {
							side = webAudioService.library.RightSide;
						}

						if (side != null) {
							side.SetConvolver(reverVal);
						}
					}
				};

				function siderTopLeftSlide(volume) {
					if (!webAudioService ||
						!webAudioService.library ||
						!webAudioService.library.LeftSide)
					{
						console.log('TopLeftSlide: webAudioService is not set up');
						return
					}
					webAudioService.library.LeftSide.SetVolume(volume * 2 / 100);

				}

				function siderTopRightSlide(volume) {
					if (!webAudioService ||
						!webAudioService.library ||
						!webAudioService.library.RightSide)
					{
						console.log('TopLeftSlide: webAudioService is not set up');
						return;
					}
					webAudioService.library.RightSide.SetVolume(volume * 2 / 100);
				}

				function pitchLeftChange(val) {
					webAudioService.library.LeftSide.SetPitch(convertPitchValue(val));
				}

				function pitchRightChange(val) {
					webAudioService.library.RightSide.SetPitch(convertPitchValue(val));
				}

				function sliderReverLeftChange(reverbVolume) {
					webAudioService.library.LeftSide.Convolver.SetVolume(reverbVolume);
				}

				function sliderReverRightChange(reverbVolume) {
					webAudioService.library.RightSide.Convolver.SetVolume(reverbVolume);
				}

				function convertPitchValue(val) {
					return 0.1 * val + 0.5;
				}

				function changeDownloadPercents(val) {
					$scope.getItProgressVal = val;
				}
			}]

		}
		return directive;
	});

	app.directive('diforbPlayer', function($window)
	{
		var directive = {
			restrict: 'A',
			link: link
		}
		return directive;
		function link(scope, element, attrs){
			angular.element($window).bind('resize',function(){
				scope.$apply(function(){
					contentCenter()
				})
			});
			contentCenter();
			function contentCenter(){
				var win = $window.innerHeight,
					con = element.height(),
					indent = (win - con)/2;
				if(indent <= 10) indent = 10;
				element.css({
					'padding-top':indent,
					'padding-bottom':indent
				});
			}
		}
	});

	app.directive('playButton', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}
		return directive;
		function link(scope, element, attrs) {
			scope.playButton = element;
			return scope.playButton
		}
	});


	app.directive('getitButton', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}
		return directive;
		function link(scope, element, attrs) {
			scope.getitButton = element;
			return scope.playButton;
		}
	});

	app.directive('pitchControll', function($timeout)
	{
		var directive  = {
			restrict: 'A',
			link: link
		}
		return directive;
		function link(scope, element, attrs) {

			scope.pitchControls.push(element);

			$timeout( function() {
				scope.pitchControls[0].knob({
					min: 0,
					max: 10,
					width: 40,
					height: 40,
					cursor: true,
					lineCap: 'round',
					bgColor: 'none',
					fgColor:  '#919395',
					thickness: .3,
					displayInput: false,
					angleOffset: -125,
					angleArc: 250,
					step: 1,
					'release': function(v){
						if (v == 5) {
							scope.pitchControls[0].trigger('configure',{
								fgColor: '#919395'
							})
						} else {
							scope.pitchControls[0].trigger('configure',{
								fgColor: '#2eca75'
							})
						}
						if (v < 6 && v > 4) {
							scope.pitchControls[0].trigger('configure',{
								step: 1
							});
						} else {
							scope.pitchControls[0].trigger('configure',{
								step: 0.1
							});
						}
						scope.pitchLeftChange(v);
					},
					'change' : function (v) {
						scope.pitchLeftChange(v)
					}
				});
				scope.pitchControls[1].knob({
					'min': 0,
					'max': 10,
					width: 40,
					height: 40,
					cursor: 1,
					lineCap: 'round',
					bgColor: 'none',
					fgColor: '#919395',
					thickness: .3,
					displayInput: false,
					angleOffset: -125,
					angleArc: 250,
					step: 0.1,
					'release': function(v) {
						if (v == 5) {
							scope.pitchControls[1].trigger('configure',{
								fgColor: '#919395'
							})
						} else {
							scope.pitchControls[1].trigger('configure',{
								fgColor: '#2eca75'
							})
						}
						if (v < 6 && v > 4) {
							scope.pitchControls[1].trigger('configure',{
								step: 1
							})
						} else {
							scope.pitchControls[1].trigger('configure',{
								step: 0.1
							})
						}
						scope.pitchRightChange(v);
					},
					'change' : function (v) {
						scope.pitchRightChange(v)
					}
				});
				element.mousedown(function(){
					angular.element(this).addClass('active');
				});
				element.mouseup(function(){
					element.removeClass('active');
				});
			}, 100);
		}
	});

	app.directive('rangeControll', function($timeout)
	{
		var directive = {
			restrict: 'A',
			link: link
		}
		return directive;
		function link(scope, element, attrs) {

			scope.rangeControls.push(element);

			$timeout( function() {
				if (scope.rangeControls.length) {
					var volume_left = [-2,-2,-2,-2,-2, -2,-2,-2,-2,-2,
									-2,-2,-2,-2,-2, -2,-2,-2,-2,-2,
									-2,-2,-2,-2,-1, -1,-1,0,0,0,
									0,1,1,1,2, 2,2,3,3,4,
									4,5,6,6,7, 8,9,10,10,10,
									10,10,10,10,10, 13,14,15,16,17,
									18,19,20,21,22, 23,24,25,26,27,
									28,29,30,31,32 ,33,34,35,37,39,
									40,41,42,43,45, 46,48,49,51,53,
									54,56,57,59,60, 62,64,66,67,68],
						volume_right = [0,0,0,0,0, 0,0,0,0,0,
									0,0,0,0,0, 0,0,0,0,0,
									0,0,0,0,0, 0,0,1,1,2,
									2,2,3,3,3, 4,4,5,6,6,
									6,6,7,7,8, 9,11,11,11,11,
									11,11,11,11,11, 15,16,17,18,19,
									19,20,21,22,23, 24,25,26,27,27,
									28,29,30,31,32, 33,34,36,37,38,
									39,41,42,43,45, 47,48,50,51,53,
									55,56,58,59,61, 63,65,65,67,68],
						timeshift = [26,26,26,27,27, 27,28,29,29,29,
								30,30,31,31,31, 31,31,31,31,32,
								32,33,33,34,34, 34,34,34,34,35,
								35,35,35,35,35, 35,35,35,35,35,
								35,35,35,35,35, 35,35,35,35,35,35],
						rever_left = [1,2,2,2,2, 3,3,4,4,5,
								6,6,7,7,8, 8,9,10,11,12,
								13,13,14,15,15, 16,17,17,18,18,
								19,19,20,20,21, 22,23,24,25,25,
								26,27,28,28,29, 30,31,32,33,34,
								35,36,37,38,38, 39,40,41,42,43,
								44,45,46,47,48, 48,49,50,51,52,
								53,54,55,56,57, 58,59,60,61,62,
								63,65,66,67,68, 70,71,72,73,75,
								76,77,78,80,82, 84,86,87,88,89,90],
						rever_right = [3,3,4,4,4, 4,4,5,5,6,
								6,7,8,9,10, 11,12,12,13,13,
								13,14,15,16,16, 17,18,18,19,20,
								21,21,22,22,23, 24,25,26,27,27,
								28,28,29,30,31, 32,33,34,35,35,
								36,36,37,38,39, 40,41,41,42,43,
								44,45,46,47,48, 49,50,51,52,53,
								54,55,56,57,58, 60,61,62,64,65,
								66,67,68,69,70, 71,73,74,76,77,
								78,79,80,82,84, 85,86,87,88,89,90];
					// initialization
					angular.forEach(scope.rangeControls, function(value, key) {
						var wrap = angular.element(value[0]);
						// LEFT SOUND VOLUME
						if (wrap.find('.slider-left-top').length) {
							wrap.find('.slider-left-top').slider({
								orientation: 'vertical',
								range: 'min',
								min: 0,
								max: 100,
								value: 50,
								disabled: true,
								create: function() {
									var handler =wrap.find( '.ui-slider-handle' ),
										cur = angular.element(this).slider('option','value');
									handler.append('<div class="ui-slider-handle-inner"><span></span></div>');
									handler.css('left', volume_left[cur]);
								},
								slide: function(event, ui) {
									var cur = ui.value,
										handler = wrap.find('.ui-slider-handle');
									if (cur > 45 && cur < 55) {
										cur = 50;
										wrap.addClass('default');
									} else {
										wrap.removeClass('default');
									}
									if (cur >2 && cur <= 95)
										handler.css('left', volume_left[cur]);
									if (cur <= 3) {
										wrap.addClass('blocked-bottom');
										cur = 0;
										handler.css({
											'left': volume_left[cur],
											'bottom': '3%'
										});
									} else {
										wrap.removeClass('blocked-bottom');
									}
									if (cur > 95){
										wrap.addClass('blocked-top');
										cur = 96;
										handler.css({
											'left': volume_left[cur],
											'bottom': '96%'
										});
									} else {
										wrap.removeClass('blocked-top');
									}
									scope.siderTopLeftSlide(cur);
								}
							});
							return true;
						}
						// RIGHT SOUND VOLUME
						if(wrap.find('.slider-right-top').length){
							wrap.find('.slider-right-top').slider({
								orientation: 'vertical',
								range: 'min',
								min: 0,
								max: 100,
								value: 50,
								disabled: true,
								create: function(){
									var handler = wrap.find('.ui-slider-handle'),
										cur = angular.element(this).slider('option','value');
									handler.append('<div class="ui-slider-handle-inner"><span></span></div>');
									handler.css('left', -volume_right[cur]);
								},
								slide: function(event, ui){
									var cur = ui.value,
										handler = wrap.find('.ui-slider-handle');
									if(cur > 45 && cur < 55){
										cur = 50;
										wrap.addClass('default');
									}else{
										wrap.removeClass('default')
									}
									if(cur >2 && cur <= 95)
										handler.css('left', -volume_right[cur]);
									if (cur <= 2){
										wrap.addClass('blocked-bottom');
										cur = 0;
										handler.css({
											'left': -volume_right[cur],
											'bottom':'3%'
										});
									} else
										wrap.removeClass('blocked-bottom');
									if (cur > 95) {
										wrap.addClass('blocked-top');
										cur = 96;
										handler.css({
											'left': -volume_right[cur],
											'bottom':'96%'
										});
									} else
										wrap.removeClass('blocked-top');
									scope.siderTopRightSlide(cur);
								}
							});
							return true;
						}
						// TIMESHIFT
						if (wrap.find('.slider-middle-top').length){
							wrap.find('.slider-middle-top').slider({
								range:'max',
								min: 0,
								max: 100,
								value: 50,
								disabled: true,
								create: function(){
									var handler = wrap.find('.ui-slider-handle'),
										cur = angular.element(this).slider('option','value');
									handler.append('<div class="ui-slider-handle-inner"><span class="tooltip-content">Coming soon</span></div>');
									handler.css('top', -timeshift[cur]);
								},
								slide: function(event, ui) {
									var cur = ui.value,
										handler = wrap.find('.ui-slider-handle');
									if(cur <= 45)
										handler.css('top', -timeshift[cur]);
									if (cur > 45 && cur < 55){
										cur = 50;
										wrap.addClass('default');
										handler.css('top', -timeshift[cur]);
									}else
										wrap.removeClass('default');
									if(cur >= 55)
										handler.css('top', -timeshift[100-cur]);
								},
								stop: function(event,ui){
									var cur = ui.value,
										handler = wrap.find('.ui-slider-handle');
									handler.animate({
										top: '-35px',
										left: '50%'
									},300);
									cur = 50;
								}
							});
							return true;
						}
						// REVER LEFT
						if(wrap.find('.slider-left-bottom').length){
							wrap.find('.slider-left-bottom').slider({
								range:'max',
								min: 0,
								max: 100,
								value: 50,
								disabled: true,
								create: function() {
									var handler = wrap.find('.ui-slider-handle'),
										grad = wrap.find('.ui-slider-range');
									wrap.find('.ui-slider-handle').append('<div class="ui-slider-handle-inner"><span></span></div>');
									grad.css({'width':'50%'});
									handler.css({
										'left':'50%',
										'top': -rever_left[50]
									});
								},
								slide: function(event, ui) {
									var cur = ui.value,
										handler = wrap.find('.ui-slider-handle'),
										newCurrVal = (cur - 100) * -1,
										reverbVolume = newCurrVal / 100 * 2;
									handler.css('top', -rever_left[100-cur]);
									scope.sliderReverLeftChange(reverbVolume);
								}
							});
							return true;
						}
						// REVER RIGHT
						if(wrap.find('.slider-right-bottom').length ){
							wrap.find('.slider-right-bottom').slider({
								range:'min',
								min: 0,
								max: 100,
								value: 50,
								disabled: true,
								create: function() {
									var handler = wrap.find('.ui-slider-handle'),
										cur = angular.element(this).slider('option','value');
									handler.append('<div class="ui-slider-handle-inner"><span></span></div>');
									handler.css('top', -rever_right[cur]);
								},
								slide: function(event, ui) {
									var cur = ui.value,
										handler = wrap.find('.ui-slider-handle'),
										reverbVolume = cur / 100 * 2;
									handler.css('top', -rever_right[cur]);
									scope.sliderReverRightChange(reverbVolume);
								}
							});
						}
					});
				}

				element.find('a').on('mousedown', function(event) {
					var e = angular.element(event.target).parents('.range').hasClass('notActive');

					if (!scope.isActiveSound.isLeft
						&& !scope.isActiveSound.isRight) {
						scope.runBounce();
						return
					} else if (scope.isActiveSound.isLeft
						&& !scope.isActiveSound.isRight) {
						if (e) {
							scope.runBounce();
							return
						} else {
							return
						}
					}
				})
			}, 100);
		}
	});

})();